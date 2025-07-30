class AnswerValidator {
    constructor() {
        this.currentImageId = null;
        this.userAnswers = {};
        this.requiredSections = [
            'interaction-section',
            'flavor-section',
            'mode-section',
            'hi-section',
            'li-section',
            'photon-section',
            'electron-section'
        ];
        this.initEventListeners();
    }

    initEventListeners() {
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handleAnswerChange(e);
                this.updateNextButtonState();
            });
        });

        document.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.handleAnswerChange(e);
                this.updateNextButtonState();
            });
        });
    }

    handleAnswerChange(event) {
        const { name, value } = event.target;

        if (!this.currentImageId) return;

        if (!this.userAnswers[this.currentImageId]) {
            this.userAnswers[this.currentImageId] = {};
        }
        this.userAnswers[this.currentImageId][name] = value;
    }

    updateNextButtonState() {
        const nextBtn = document.getElementById('next-btn');
        const nextBtnWrap = document.getElementById('next-btn-wrapper')
        const submitBtn = document.getElementById('submit-btn');
        if (!nextBtn) return;

        const allAnswered = this.requiredSections.every(sectionId => {
            const section = document.getElementById(sectionId);
            if (!section || section.classList.contains('hidden')) return true;

            const radioName = section.querySelector('input[type="radio"]')?.name;
            if (radioName) {
                return section.querySelector('input[type="radio"]:checked') !== null ||
                    (this.userAnswers[this.currentImageId]?.[radioName] !== undefined);
            }

            const select = section.querySelector('select');
            if (select) {
                return select.value !== '' ||
                    (this.userAnswers[this.currentImageId]?.[select.name] !== undefined);
            }

            return false;
        });

        nextBtn.disabled = !allAnswered;
        this.setupButtonTooltip(nextBtnWrap, nextBtn.disabled);

        if (submitBtn) {
            const isLastImage = window.currentImageNavigator?.currentIndex === window.currentImageNavigator?.images.length - 1;
            if (isLastImage && allAnswered) {
                this.showSubmitButton();
            } else {
                this.hideSubmitButton();
            }
        }
    }

    showSubmitButton() {
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        if (nextBtn && submitBtn) {
            nextBtn.style.display = 'none';
            submitBtn.classList.remove('d-none');
            submitBtn.classList.add('d-block');
        }
    }

    hideSubmitButton() {
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        if (nextBtn && submitBtn) {
            nextBtn.style.display = 'inline-block';
            submitBtn.classList.add('d-none');
            submitBtn.classList.remove('d-block');
        }
    }

    initializeTooltip(element) {
        if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
            this.destroyTooltip(element);

            element._tooltip = new bootstrap.Tooltip(element, {
                trigger: 'hover'
            });
        }
    }

    destroyTooltip(element) {
        if (element._tooltip) {
            element._tooltip.dispose();
            delete element._tooltip;
        }
    }

    setupButtonTooltip(buttonWrap, isDisabled) {
        this.destroyTooltip(buttonWrap);
        if (isDisabled) {
            buttonWrap.setAttribute('data-bs-toggle', 'tooltip');
            buttonWrap.setAttribute('data-bs-placement', 'top');
            buttonWrap.setAttribute('title', 'Selecciona una opción en cada categoría visible');
            this.initializeTooltip(buttonWrap);
        } else {
            buttonWrap.removeAttribute('data-bs-toggle');
            buttonWrap.removeAttribute('data-bs-placement');
            buttonWrap.removeAttribute('title', '');
        }
    }

    hasAnswersForImage(imageId) {
        if (!this.userAnswers[imageId]) return false;

        const visibleSections = Array.from(document.querySelectorAll('.classification-section:not(.hidden)'));
        return visibleSections.every(section => {
            const radioName = section.querySelector('input[type="radio"]')?.name;
            if (radioName) {
                return this.userAnswers[imageId]?.[radioName] !== undefined;
            }

            const selectName = section.querySelector('select')?.name;
            if (selectName) {
                return this.userAnswers[imageId]?.[selectName] !== undefined;
            }

            return false;
        });
    }

    setCurrentImage(imageId, forceDisable = false) {
        if (this.currentImageId) {
            this.saveCurrentAnswers();
        }

        this.currentImageId = imageId;
        this.resetAllSelections();
        this.restorePreviousAnswers();

        const nextBtn = document.getElementById('next-btn');
        const nextBtnWrap = document.getElementById('next-btn-wrapper')
        if (!nextBtn) return;

        if (forceDisable && !this.hasAnswersForImage(imageId)) {
            nextBtn.disabled = true;
            this.setupButtonTooltip(nextBtnWrap, true);
        } else {
            nextBtn.disabled = !this.hasAnswersForImage(imageId);
            if (nextBtn.disabled) {
                this.setupButtonTooltip(nextBtnWrap, true);
            } else {
                this.setupButtonTooltip(nextBtnWrap, false);
                this.destroyTooltip(nextBtn);
            }
        }
    }

    resetRadioSelections() {
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.checked = false;
        });
    }

    resetSelectSelections(){
        document.querySelectorAll('select').forEach(select => {
            select.value = '';
        });
    }

    resetAllSelections() {
        this.resetRadioSelections();
        this.resetSelectSelections();
    }

    restorePreviousAnswers() {
        if (!this.userAnswers[this.currentImageId]) return false;

        let allRestored = true;
        document.querySelectorAll('.classification-section:not(.hidden)').forEach(section => {
            if (section.querySelector('input[type="radio"]')) {
                const radioName = section.querySelector('input[type="radio"]')?.name;
                if (radioName && this.userAnswers[this.currentImageId][radioName]) {
                    const radio = document.querySelector(`input[name="${radioName}"][value="${this.userAnswers[this.currentImageId][radioName]}"]`);
                    if (radio) {
                        radio.checked = true;
                    } else {
                        allRestored = false;
                    }
                } else {
                    allRestored = false;
                }
            } else if (section.querySelector('select')) {
                const selectName = section.querySelector('select')?.name;
                if (selectName && this.userAnswers[this.currentImageId][selectName] !== undefined) {
                    const select = document.querySelector(`select[name="${selectName}"]`);
                    if (select) {
                        select.value = this.userAnswers[this.currentImageId][selectName];
                    } else {
                        allRestored = false;
                    }
                } else {
                    allRestored = false;
                }
            }
        });

        return allRestored;
    }

    saveCurrentAnswers() {
        if (!this.currentImageId) return;

        if (!this.userAnswers[this.currentImageId]) {
            this.userAnswers[this.currentImageId] = {};
        }

        document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
            this.userAnswers[this.currentImageId][radio.name] = radio.value;
        });

        document.querySelectorAll('select').forEach(select => {
            if (select.value !== '') {
                this.userAnswers[this.currentImageId][select.name] = select.value;
            }
        });
    }
}