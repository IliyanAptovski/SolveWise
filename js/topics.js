// Topics Management
class TopicsManager {
    constructor() {
        this.topics = [];
        this.filteredTopics = [];
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.userProgress = {};
        this.init();
    }

    async init() {
        await this.loadTopics();
        await this.loadUserProgress();
        this.renderTopics();
        this.setupEventListeners();
        this.updateStats();
    }

    async loadTopics() {
        try {
            const response = await fetch('data/topics_bg.json');
            const data = await response.json();
            this.topics = data.topics;
            this.filteredTopics = [...this.topics];
        } catch (error) {
            console.error('Грешка при зареждане на темите:', error);
            this.showError('Грешка при зареждане на темите. Моля, опитайте отново.');
        }
    }

    async loadUserProgress() {
        this.userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');

        // Load from Firebase if user is authenticated
        if (typeof authManager !== 'undefined' && authManager.currentUser) {
            try {
                const snapshot = await database.ref(`users/${authManager.currentUser.uid}/scores`).once('value');
                const firebaseProgress = snapshot.val();

                if (firebaseProgress) {
                    // Merge Firebase progress with local progress
                    Object.keys(firebaseProgress).forEach(topicId => {
                        if (!this.userProgress[topicId] ||
                            firebaseProgress[topicId].completedAt > (this.userProgress[topicId].completedAt || 0)) {
                            this.userProgress[topicId] = firebaseProgress[topicId];
                        }
                    });

                    // Update localStorage with merged data
                    localStorage.setItem('userProgress', JSON.stringify(this.userProgress));
                }
            } catch (error) {
                console.error('Грешка при зареждане на прогреса от Firebase:', error);
            }
        }

        // Update topics with progress data
        this.topics.forEach(topic => {
            const progress = this.userProgress[topic.id];
            if (progress) {
                topic.progress = Math.round((progress.score / topic.totalQuestions) * 100);
                topic.completedQuestions = progress.completedQuestions || progress.score || 0;
            } else {
                topic.progress = 0;
                topic.completedQuestions = 0;
            }
        });
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterTopics();
        });

        // Category filter
        const categoryFilter = document.getElementById('categoryFilter');
        categoryFilter.addEventListener('change', (e) => {
            this.currentCategory = e.target.value;
            this.filterTopics();
        });
    }

    filterTopics() {
        this.filteredTopics = this.topics.filter(topic => {
            const matchesSearch = topic.title.toLowerCase().includes(this.searchTerm) ||
                topic.description.toLowerCase().includes(this.searchTerm);
            const matchesCategory = this.currentCategory === 'all' ||
                topic.category === this.currentCategory;
            return matchesSearch && matchesCategory;
        });

        this.renderTopics();
        this.updateStats();
    }

    renderTopics() {
        const topicsGrid = document.getElementById('topicsGrid');
        const noResults = document.getElementById('noResults');

        if (this.filteredTopics.length === 0) {
            topicsGrid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';

        const topicsHTML = this.filteredTopics.map(topic => {
            const progress = this.userProgress[topic.id];
            const hasProgress = progress && progress.completedQuestions > 0;
            const isCompleted = progress && progress.completedQuestions === topic.totalQuestions;

            return `
            <div class="topic-card" data-topic-id="${topic.id}">
                <div class="topic-header">
                    <div class="topic-icon">${topic.icon}</div>
                    <span class="topic-category">${topic.category}</span>
                    ${isCompleted ? '<span class="completed-badge">Завършен</span>' : ''}
                </div>
                <h3>${topic.title}</h3>
                <p>${topic.description}</p>
                <div class="topic-stats">
                    <span class="questions-count">${topic.completedQuestions}/${topic.totalQuestions} въпроса</span>
                    <span class="progress-percent">${topic.progress}%</span>
                </div>
                <div class="progress-container">
                    <div class="progress-label">Напредък</div>
                    <div class="progress">
                        <span style="--progress:${topic.progress}%"></span>
                    </div>
                </div>
                <div class="topic-actions">
                    <button class="btn primary start-quiz" data-topic-id="${topic.id}">
                        ${hasProgress ? 'Продължи' : 'Започни'}
                    </button>
                    ${hasProgress ? `
                        <button class="btn outline restart-quiz" data-topic-id="${topic.id}">
                            Започни отначало
                        </button>
                    ` : ''}
                </div>
            </div>
            `;
        }).join('');

        topicsGrid.innerHTML = topicsHTML;
        this.attachTopicEventListeners();
    }

    attachTopicEventListeners() {
        // Start quiz buttons
        document.querySelectorAll('.start-quiz').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const topicId = button.getAttribute('data-topic-id');
                this.startQuiz(topicId);
            });
        });

        // Restart quiz buttons
        document.querySelectorAll('.restart-quiz').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const topicId = button.getAttribute('data-topic-id');
                this.restartQuiz(topicId);
            });
        });

        // Topic card click
        document.querySelectorAll('.topic-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const topicId = card.getAttribute('data-topic-id');
                    this.startQuiz(topicId);
                }
            });
        });
    }

    startQuiz(topicId) {
        // Store the selected topic in localStorage
        localStorage.setItem('currentTopic', topicId);

        // Redirect to quiz page
        window.location.href = `quiz.html?topic=${topicId}`;
    }

    restartQuiz(topicId) {
        if (confirm('Сигурни ли сте, че искате да започнете теста отначало? Това ще изтрие текущия ви напредък.')) {
            // Clear progress from localStorage
            const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
            delete userProgress[topicId];
            localStorage.setItem('userProgress', JSON.stringify(userProgress));

            // Clear progress from Firebase if user is authenticated
            if (typeof authManager !== 'undefined' && authManager.currentUser) {
                database.ref(`users/${authManager.currentUser.uid}/scores/${topicId}`).remove()
                    .catch(error => {
                        console.error('Грешка при изтриване на прогреса от Firebase:', error);
                    });
            }

            // Redirect to quiz page with retake parameter
            window.location.href = `quiz.html?topic=${topicId}&retake=true`;
        }
    }

    updateStats() {
        const totalTopics = this.filteredTopics.length;
        const completedTopics = this.filteredTopics.filter(topic => {
            const progress = this.userProgress[topic.id];
            return progress && progress.completedQuestions === topic.totalQuestions;
        }).length;

        const totalQuestions = this.filteredTopics.reduce((sum, topic) => sum + topic.totalQuestions, 0);
        const completedQuestions = this.filteredTopics.reduce((sum, topic) => {
            const progress = this.userProgress[topic.id];
            return sum + (progress ? progress.completedQuestions : 0);
        }, 0);

        document.getElementById('totalTopics').textContent = totalTopics;
        document.getElementById('completedTopics').textContent = completedTopics;
        document.getElementById('totalQuestions').textContent = totalQuestions;

        // Add completed questions stat if you have the element
        const completedQuestionsEl = document.getElementById('completedQuestions');
        if (completedQuestionsEl) {
            completedQuestionsEl.textContent = completedQuestions;
        }
    }

    showError(message) {
        const topicsGrid = document.getElementById('topicsGrid');
        topicsGrid.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <button class="btn primary" onclick="location.reload()">Опитай отново</button>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TopicsManager();
});