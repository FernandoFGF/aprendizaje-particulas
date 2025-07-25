class ImageNavigator {
    constructor(images, currentIndex = 0) {
        this.images = images;
        this.currentIndex = currentIndex;
        this.answerValidator = new AnswerValidator();
        this.zoomInstance = null;
        this.initElements();
        this.setupEventListeners();
        this.updateUI(true);
    }

    initElements() {
        this.elements = {
            zoomImage: document.getElementById('zoom-image'),
            questionNumber: document.getElementById('question-number'),
            totalQuestions: document.getElementById('total-questions'),
            progressBar: document.getElementById('progress-bar'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn')
        };
    }

    setupEventListeners() {
        this.elements.prevBtn.addEventListener('click', () => this.navigate(-1));
        this.elements.nextBtn.addEventListener('click', () => this.navigate(1));
    }

    navigate(direction) {
        if (direction === 1 && this.elements.nextBtn.disabled) {
            return;
        }

        const newIndex = this.currentIndex + direction;
        if (newIndex >= 0 && newIndex < this.images.length) {
            this.currentIndex = newIndex;

            const isNewForwardNavigation = direction === 1 && !this.answerValidator.hasAnswersForImage(this.images[newIndex].id);
            this.updateUI(isNewForwardNavigation);
        }
    }

    updateUI(forceDisable = false) {
        if (this.images.length === 0) {
            this.disableNavigation();
            return;
        }

        const image = this.images[this.currentIndex];
        const imgElement = this.elements.zoomImage;
        this.elements.zoomImage.src = `/imagen_externa/${encodeURIComponent(image.path)}`;
        this.elements.zoomImage.dataset.zoom = `/imagen_externa/${encodeURIComponent(image.path)}`;
        this.elements.questionNumber.textContent = this.currentIndex + 1;
        this.elements.totalQuestions.textContent = this.images.length;

        if (this.zoomInstance) {
            this.zoomInstance.destroy();
        }

        this.zoomInstance = new ImageZoom(imgElement, {
            zoomFactor: 3,
            lensSize: 200,
            borderWidth: 3,
            borderColor: '#fff',
            shadowBlur: 20,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
        });

        this.answerValidator.setCurrentImage(image.id, forceDisable);

        const progress = ((this.currentIndex + 1) / this.images.length) * 100;
        this.elements.progressBar.style.width = `${progress}%`;


        this.elements.prevBtn.disabled = this.currentIndex === 0;
        this.answerValidator.updateNextButtonState();
    }

    disableNavigation() {
        this.elements.prevBtn.disabled = true;
        this.elements.nextBtn.disabled = true;
    }

    updateNextButtonState() {
        const allSections = document.querySelectorAll('.classification-section:not(.hidden)');
        const allAnswered = Array.from(allSections).every(section => {
            return section.querySelector('input[type="radio"]:checked') !== null;
        });

        this.elements.nextBtn.disabled = !allAnswered;
    }
}