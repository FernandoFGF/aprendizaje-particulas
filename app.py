import os

from flask import Flask, render_template, send_from_directory, request, make_response
from particula_db.particle_dao import ParticleDAO


app = Flask(__name__)

app_title = 'Conceptos y definiciones'
IMAGES_DIR = r"/Users/ana/Documents/Imagenes_Aprendizaje"


@app.route('/')
@app.route('/index.html')
def home():
    return render_template('index.html', title=app_title)


@app.route('/imagen_externa/<filename>')
@app.route('/imagen_externa/<path:subfolder>/<filename>')
def serve_external_image(subfolder=None, filename=None):
    if subfolder is None:
        return send_from_directory(IMAGES_DIR, filename)
    else:
        return send_from_directory(os.path.join(IMAGES_DIR, subfolder), filename)


@app.route('/exercise.html')
def exercise():
    interaction = request.args.get('interaction', 'true') == 'true'
    flavor = request.args.get('flavor', 'true') == 'true'
    mode = request.args.get('mode', 'true') == 'true'
    count = request.args.get('count', '5')

    filtered_images = ParticleDAO.get_filtered_images(
        show_interaction=interaction,
        show_flavor=flavor,
        show_mode=mode,
        count=count
    )

    response = make_response(render_template(
        'exercise.html',
        current_image=filtered_images[0] if filtered_images else None,
        all_images=filtered_images,
        current_index=0,
        show_interaction=interaction,
        show_flavor=flavor,
        show_mode=mode
    ))

    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'

    return response


@app.route('/learn.html')
def learn():
    # Obtener todas las partículas para el modo aprender
    all_particles = ParticleDAO.get_all_particles()

    response = make_response(render_template(
        'learn.html',
        particles=all_particles
    ))

    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'

    return response


if __name__ == '__main__':
    app.run(use_debugger=False, use_reloader=False)