/**
 * Spaced Repetition Service (SM-2 Algorithm)
 * Manages study queue and scheduling based on user performance
 */

export interface StudyItem {
    id: string;
    vocabId: string;
    word: string;
    interval: number; // days until next review
    easeFactor: number; // difficulty multiplier (starts at 2.5)
    repetitions: number; // number of times reviewed
    nextReview: number; // timestamp of next review
    lastReviewDate: number; // timestamp of last review
    difficulty: 'easy' | 'medium' | 'hard'; // word difficulty
    quality: number; // 0-5 rating from last review
    correctStreak: number; // consecutive correct answers
    totalAttempts: number; // total practice attempts
    correctAttempts: number; // total correct attempts
}

export interface ReviewSession {
    id: string;
    userId: string;
    startTime: number;
    endTime: number | null;
    mode: 'quick' | 'standard' | 'focused';
    totalQuestions: number;
    correctAnswers: number;
    results: ReviewResult[];
    duration: number; // milliseconds
}

export interface ReviewResult {
    studyItemId: string;
    word: string;
    quality: number; // 0-5: 0=blackout, 3=hard but correct, 5=perfect
    timeSpent: number; // milliseconds
    attempts: number;
    userAnswer: string;
    correctAnswer: string;
}

export interface Statistics {
    dueToday: number;
    totalItems: number;
    mastered: number;
    accuracy: number;
    totalSessions: number;
    lastSessionDate: number | null;
    streakDays: number;
    avgTimePerWord: number; // milliseconds
    improvementRate: number; // percentage change in accuracy
    estimatedMasteryDate: number | null;
}

const STUDY_QUEUE_KEY = 'studyQueue';
const REVIEW_SESSIONS_KEY = 'reviewSessions';
const STATS_CACHE_KEY = 'statsCache';

