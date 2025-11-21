// Summary Page Progress Management
class SummaryProgressManager {
    constructor() {
        this.progressManager = new ProgressManager();
        this.init();
    }

    async init() {
        await this.progressManager.init();
        this.renderSummary();
    }

    renderSummary() {
        this.renderOverallScore();
        this.renderTopicProgress();
        this.renderStatistics();
    }

    renderOverallScore() {
        const stats = this.progressManager.calculateOverallStats();
        const overallScoreCard = document.querySelector('.summary-card:first-child');
        
        if (!overallScoreCard) return;

        const scorePercentage = stats.averageAccuracy;
        
        // Update the score circle and progress bar
        overallScoreCard.querySelector('.score-circle span').textContent = `${scorePercentage}%`;
        overallScoreCard.querySelector('.progress span').style.setProperty('--progress', `${scorePercentage}%`);
        
        // Simplify the text - just show the percentage
        const scoreText = stats.completedQuestions > 0 
            ? `Общ резултат: ${scorePercentage}%`
            : 'Все още нямате започнати теми';
        
        overallScoreCard.querySelector('p').textContent = scoreText;
        
        // Remove the <strong> tag if it exists
        const strongTag = overallScoreCard.querySelector('p strong');
        if (strongTag) {
            strongTag.remove();
        }
    }

    renderTopicProgress() {
        const topicProgressCard = document.querySelector('.summary-card:nth-child(2)');
        if (!topicProgressCard) return;

        const allTopics = this.progressManager.getAllTopicsProgress();
        const topicList = topicProgressCard.querySelector('.topic-list');
        
        if (allTopics.length === 0) {
            topicList.innerHTML = '<li><span class="topic-name">Все още нямате започнати теми</span></li>';
            return;
        }

        let topicsHTML = '';
        allTopics.forEach(topic => {
            topicsHTML += `
                <li>
                    <span class="topic-name">${topic.title}</span>
                    <span class="topic-score">${topic.progress}%</span>
                    <div class="progress"><span style="--progress:${topic.progress}%"></span></div>
                </li>
            `;
        });

        topicList.innerHTML = topicsHTML;
    }

    renderStatistics() {
        const statsCard = document.querySelector('.summary-card:nth-child(3)');
        if (!statsCard) return;

        const stats = this.progressManager.calculateOverallStats();
        const statsGrid = statsCard.querySelector('.stats-grid');
        
        // Remove the time stat (4th item)
        const timeStat = statsCard.querySelector('.stat-item:nth-child(4)');
        if (timeStat) {
            timeStat.remove();
        }

        // Update existing stats
        const statItems = statsGrid.querySelectorAll('.stat-item');
        
        if (statItems[0]) {
            statItems[0].querySelector('.stat-value').textContent = stats.completedTopics;
            statItems[0].querySelector('.stat-label').textContent = 'Завършени теми';
        }
        
        if (statItems[1]) {
            statItems[1].querySelector('.stat-value').textContent = stats.completedQuestions;
            statItems[1].querySelector('.stat-label').textContent = 'Отговорени въпроси';
        }
        
        if (statItems[2]) {
            statItems[2].querySelector('.stat-value').textContent = `${stats.averageAccuracy}%`;
            statItems[2].querySelector('.stat-label').textContent = 'Средна точност';
        }

        // Add total topics stat if there's space
        if (statItems[3]) {
            statItems[3].querySelector('.stat-value').textContent = this.progressManager.topics.length;
            statItems[3].querySelector('.stat-label').textContent = 'Общо теми';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SummaryProgressManager();
});