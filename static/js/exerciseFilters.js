function setupExerciseFilters() {
    const urlParams = new URLSearchParams(window.location.search);

    ['interaction', 'flavor', 'mode'].forEach(section => {
        const element = document.getElementById(`${section}-section`);
        if (element) {
            element.classList.toggle('hidden', urlParams.get(section) !== 'true');
        }
    });

    if (window.currentAnswerValidator) {
        window.currentAnswerValidator.updateNextButtonState();
    }
}

document.addEventListener('DOMContentLoaded', setupExerciseFilters);