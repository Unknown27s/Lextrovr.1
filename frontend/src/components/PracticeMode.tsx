import React, { useState, useEffect } from 'react';
import { ChevronRight, SkipForward, RotateCcw } from 'lucide-react';
import { spacedRepetitionService, StudyItem, ReviewSession, ReviewResult } from '../services/spacedRepetitionService';

interface PracticeModeProps {
    mode: 'quick' | 'standard' | 'focused';
    onComplete: (session: ReviewSession) => void;
    onClose: () => void;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ mode, onComplete, onClose }) => {
    const [studyQueue, setStudyQueue] = useState<StudyItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<{
        type: 'correct' | 'incorrect' | 'partial' | null;
        message: string;
        hints: string[];
    }>({
        type: null,
        message: '',
        hints: [],
    });
    const [showHints, setShowHints] = useState(false);
    const [hintLevel, setHintLevel] = useState(0);
    const [sessionResults, setSessionResults] = useState<ReviewResult[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [startTime, setStartTime] = useState(Date.now());
    const [itemStartTime, setItemStartTime] = useState(Date.now());
    const [attempts, setAttempts] = useState(0);

    // Load study queue
    useEffect(() => {
        const queue = spacedRepetitionService.getStudyQueue(mode);
        setStudyQueue(queue);
        setLoading(false);
    }, [mode]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-accent-teal border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="font-inter text-warm-charcoal">Loading study queue...</p>
                </div>
            </div>
        );
    }

    if (studyQueue.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 text-center max-w-md">
                    <h3 className="font-crimson text-2xl text-warm-charcoal mb-3">No words to review</h3>
                    <p className="font-inter text-warm-taupe mb-6">You're all caught up! Come back tomorrow for more words to practice.</p>
                    <button
                        onClick={onClose}
                        className="bg-accent-teal text-white px-6 py-2 rounded-lg font-inter font-medium hover:bg-opacity-90"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    if (isCompleted) {
        const correctCount = sessionResults.filter((r) => r.quality >= 3).length;
        const accuracy = Math.round((correctCount / sessionResults.length) * 100);

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-8 max-w-md w-full">
                    <h3 className="font-crimson text-2xl text-warm-charcoal mb-4">Session Complete!</h3>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <div className="font-crimson text-3xl text-green-700 font-semibold">{correctCount}</div>
                            <div className="text-xs text-green-700 font-inter">Correct</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-4 text-center">
                            <div className="font-crimson text-3xl text-amber-700 font-semibold">{accuracy}%</div>
                            <div className="text-xs text-amber-700 font-inter">Accuracy</div>
                        </div>
                    </div>

                    {/* Missed Words */}
                    {sessionResults.some((r) => r.quality < 3) && (
                        <div className="mb-6">
                            <h4 className="font-inter font-medium text-warm-charcoal mb-2">Review these words:</h4>
                            <div className="space-y-1">
                                {sessionResults
                                    .filter((r) => r.quality < 3)
                                    .map((result) => (
                                        <div key={result.studyItemId} className="text-sm font-inter text-warm-taupe">
                                            • {result.word}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full bg-accent-teal text-white py-3 rounded-lg font-inter font-medium hover:bg-opacity-90"
                    >
                        Done
                    </button>
                </div>
            </div>
        );
    }

    const currentItem = studyQueue[currentIndex];

    // Generate hints
    const hints = [
        `Definition: ${currentItem.word} is a(n) ${currentItem.difficulty} word`,
        `First letter: ${currentItem.word.charAt(0).toUpperCase()}...`,
        `Length: ${currentItem.word.length} characters`,
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isCorrect = userAnswer.toLowerCase().trim() === currentItem.word.toLowerCase().trim();
        const quality = isCorrect ? 5 : attempts >= 2 ? 1 : 3;

        const result: ReviewResult = {
            studyItemId: currentItem.id,
            word: currentItem.word,
            quality,
            timeSpent: Date.now() - itemStartTime,
            attempts: attempts + 1,
            userAnswer,
            correctAnswer: currentItem.word,
        };

        setSessionResults([...sessionResults, result]);
        spacedRepetitionService.recordReview(currentItem.id, quality, result.timeSpent, result.attempts);

        if (currentIndex + 1 >= studyQueue.length) {
            const session: ReviewSession = {
                id: `session_${Date.now()}`,
                userId: 'local_user',
                startTime,
                endTime: Date.now(),
                mode,
                totalQuestions: sessionResults.length + 1,
                correctAnswers: sessionResults.filter((r) => r.quality >= 3).length + (isCorrect ? 1 : 0),
                results: [...sessionResults, result],
                duration: Date.now() - startTime,
            };
            spacedRepetitionService.saveReviewSession(session);
            onComplete(session);
            setIsCompleted(true);
        } else {
            setCurrentIndex(currentIndex + 1);
            setUserAnswer('');
            setFeedback({ type: null, message: '', hints: [] });
            setShowHints(false);
            setHintLevel(0);
            setAttempts(0);
            setItemStartTime(Date.now());
        }
    };

    const handleRevealHint = () => {
        setShowHints(true);
        setHintLevel(Math.min(hintLevel + 1, hints.length - 1));
    };

    const handleSkip = () => {
        const result: ReviewResult = {
            studyItemId: currentItem.id,
            word: currentItem.word,
            quality: 0, // Failed - skipped
            timeSpent: Date.now() - itemStartTime,
            attempts,
            userAnswer: '',
            correctAnswer: currentItem.word,
        };

        setSessionResults([...sessionResults, result]);
        spacedRepetitionService.recordReview(currentItem.id, 0, result.timeSpent, result.attempts);

        if (currentIndex + 1 >= studyQueue.length) {
            const session: ReviewSession = {
                id: `session_${Date.now()}`,
                userId: 'local_user',
                startTime,
                endTime: Date.now(),
                mode,
                totalQuestions: sessionResults.length + 1,
                correctAnswers: sessionResults.filter((r) => r.quality >= 3).length,
                results: [...sessionResults, result],
                duration: Date.now() - startTime,
            };
            spacedRepetitionService.saveReviewSession(session);
            onComplete(session);
            setIsCompleted(true);
        } else {
            setCurrentIndex(currentIndex + 1);
            setUserAnswer('');
            setFeedback({ type: null, message: '', hints: [] });
            setShowHints(false);
            setHintLevel(0);
            setAttempts(0);
            setItemStartTime(Date.now());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-accent-teal text-white px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="font-crimson text-xl font-semibold">
                            {mode === 'quick' ? 'Quick Practice' : mode === 'standard' ? 'Standard Practice' : 'Focused (Hard Words)'}
                        </h3>
                        <p className="text-accent-teal/80 text-sm font-inter">
                            Question {currentIndex + 1} of {studyQueue.length}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/70 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-accent-teal h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentIndex + 1) / studyQueue.length) * 100}%` }}
                        ></div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-warm-cream rounded-lg p-6">
                        <p className="text-warm-taupe text-xs font-inter mb-2 uppercase tracking-wider">What does this mean?</p>
                        <p className="font-crimson text-3xl text-warm-charcoal font-semibold">{currentItem.word}</p>
                        <p className="text-sm text-warm-taupe font-inter mt-2">{currentItem.difficulty} difficulty</p>
                    </div>

                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-inter text-sm font-medium text-warm-charcoal mb-2">
                                Enter the definition or meaning:
                            </label>
                            <input
                                type="text"
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Type your answer..."
                                className="w-full px-4 py-3 border border-warm-border rounded-lg font-inter focus:outline-none focus:ring-2 focus:ring-accent-teal"
                                autoFocus
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="flex-1 bg-accent-teal text-white py-3 rounded-lg font-inter font-medium hover:bg-opacity-90 flex items-center justify-center gap-2"
                            >
                                Check
                                <ChevronRight size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="flex-1 bg-gray-200 text-warm-charcoal py-3 rounded-lg font-inter font-medium hover:bg-gray-300 flex items-center justify-center gap-2"
                            >
                                Skip
                                <SkipForward size={18} />
                            </button>
                        </div>
                    </form>

                    {/* Hints */}
                    <button
                        onClick={handleRevealHint}
                        disabled={hintLevel >= hints.length}
                        className="w-full py-2 border border-accent-teal text-accent-teal rounded-lg font-inter font-medium hover:bg-accent-teal/5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {showHints ? `Hint ${hintLevel} / ${hints.length}` : 'Get a Hint'}
                    </button>

                    {showHints && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="font-inter text-sm text-blue-900">
                                {hints.slice(0, hintLevel + 1).map((hint, idx) => (
                                    <div key={idx}>
                                        <span className="font-semibold">Hint {idx + 1}:</span> {hint}
                                    </div>
                                ))}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PracticeMode;
