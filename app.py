import os
import json
from datetime import datetime, timedelta, date
from flask import Flask, render_template, send_from_directory, request, make_response, session, redirect, url_for, flash, jsonify
from functools import wraps
from config.config import Config
from particles_testing_db.particle_dao import TestingParticleDAO, LearningParticleDAO
import uuid
from particles_analytics_db.analytics_dao import AnalyticsDAO

config = Config()

app = Flask(__name__)

app.secret_key = config.secret_key
if config.session_cookie_secure:
    app.config['SESSION_COOKIE_SECURE'] = True

testing_dao = TestingParticleDAO()
learning_dao = LearningParticleDAO()
analytics_dao = AnalyticsDAO(config.get_database_config('analytics'))

HOURS = 8
MINUTES = 0
SECONDS = 0
INACTIVITY_TIMEOUT_SECONDS = (HOURS * 3600) + (MINUTES * 60) + SECONDS

VALID_USERNAME = config.valid_username
VALID_PASSWORD = config.valid_password
IMAGES_DIR = config.images_dir

def get_analytics_session_id():
    if 'analytics_session_id' not in session:
        session['analytics_session_id'] = str(uuid.uuid4())
    return session['analytics_session_id']


def get_client_ip():
    if request.headers.get('X-Forwarded-For'):
        return request.headers.get('X-Forwarded-For').split(',')[0]
    elif request.headers.get('X-Real-IP'):
        return request.headers.get('X-Real-IP')
    else:
        return request.remote_addr


