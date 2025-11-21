// Progress Management - Shared logic for home and summary pages
class ProgressManager {
    constructor() {
        this.userProgress = {};
        this.topics = [];
        this.init();
    }

    async init() {
        await this.loadTopics();
        await this.loadUserProgress();
    }

    async loadTopics() {
        try {
            const response = await fetch('data/topics_bg.json');
            const data = await response.json();
            this.topics = data.topics;
        } catch (error) {
            console.error('Грешка при зареждане на темите:', error);
        }
    }

    async loadUserProgress() {
        // Start with localStorage progress
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

        return this.userProgress;
    }

    calculateOverallStats() {
        let totalQuestions = 0;
        let completedQuestions = 0;
        let totalScore = 0;
        let totalPossibleScore = 0;
        let completedTopics = 0;

        this.topics.forEach(topic => {
            const progress = this.userProgress[topic.id];
            totalQuestions += topic.totalQuestions;

            if (progress) {
                completedQuestions += progress.completedQuestions || progress.score || 0;
                totalScore += progress.score || 0;
                totalPossibleScore += topic.totalQuestions;

                if (progress.completedQuestions === topic.totalQuestions) {
                    completedTopics++;
                }
            }
        });

        const averageAccuracy = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;

        return {
            totalQuestions,
            completedQuestions,
            totalScore,
            totalPossibleScore,
            completedTopics,
            averageAccuracy
        };
    }

    getTopicProgress(topicId) {
        const progress = this.userProgress[topicId];
        const topic = this.topics.find(t => t.id === topicId);

        if (!topic) return null;

        if (progress) {
            return {
                score: progress.score || 0,
                percentage: Math.round(((progress.score || 0) / topic.totalQuestions) * 100),
                completedQuestions: progress.completedQuestions || progress.score || 0,
                totalQuestions: topic.totalQuestions,
                isCompleted: progress.completedQuestions === topic.totalQuestions
            };
        }

        return {
            score: 0,
            percentage: 0,
            completedQuestions: 0,
            totalQuestions: topic.totalQuestions,
            isCompleted: false
        };
    }

    getAllTopicsProgress() {
        return this.topics.map(topic => {
            const progress = this.getTopicProgress(topic.id);
            return {
                ...topic,
                progress: progress.percentage,
                score: progress.score,
                completedQuestions: progress.completedQuestions,
                isCompleted: progress.isCompleted
            };
        }).sort((a, b) => b.progress - a.progress); // Sort by progress descending
    }
}