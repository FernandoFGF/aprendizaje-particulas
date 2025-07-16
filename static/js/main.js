document.addEventListener('DOMContentLoaded', function() {
    if (typeof bootstrap !== 'undefined') {
        const imagesData = JSON.parse(document.getElementById('imagenes-data').textContent);
        if (imagesData.length > 0) {
            new ImageNavigator(imagesData);
        }
    } else {
        console.error('Bootstrap no está cargado correctamente');
    }
});