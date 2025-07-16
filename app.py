import os

from flask import Flask, render_template, send_from_directory, request
from particula_db.particle_dao import ParticleDAO
from particula_db.particle_image import Particle

app = Flask(__name__)

app_title = 'Conceptos y definiciones'
IMAGES_DIR = r"/Users/ana/Documents/Imagenes_Aprendizaje"


@app.route('/')
@app.route('/index.html')
def home():
    return render_template('index.html', title=app_title)


@app.route('/imagen_externa/<filename>')  # Ruta para imágenes en raíz
@app.route('/imagen_externa/<path:subfolder>/<filename>')  # Ruta para subcarpetas
def serve_external_image(subfolder=None, filename=None):
    if subfolder is None:
        # Caso cuando la imagen está en la raíz
        return send_from_directory(IMAGES_DIR, filename)
    else:
        # Caso cuando está en subcarpeta
        return send_from_directory(os.path.join(IMAGES_DIR, subfolder), filename)


@app.route('/exercise.html')
def exercise():
    # Obtener parámetros de filtrado
    interaction = request.args.get('interaction', 'true') == 'true'
    flavor = request.args.get('flavor', 'true') == 'true'
    mode = request.args.get('mode', 'true') == 'true'

    # Obtener imágenes filtradas
    filtered_images = ParticleDAO.get_filtered_images(show_interaction=interaction,
                                                         show_flavor=flavor,
                                                         show_mode=mode)
    # Pasar solo la primera imagen y la lista completa
    return render_template('exercise.html',
                           current_image=filtered_images[0] if filtered_images else None,
                           all_images=filtered_images,
                           current_index=0,
                           show_interaction=interaction,
                           show_flavor=flavor,
                           show_mode=mode)


if __name__ == '__main__':
    app.run(use_debugger=False, use_reloader=False)