class QuizResults {
    constructor(userAnswers, images, showInteraction, showFlavor, showMode) {
        this.userAnswers = userAnswers;
        this.images = images;
        this.showInteraction = showInteraction;
        this.showFlavor = showFlavor;
        this.showMode = showMode;
        this.correctAnswers = this.getCorrectAnswers();
        this.results = this.calculateResults();
    }

    getCorrectAnswers() {
        const correctAnswers = {};

        this.images.forEach(image => {
            correctAnswers[image.id] = {
                interaction_type: this.mapInteractionType(image.tipo_interaccion),
                flavor: this.mapFlavor(image.sabor),
                interaction_mode: this.mapInteractionMode(image.modo_interaccion)
            };
        });

        return correctAnswers;
    }

    mapInteractionType(value) {
        return value === 0 ? 'CC' : 'NC';
    }

    mapFlavor(value) {
        const flavorMap = {
            12: 'Electrón',
            14: 'Muón',
            16: 'Tau'
        };
        return flavorMap[value] || 'Desconocido';
    }

    mapInteractionMode(value) {
        const modeMap = {
            0: 'QE',
            1: 'RES',
            2: 'DIS',
            3: 'COH',
            10: 'MEC'
        };
        return modeMap[value] || 'Desconocido';
    }

    calculateResults() {
        const results = [];
        let correctCount = 0;
        let totalQuestions = 0;

        this.images.forEach((image, index) => {
            const imageId = image.id;
            const userAnswer = this.userAnswers[imageId] || {};
            const correctAnswer = this.correctAnswers[imageId];

            const questionResult = {
                questionNumber: index + 1,
                image: image,
                userAnswers: userAnswer,
                correctAnswers: correctAnswer,
                isCorrect: this.isAnswerCorrect(userAnswer, correctAnswer),
                details: this.getAnswerDetails(userAnswer, correctAnswer)
            };

            results.push(questionResult);

            if (questionResult.isCorrect) {
                correctCount++;
            }
            totalQuestions++;
        });

        return {
            questions: results,
            correctCount: correctCount,
            totalQuestions: totalQuestions,
            percentage: Math.round((correctCount / totalQuestions) * 100)
        };
    }

    isAnswerCorrect(userAnswer, correctAnswer) {
        let correct = true;

        if (this.showInteraction) {
            correct = correct && (userAnswer.interaction_type === correctAnswer.interaction_type);
        }

        if (this.showFlavor) {
            correct = correct && (userAnswer.flavor === correctAnswer.flavor);
        }

        if (this.showMode) {
            correct = correct && (userAnswer.interaction_mode === correctAnswer.interaction_mode);
        }

        return correct;
    }

    getAnswerDetails(userAnswer, correctAnswer) {
        const details = [];

        if (this.showInteraction && userAnswer.interaction_type !== correctAnswer.interaction_type) {
            details.push({
                category: 'Tipo de interacción',
                userAnswer: userAnswer.interaction_type || 'No respondido',
                correctAnswer: correctAnswer.interaction_type,
                isCorrect: false
            });
        }

        if (this.showFlavor && userAnswer.flavor !== correctAnswer.flavor) {
            details.push({
                category: 'Sabor',
                userAnswer: userAnswer.flavor || 'No respondido',
                correctAnswer: correctAnswer.flavor,
                isCorrect: false
            });
        }

        if (this.showMode && userAnswer.interaction_mode !== correctAnswer.interaction_mode) {
            details.push({
                category: 'Modo de interacción',
                userAnswer: userAnswer.interaction_mode || 'No respondido',
                correctAnswer: correctAnswer.interaction_mode,
                isCorrect: false
            });
        }

        return details;
    }

