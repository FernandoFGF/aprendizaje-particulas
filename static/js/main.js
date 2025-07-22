document.addEventListener('DOMContentLoaded', function() {
    if (typeof bootstrap !== 'undefined') {
        const imagesData = JSON.parse(document.getElementById('imagenes-data').textContent);
        if (imagesData.length > 0) {
            const navigator = new ImageNavigator(imagesData);

            window.currentImageNavigator = navigator;

            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                submitBtn.addEventListener('click', function() {
                    const userAnswers = navigator.answerValidator.userAnswers;

                    const quizResults = new QuizResults(userAnswers, imagesData);
                    quizResults.showResults();
                });
            }
        }
    } else {
        console.error('Bootstrap is not loading properly.');
    }
});