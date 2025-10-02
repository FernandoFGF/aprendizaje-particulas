function loadBookContent() {
    fetch(window.appConfig.baseUrl + '/api/book-content')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            window.bookContent = data;
            if (typeof InteractiveBook !== 'undefined') {
                setTimeout(() => {
                    interactiveBookInstance = new InteractiveBook();
                }, 100);
            }
        })
        .catch(error => {
            console.error('Error loading book content:', error);
            alert('Error al cargar el contenido del libro. Por favor, recarga la página.');
        });
}

document.addEventListener('DOMContentLoaded', loadBookContent);