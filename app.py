import os
from datetime import datetime
from flask import Flask, render_template, send_from_directory, request, make_response, session, redirect, url_for, flash
from functools import wraps
from config.config import Config
from particles_testing_db.particle_dao import ParticleDAO

config = Config()

app = Flask(__name__)

app.secret_key = config.secret_key
if config.session_cookie_secure:
    app.config['SESSION_COOKIE_SECURE'] = True

HOURS = 8
MINUTES = 0
SECONDS = 0
INACTIVITY_TIMEOUT_SECONDS = (HOURS * 3600) + (MINUTES * 60) + SECONDS

VALID_USERNAME = 'estudiante'
VALID_PASSWORD = 'neutrino-2025'
app_title = 'Conceptos y definiciones'

IMAGES_DIR = config.images_dir

@app.context_processor
def inject_config():
    return {
        'BASE_URL': config.base_url,
        'SERVE_IMAGES_VIA_FLASK': config.serve_images_via_flask
    }


@app.before_request
def check_session_activity():
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
        return redirect(url_for('home'))
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
            return redirect(url_for('home'))
        else:
            flash('Credenciales incorrectas. Por favor, inténtalo de nuevo.', 'danger')
    return render_template('login.html', title='Inicio de Sesión')


@app.route('/logout')
def logout():
    session.clear()  # Limpia toda la sesión.
    flash('Has cerrado la sesión.', 'info')
    return redirect(url_for('login'))


@app.route('/index.html')
@login_required
def home():
    return render_template('index.html', title=app_title)


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

    filtered_images = ParticleDAO.get_filtered_images(
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
        all_particles = ParticleDAO.get_all_particles()

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


if __name__ == '__main__':
    print(f"Iniciando aplicación con configuración: {config.env}")
    print(f"BASE_URL: {config.base_url}")
    print(f"SERVE_IMAGES_VIA_FLASK: {config.serve_images_via_flask}")
    app.run(debug=config.debug, host='0.0.0.0', port=5000)
