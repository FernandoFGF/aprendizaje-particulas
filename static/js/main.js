document.addEventListener('DOMContentLoaded', function() {
    if (typeof bootstrap !== 'undefined') {
        const imagesData = JSON.parse(document.getElementById('images-data').textContent);
        const urlParams = new URLSearchParams(window.location.search);

        const showInteraction = urlParams.get('interaction') === 'true';
        const showFlavor = urlParams.get('flavor') === 'true';
        const showMode = urlParams.get('mode') === 'true';
        const showParticles = urlParams.get('particles') === 'true';

        if (imagesData.length > 0) {
            const navigator = new ImageNavigator(imagesData);
            window.currentImageNavigator = navigator;

            const submitBtn = document.getElementById('submit-btn');
            if (submitBtn) {
                submitBtn.addEventListener('click', function() {
                    const userAnswers = navigator.answerValidator.userAnswers;
                    const quizResults = new QuizResults(
                        userAnswers,
                        imagesData,
                        showInteraction,
                        showFlavor,
                        showMode,
                        showParticles
                    );
                    quizResults.showResults();
                });
            }
        }
    } else {
        console.error('Bootstrap is not loading properly.');
    }
});