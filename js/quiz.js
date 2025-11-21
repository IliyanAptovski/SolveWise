class QuizManager {
    constructor() {
        this.currentTopic = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.quizStarted = false;
        this.isRetake = false;
        this.init();
    }

    async init() {
        await this.loadQuizData();
        this.setupEventListeners();
        this.renderQuiz();
    }

    async loadQuizData() {
        // Get topic from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        const topicId = urlParams.get('topic') || localStorage.getItem('currentTopic');
        this.isRetake = urlParams.get('retake') === 'true';

        if (!topicId) {
            this.showError('Не е избрана тема. Моля, върнете се към страницата с теми.');
            return;
        }

        this.currentTopic = topicId;

        try {
            // Load questions for the selected topic
            const response = await fetch(`data/questions/${topicId}.json`);
            if (!response.ok) {
                throw new Error('Файлът с въпроси не е намерен.');
            }

            const topicData = await response.json();
            this.questions = topicData.questions;
            document.getElementById('quizTopicTitle').textContent = topicData.title;

            // Load user progress
            await this.loadUserProgress();

        } catch (error) {
            console.error('Грешка при зареждане на въпросите:', error);
            this.showError('Грешка при зареждане на въпросите. Моля, опитайте отново.');
        }
    }

    async loadUserProgress() {
        // Reset progress if this is a retake
        if (this.isRetake) {
            this.currentQuestionIndex = 0;
            this.userAnswers = [];
            return;
        }

        // Try to load from Firebase first, then fallback to localStorage
        let topicProgress = null;

        if (typeof authManager !== 'undefined' && authManager.currentUser) {
            try {
                const snapshot = await database.ref(`users/${authManager.currentUser.uid}/scores/${this.currentTopic}`).once('value');
                topicProgress = snapshot.val();
            } catch (error) {
                console.error('Грешка при зареждане от Firebase:', error);
            }
        }

        // If no Firebase data, try localStorage
        if (!topicProgress) {
            const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
            topicProgress = userProgress[this.currentTopic];
        }

        // If user has progress, start from where they left off
        if (topicProgress && topicProgress.completedQuestions > 0) {
            this.currentQuestionIndex = Math.min(topicProgress.completedQuestions, this.questions.length - 1);
            this.userAnswers = topicProgress.answers || [];
        }
    }

    setupEventListeners() {
        // Option selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('option')) {
                this.selectOption(e.target);
            }
        });

        // Navigation buttons
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.previousQuestion();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('exitBtn').addEventListener('click', () => {
            this.exitQuiz();
        });

        document.getElementById('submitQuiz').addEventListener('click', () => {
            this.submitQuiz();
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                this.previousQuestion();
            } else if (e.key === 'ArrowRight') {
                this.nextQuestion();
            } else if (e.key === 'Escape') {
                this.exitQuiz();
            }
        });
    }

    renderQuiz() {
        if (this.questions.length === 0) {
            this.showError('Няма налични въпроси за тази тема.');
            return;
        }

        this.updateProgress();
        this.showCurrentQuestion();
        this.updateNavigation();
    }

    showCurrentQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        const questionElement = document.getElementById('currentQuestion');

        questionElement.innerHTML = `
            <p class="question-number">Въпрос ${this.currentQuestionIndex + 1} от ${this.questions.length}</p>
            <h2 class="question-text">${question.question}</h2>
            <div class="options">
                ${question.options.map((option, index) => `
                    <div class="option ${this.userAnswers[this.currentQuestionIndex] === index ? 'selected' : ''}" 
                         data-option="${index}">
                        ${option}
                    </div>
                `).join('')}
            </div>
        `;
    }

    selectOption(optionElement) {
        // Remove selection from all options
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Select clicked option
        optionElement.classList.add('selected');

        // Store user's answer
        const optionIndex = parseInt(optionElement.getAttribute('data-option'));
        this.userAnswers[this.currentQuestionIndex] = optionIndex;

        // Enable navigation based on current position
        const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;

        if (isLastQuestion) {
            // On last question, show submit button
            document.getElementById('submitQuiz').style.display = 'block';
            document.getElementById('submitQuiz').disabled = false;
        } else {
            // On other questions, enable next button
            document.getElementById('nextBtn').disabled = false;
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showCurrentQuestion();
            this.updateNavigation();
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showCurrentQuestion();
            this.updateNavigation();
        }
    }

    updateNavigation() {
        const isFirstQuestion = this.currentQuestionIndex === 0;
        const isLastQuestion = this.currentQuestionIndex === this.questions.length - 1;
        const hasAnswer = this.userAnswers[this.currentQuestionIndex] !== undefined;

        // Update button states
        document.getElementById('prevBtn').disabled = isFirstQuestion;

        // Show/hide next and submit buttons
        if (isLastQuestion) {
            document.getElementById('nextBtn').style.display = 'none';
            document.getElementById('submitQuiz').style.display = hasAnswer ? 'block' : 'none';
        } else {
            document.getElementById('nextBtn').style.display = 'block';
            document.getElementById('submitQuiz').style.display = 'none';
            document.getElementById('nextBtn').disabled = !hasAnswer;
        }

        this.updateProgress();
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
        document.querySelector('.progress-fill').style.width = `${progress}%`;
        document.querySelector('.quiz-progress-bar span').textContent = `${this.currentQuestionIndex + 1} от ${this.questions.length}`;
    }

    showSubmitButton() {
        document.getElementById('submitQuiz').style.display = 'block';
        document.getElementById('nextBtn').style.display = 'none';
    }

    async submitQuiz() {
        // Calculate score
        let score = 0;
        const mistakes = {};

        this.questions.forEach((question, index) => {
            if (this.userAnswers[index] === question.correctAnswer) {
                score++;
            } else {
                mistakes[question.id] = {
                    selectedAnswer: this.userAnswers[index],
                    correctAnswer: question.correctAnswer,
                    attempt: 1,
                    timestamp: Date.now()
                };
            }
        });

        // Save results
        await this.saveResults(score, mistakes);

        // Show results
        this.showResults(score);
    }

    async saveResults(score, mistakes) {
        const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');

        userProgress[this.currentTopic] = {
            score: score,
            completedQuestions: this.questions.length,
            answers: this.userAnswers,
            mistakes: mistakes,
            completedAt: Date.now()
        };

        localStorage.setItem('userProgress', JSON.stringify(userProgress));

        // If using Firebase, save to database
        if (typeof authManager !== 'undefined' && authManager.currentUser) {
            try {
                await database.ref(`users/${authManager.currentUser.uid}/scores/${this.currentTopic}`).set({
                    score: score,
                    mistakes: mistakes,
                    completedAt: Date.now()
                });
            } catch (error) {
                console.error('Грешка при запазване на резултатите:', error);
            }
        }
    }

    showResults(score) {
        const quizContainer = document.querySelector('.quiz-container');
        quizContainer.innerHTML = `
            <div class="quiz-results">
                <h2>Резултати от теста</h2>
                <div class="score-display">
                    <div class="score-circle large">
                        <span>${score}/${this.questions.length}</span>
                    </div>
                    <p>${Math.round((score / this.questions.length) * 100)}% верни отговори</p>
                </div>
                <div class="results-details">
                    <div class="result-stat">
                        <span class="stat-label">Верни отговори:</span>
                        <span class="stat-value">${score}</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-label">Грешки:</span>
                        <span class="stat-value">${this.questions.length - score}</span>
                    </div>
                    <div class="result-stat">
                        <span class="stat-label">Общо въпроси:</span>
                        <span class="stat-value">${this.questions.length}</span>
                    </div>
                </div>
                <div class="results-actions">
                    <button class="btn primary" onclick="window.location.href='topics.html'">
                        Към всички теми
                    </button>
                    <button class="btn outline" onclick="window.location.href='quiz.html?topic=${this.currentTopic}&retake=true'">
                        Направи теста отново
                    </button>
                    <button class="btn" onclick="window.location.href='summary.html'">
                        Виж детайлни резултати
                    </button>
                </div>
            </div>
        `;
    }

    exitQuiz() {
        if (confirm('Сигурни ли сте, че искате да излезете от теста? Прогресът ви ще бъде запазен.')) {
            // Save current progress before exiting
            if (this.userAnswers.length > 0) {
                this.saveProgress();
            }
            window.location.href = 'topics.html';
        }
    }

    saveProgress() {
        const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');

        userProgress[this.currentTopic] = {
            score: 0, // Will be calculated when completed
            completedQuestions: this.currentQuestionIndex,
            answers: this.userAnswers,
            mistakes: {},
            lastSaved: Date.now()
        };

        localStorage.setItem('userProgress', JSON.stringify(userProgress));
    }

    showError(message) {
        const quizContainer = document.querySelector('.quiz-container');
        quizContainer.innerHTML = `
            <div class="error-message">
                <h3>Грешка</h3>
                <p>${message}</p>
                <div class="error-actions">
                    <button class="btn primary" onclick="window.location.href='topics.html'">
                        Към темите
                    </button>
                    <button class="btn outline" onclick="location.reload()">
                        Опитай отново
                    </button>
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizManager();
});