    generateResultsHTML() {
        const { questions, correctCount, totalQuestions, percentage } = this.results;

        const questionHTML = questions.map(question => {
            const isCorrect = question.isCorrect;
            const statusIcon = isCorrect ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-danger';
            const statusText = isCorrect ? 'Correcto' : 'Incorrecto';
            const statusClass = isCorrect ? 'border-success' : 'border-danger';

            const interactionTemplate = this.showInteraction ? `
                <div class="p-2 ${this.getAnswerClass('interaction_type', question)} rounded mb-2">
                    <small><strong>Tipo:</strong> ${question.correctAnswers.interaction_type}</small>
                </div>
            ` : '';

            const flavorTemplate = this.showFlavor ? `
                <div class="p-2 ${this.getAnswerClass('flavor', question)} rounded mb-2">
                    <small><strong>Sabor:</strong> ${question.correctAnswers.flavor}</small>
                </div>
            ` : '';

            const modeTemplate = this.showMode ? `
                <div class="p-2 ${this.getAnswerClass('interaction_mode', question)} rounded">
                    <small><strong>Modo:</strong> ${question.correctAnswers.interaction_mode}</small>
                </div>
            ` : '';

            return `
                <div class="question-result mb-4 p-3 border ${statusClass} rounded">
                    <div class="d-flex align-items-center mb-3">
                        <h5 class="mb-0 me-3">${question.questionNumber}. ¿Qué tipo de partícula se muestra en la imagen?</h5>
                        <span class="badge ${isCorrect ? 'bg-success' : 'bg-danger'} fs-6">
                            <i class="${statusIcon} me-1"></i>${statusText}
                        </span>
                    </div>
            
                    <div class="row">
                        <div class="col-md-3">
                            <img src="/imagen_externa/${encodeURIComponent(question.image.path)}" 
                                alt="Imagen de partícula" class="img-fluid rounded border">
                        </div>
                        <div class="col-md-9">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="text-muted mb-2">Tu respuesta:</h6>
                                    ${this.showInteraction ? `
                                    <div class="p-2 bg-light rounded mb-2">
                                        <small><strong>Tipo:</strong> ${this.formatAnswer(question.userAnswers.interaction_type)}</small>
                                    </div>
                                    ` : ''}
                                    ${this.showFlavor ? `
                                    <div class="p-2 bg-light rounded mb-2">
                                        <small><strong>Sabor:</strong> ${this.formatAnswer(question.userAnswers.flavor)}</small>
                                    </div>
                                    ` : ''}
                                    ${this.showMode ? `
                                    <div class="p-2 bg-light rounded">
                                        <small><strong>Modo:</strong> ${this.formatAnswer(question.userAnswers.interaction_mode)}</small>
                                    </div>
                                    ` : ''}
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-muted mb-2">Respuesta correcta:</h6>
                                    ${interactionTemplate}
                                    ${flavorTemplate}
                                    ${modeTemplate}
                                </div>
                            </div>
                    
                            ${!isCorrect ? this.generateIncorrectMessage(question) : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="container py-4">
                <div class="card shadow">
                    <div class="card-header bg-secondary text-white">
                        <h2 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Resultados del Quiz</h2>
                    </div>
                    <div class="card-body">
                        <div class="alert bg-secondary mb-4 text-white text-center">
                            <h3 class="mb-2">${percentage}%</h3>
                            <p class="mb-0 fs-5">${correctCount} de ${totalQuestions} correctas</p>
                        </div>
                        ${questionHTML}
                        <div class="text-center mt-4">
                            <button onclick="location.href='/'" class="btn btn-primary btn-lg">
                                <i class="fas fa-redo me-2"></i>Realizar otro quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    formatAnswer(answer) {
        return answer || '<span class="text-muted">No respondido</span>';
    }

    getAnswerClass(category, question) {
        const userAnswer = question.userAnswers[category];
        const correctAnswer = question.correctAnswers[category];

        if (userAnswer === correctAnswer) {
            return 'bg-success bg-opacity-25';
        } else {
            return 'bg-danger bg-opacity-25';
        }
    }

    generateIncorrectMessage(question) {
        const incorrectDetails = [];

        if (this.showInteraction && question.userAnswers.interaction_type !== question.correctAnswers.interaction_type) {
            incorrectDetails.push(`Tipo de interacción: respondiste "${this.formatAnswer(question.userAnswers.interaction_type)}", la respuesta correcta es "${question.correctAnswers.interaction_type}"`);
        }

        if (this.showFlavor && question.userAnswers.flavor !== question.correctAnswers.flavor) {
            incorrectDetails.push(`Sabor: respondiste "${this.formatAnswer(question.userAnswers.flavor)}", la respuesta correcta es "${question.correctAnswers.flavor}"`);
        }

        if (this.showMode && question.userAnswers.interaction_mode !== question.correctAnswers.interaction_mode) {
            incorrectDetails.push(`Modo de interacción: respondiste "${this.formatAnswer(question.userAnswers.interaction_mode)}", la respuesta correcta es "${question.correctAnswers.interaction_mode}"`);
        }

        if (incorrectDetails.length > 0) {
            return `
                <div class="mt-3 p-2 bg-danger bg-opacity-10 rounded">
                    <small class="text-danger">
                        <i class="fas fa-exclamation-triangle me-1"></i>
                        ${incorrectDetails.join('; ')}
                    </small>
                </div>
            `;
        }

        return '';
    }

    showResults() {
        const resultsHTML = this.generateResultsHTML();
        document.body.innerHTML = resultsHTML;
    }
}