export const spacedRepetitionService = {
    /**
     * Add a word to study queue
     */
    addToStudyQueue: (vocabId: string, word: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): StudyItem => {
        const item: StudyItem = {
            id: `study_${Date.now()}`,
            vocabId,
            word,
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
            nextReview: Date.now(),
            lastReviewDate: Date.now(),
            difficulty,
            quality: 0,
            correctStreak: 0,
            totalAttempts: 0,
            correctAttempts: 0,
        };

        const queue = getStudyQueue();
        queue.push(item);
        localStorage.setItem(STUDY_QUEUE_KEY, JSON.stringify(queue));

        return item;
    },

    /**
     * Get current study queue for review
     */
    getStudyQueue: (mode: 'quick' | 'standard' | 'focused' = 'standard'): StudyItem[] => {
        const queue = getStudyQueue();
        const now = Date.now();

        // Filter due items
        let dueItems = queue.filter((item) => item.nextReview <= now);

        // Sort by nextReview (oldest first - high priority)
        dueItems.sort((a, b) => a.nextReview - b.nextReview);

        // Limit based on mode
        const limits = { quick: 5, standard: 10, focused: 5 };
        let modeItems = dueItems.slice(0, limits[mode]);

        // For focused mode, prioritize hard words with low accuracy
        if (mode === 'focused') {
            const hardItems = dueItems
                .filter((item) => item.difficulty === 'hard' || item.correctAttempts / Math.max(1, item.totalAttempts) < 0.6)
                .slice(0, 5);
            modeItems = hardItems.length > 0 ? hardItems : modeItems;
        }

        return modeItems;
    },

    /**
     * Record review result and update study item using SM-2
     * @param studyItemId - ID of the study item
     * @param quality - 0-5 rating (0=blackout, 1=incorrect, 2=hard, 3=correct with effort, 4=correct, 5=perfect)
     * @param timeSpent - time spent in milliseconds
     * @param attempts - number of attempts for this review
     */
    recordReview: (studyItemId: string, quality: number, timeSpent: number, attempts: number): StudyItem => {
        if (quality < 0 || quality > 5) {
            throw new Error('Quality must be 0-5');
        }

        const queue = getStudyQueue();
        const item = queue.find((i) => i.id === studyItemId);

        if (!item) {
            throw new Error('Study item not found');
        }

        // Track attempts
        item.totalAttempts += attempts;
        if (quality >= 3) {
            item.correctAttempts += 1;
            item.correctStreak += 1;
        } else {
            item.correctStreak = 0; // Reset streak on incorrect
        }

        // SM-2 Algorithm Implementation
        item.quality = quality;
        item.lastReviewDate = Date.now();
        item.repetitions += 1;

        if (quality < 3) {
            // Failed - reset with penalty
            item.interval = 1;
            item.repetitions = Math.max(0, item.repetitions - 1);
            item.easeFactor = Math.max(1.3, item.easeFactor - 0.2);
        } else {
            // Passed - increase interval
            if (item.repetitions === 1) {
                item.interval = 1;
            } else if (item.repetitions === 2) {
                item.interval = 3;
            } else {
                item.interval = Math.round(item.interval * item.easeFactor);
            }

            // Update ease factor based on quality
            const easeChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
            item.easeFactor = Math.max(1.3, item.easeFactor + easeChange);
        }

        // Set next review date (convert days to milliseconds)
        item.nextReview = Date.now() + item.interval * 24 * 60 * 60 * 1000;

        // Update queue
        const updated = queue.map((i) => (i.id === studyItemId ? item : i));
        localStorage.setItem(STUDY_QUEUE_KEY, JSON.stringify(updated));

        // Invalidate stats cache
        localStorage.removeItem(STATS_CACHE_KEY);

        return item;
    },

    /**
     * Save review session
     */
    saveReviewSession: (session: ReviewSession): void => {
        const sessions = localStorage.getItem(REVIEW_SESSIONS_KEY);
        const allSessions: ReviewSession[] = sessions ? JSON.parse(sessions) : [];

        // Add duration calculation
        session.duration = (session.endTime || Date.now()) - session.startTime;

        allSessions.push(session);
        localStorage.setItem(REVIEW_SESSIONS_KEY, JSON.stringify(allSessions));

        // Invalidate stats cache
        localStorage.removeItem(STATS_CACHE_KEY);
    },

    /**
     * Get comprehensive user statistics
     */
    getStatistics: (): Statistics => {
        // Check cache first
        const cached = localStorage.getItem(STATS_CACHE_KEY);
        if (cached) {
            const cacheTime = JSON.parse(cached).timestamp;
            if (Date.now() - cacheTime < 60000) { // 1 minute cache
                return JSON.parse(cached).data;
            }
        }

        const queue = getStudyQueue();
        const sessions = localStorage.getItem(REVIEW_SESSIONS_KEY);
        const allSessions: ReviewSession[] = sessions ? JSON.parse(sessions) : [];

        const now = Date.now();
        const dueToday = queue.filter((item) => item.nextReview <= now).length;
        const totalItems = queue.length;
        const mastered = queue.filter((item) => item.repetitions >= 3 && item.quality >= 4).length;

        // Calculate accuracy
        const totalReviewed = allSessions.reduce((sum, s) => sum + s.totalQuestions, 0);
        const totalCorrect = allSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
        const accuracy = totalReviewed > 0 ? Math.round((totalCorrect / totalReviewed) * 100) : 0;

        // Calculate streak
        const lastSessionDate = allSessions[allSessions.length - 1]?.endTime || null;
        const streakDays = lastSessionDate ? Math.floor((now - lastSessionDate) / (24 * 60 * 60 * 1000)) : 0;

        // Calculate average time per word
        const totalTime = allSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const avgTimePerWord = totalReviewed > 0 ? Math.round(totalTime / totalReviewed) : 0;

        // Calculate improvement rate
        let improvementRate = 0;
        if (allSessions.length >= 2) {
            const recentAccuracy = allSessions.slice(-5).reduce((sum, s) => sum + (s.correctAnswers / s.totalQuestions), 0) / Math.min(5, allSessions.length);
            const earlierAccuracy = allSessions.slice(0, 5).reduce((sum, s) => sum + (s.correctAnswers / s.totalQuestions), 0) / Math.min(5, allSessions.length);
            improvementRate = Math.round(((recentAccuracy - earlierAccuracy) / earlierAccuracy) * 100);
        }

        // Estimate mastery date based on current pace
        let estimatedMasteryDate: number | null = null;
        if (mastered < totalItems) {
            const unmasteredCount = totalItems - mastered;
            const avgDaysPerMastery = allSessions.length > 0 ? Math.round((now - allSessions[0].startTime) / (24 * 60 * 60 * 1000) / mastered) : 7;
            estimatedMasteryDate = now + unmasteredCount * avgDaysPerMastery * 24 * 60 * 60 * 1000;
        }

        const stats: Statistics = {
            dueToday,
            totalItems,
            mastered,
            accuracy,
            totalSessions: allSessions.length,
            lastSessionDate,
            streakDays,
            avgTimePerWord,
            improvementRate,
            estimatedMasteryDate,
        };

        // Cache stats
        localStorage.setItem(STATS_CACHE_KEY, JSON.stringify({
            data: stats,
            timestamp: now
        }));

        return stats;
    },

    /**
     * Get performance trend (last 7 days)
     */
    getPerformanceTrend: (): { date: string; accuracy: number }[] => {
        const sessions = localStorage.getItem(REVIEW_SESSIONS_KEY);
        const allSessions: ReviewSession[] = sessions ? JSON.parse(sessions) : [];

        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentSessions = allSessions.filter((s) => s.startTime >= sevenDaysAgo);

        // Group by day
        const byDay: { [key: string]: ReviewSession[] } = {};
        recentSessions.forEach((session) => {
            const date = new Date(session.startTime).toISOString().split('T')[0];
            if (!byDay[date]) byDay[date] = [];
            byDay[date].push(session);
        });

        // Calculate accuracy per day
        return Object.entries(byDay)
            .map(([date, sessions]) => {
                const totalQuestions = sessions.reduce((sum, s) => sum + s.totalQuestions, 0);
                const totalCorrect = sessions.reduce((sum, s) => sum + s.correctAnswers, 0);
                return {
                    date,
                    accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
                };
            })
            .sort((a, b) => a.date.localeCompare(b.date));
    },

    /**
     * Remove item from study queue
     */
    removeFromQueue: (studyItemId: string): void => {
        const queue = getStudyQueue();
        const filtered = queue.filter((i) => i.id !== studyItemId);
        localStorage.setItem(STUDY_QUEUE_KEY, JSON.stringify(filtered));
        localStorage.removeItem(STATS_CACHE_KEY);
    },

    /**
     * Clear all study data
     */
    clearAllData: (): void => {
        localStorage.removeItem(STUDY_QUEUE_KEY);
        localStorage.removeItem(REVIEW_SESSIONS_KEY);
        localStorage.removeItem(STATS_CACHE_KEY);
    },
};

/**
 * Helper: Get all study items
 */
const getStudyQueue = (): StudyItem[] => {
    const stored = localStorage.getItem(STUDY_QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
};
