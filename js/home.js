// Home Page Progress Management
class HomeProgressManager {
    constructor() {
        this.progressManager = new ProgressManager();
        this.init();
    }

    async init() {
        await this.progressManager.init();
        this.renderProgress();
    }

    renderProgress() {
        const previewBox = document.querySelector('.preview-box');
        if (!previewBox) return;

        // Get top 3 topics by progress
        const allTopics = this.progressManager.getAllTopicsProgress();
        const topTopics = allTopics.slice(0, 3);

        let progressHTML = '<h3>Вашият прогрес</h3>';

        if (topTopics.length === 0) {
            progressHTML += '<p>Все още нямате започнати теми. <a href="topics.html">Започнете сега!</a></p>';
        } else {
            topTopics.forEach(topic => {
                progressHTML += `
                    <div class="topic-progress-item">
                        <div class="topic-progress-header">
                            <span class="topic-name">${topic.title}</span>
                            <span class="topic-percent">${topic.progress}%</span>
                        </div>
                        <div class="progress">
                            <span style="--progress:${topic.progress}%"></span>
                        </div>
                        <div class="topic-stats">
                            <span>${topic.completedQuestions}/${topic.totalQuestions} въпроса</span>
                        </div>
                    </div>
                `;
            });

            // Add overall stats
            const stats = this.progressManager.calculateOverallStats();
            if (stats.completedQuestions > 0) {
                progressHTML += `
                    <div class="overall-stats">
                        <div class="stat-line">
                            <span>Общо отговорени въпроси:</span>
                            <strong>${stats.completedQuestions}</strong>
                        </div>
                        <div class="stat-line">
                            <span>Средна точност:</span>
                            <strong>${stats.averageAccuracy}%</strong>
                        </div>
                    </div>
                `;
            }
        }

        previewBox.innerHTML = progressHTML;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomeProgressManager();
});