def load_book_content():
    try:
        book_content_path = os.path.join(app.root_path, 'data', 'book_content.json')
        with open(book_content_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error al cargar el contenido teórico: {e}")
        return {
            "title": "Tecnología de las Cámaras de Proyección Temporal con Argón Líquido (LArTPCs)",
            "pages": []
        }


@app.context_processor
def inject_config():
    return {
        'BASE_URL': config.base_url,
        'SERVE_IMAGES_VIA_FLASK': config.serve_images_via_flask,
        'IMAGES_URL_PREFIX': config.images_url_prefix
    }


@app.before_request
def check_session_activity():
    if 'logged_in' in session:
        analytics_session_id = get_analytics_session_id()

        if 'connection_logged' not in session:
            analytics_dao.log_connection(
                session_id=analytics_session_id,
                user_ip=get_client_ip(),
                user_agent=request.headers.get('User-Agent')
            )
            session['connection_logged'] = True

        current_path = request.path

        if current_path == '/exercise.html' or current_path.startswith('/exercise.html?'):
            analytics_dao.log_page_visit(
                session_id=analytics_session_id,
                page_url=current_path
            )
        elif current_path == '/index' or current_path == '/':
            analytics_dao.log_page_visit(
                session_id=analytics_session_id,
                page_url=current_path
            )

    if 'logged_in' in session:
        last_activity_timestamp = session.get('last_activity_ts')
        if last_activity_timestamp:
            inactive_seconds = datetime.now().timestamp() - last_activity_timestamp
            if inactive_seconds > INACTIVITY_TIMEOUT_SECONDS:
                session.clear()
                return
        session['last_activity_ts'] = datetime.now().timestamp()


def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session:
            if request.path == url_for('check_session'):
                return 'Session expired', 401
            flash('Tu sesión ha expirado o no has iniciado sesión. Por favor, accede de nuevo.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)

    return decorated_function


@app.route('/check_session')
@login_required
def check_session():
    return '', 204


@app.route('/')
def root():
    if 'logged_in' in session:
        return redirect(url_for('main_page'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        if username == VALID_USERNAME and password == VALID_PASSWORD:
            session.clear()
            session['logged_in'] = True
            session['username'] = username
            session['last_activity'] = datetime.now().timestamp()
            flash('Has iniciado sesión correctamente.', 'success')
            return redirect(url_for('main_page'))
        else:
            flash('Credenciales incorrectas. Por favor, inténtalo de nuevo.', 'danger')
    return render_template('login.html', title='Inicio de Sesión')


@app.route('/logout')
def logout():
    session.clear()
    flash('Has cerrado la sesión.', 'info')
    return redirect(url_for('login'))


@app.route('/index')
@login_required
def main_page():
    return render_template('index.html')


@app.route('/classify.html')
@login_required
def home():
    return render_template('classify.html')


if config.serve_images_via_flask:
    @app.route('/imagen_externa/<filename>')
    @app.route('/imagen_externa/<path:subfolder>/<filename>')
    @login_required
    def serve_external_image(subfolder=None, filename=None):
        if subfolder is None:
            return send_from_directory(IMAGES_DIR, filename)
        else:
            return send_from_directory(os.path.join(IMAGES_DIR, subfolder), filename)


@app.route('/exercise.html')
@login_required
def exercise():
    interaction = request.args.get('interaction', 'true') == 'true'
    flavor = request.args.get('flavor', 'true') == 'true'
    mode = request.args.get('mode', 'true') == 'true'
    particles = request.args.get('particles', 'true') == 'true'
    count = request.args.get('count', '5')

    filtered_images = testing_dao.get_filtered_images(
        show_interaction=interaction,
        show_flavor=flavor,
        show_mode=mode,
        show_particles=particles,
        count=count
    )

    response = make_response(render_template(
        'exercise.html',
        current_image=filtered_images[0] if filtered_images else None,
        all_images=filtered_images,
        current_index=0,
        show_interaction=interaction,
        show_flavor=flavor,
        show_mode=mode,
        show_particles=particles
    ))

    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'

    return response


@app.route('/learn.html')
@login_required
def learn():
    try:
        all_particles = learning_dao.get_all_particles()

        response = make_response(render_template(
            'learn.html',
            particles=all_particles
        ))

        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'

        return response
    except Exception as e:
        print(f"Error in learn route: {e}")
        return f"Error: {e}", 500


@app.route('/api/quiz-completed', methods=['POST'])
@login_required
def quiz_completed():
    try:
        data = request.get_json()
        analytics_session_id = get_analytics_session_id()

        analytics_dao.log_quiz_completion(
            session_id=analytics_session_id,
            quiz_filters=data.get('filters', {}),
            score_percentage=data.get('score_percentage', 0),
            total_questions=data.get('total_questions', 0),
            correct_answers=data.get('correct_answers', 0)
        )

        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error logging quiz completion: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@app.route('/api/analytics/daily-stats')
@login_required
def daily_stats():
    try:
        target_date = request.args.get('date')
        if target_date:
            target_date = datetime.strptime(target_date, '%Y-%m-%d').date()

        connections = analytics_dao.get_daily_connections(target_date)
        quiz_stats = analytics_dao.get_quiz_completion_stats(target_date)
        exercise_visits = analytics_dao.get_exercise_visits(target_date)

        return jsonify({
            'date': target_date or date.today().isoformat(),
            'daily_unique_sessions': connections,
            'exercise_page_visits': exercise_visits,
            'quiz_completions': quiz_stats['total_completions'] if quiz_stats else 0,
            'average_score': float(quiz_stats['avg_score']) if quiz_stats and quiz_stats['avg_score'] else 0,
            'unique_quiz_users': quiz_stats['unique_sessions'] if quiz_stats else 0
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/analytics/detailed-stats')
@login_required
def detailed_stats():
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        if not start_date or not end_date:
            end_date = date.today()
            start_date = end_date - timedelta(days=7)
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()

        stats = analytics_dao.get_detailed_stats(start_date, end_date)
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/analytics')
@login_required
def analytics_dashboard():
    return render_template('analytics.html')


@app.route('/api/analytics/session-details')
@login_required
def session_details():
    try:
        target_date = request.args.get('date')
        if target_date:
            target_date = datetime.strptime(target_date, '%Y-%m-%d').date()
        else:
            target_date = date.today()

        details = analytics_dao.get_session_details(target_date)
        return jsonify(details)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/session-details')
@login_required
def session_details_page():
    return render_template('session_details.html')


if __name__ == '__main__':
    print(f"Iniciando aplicación con configuración: {config.env}")
    print(f"BASE_URL: {config.base_url}")
    print(f"SERVE_IMAGES_VIA_FLASK: {config.serve_images_via_flask}")
    app.run(debug=config.debug, host='0.0.0.0', port=5000)
