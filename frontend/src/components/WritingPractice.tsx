import React, { useState, useEffect } from 'react';
import { WritingExercise, exerciseGenerator } from '../services/exerciseGenerator';

interface WritingPracticeProps {
    onClose?: () => void;
    difficulty?: 'easy' | 'medium' | 'hard';
}

export default function WritingPractice({ onClose, difficulty = 'medium' }: WritingPracticeProps) {
    const [exercise, setExercise] = useState<WritingExercise | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
    const [feedback, setFeedback] = useState<{ [key: number]: { isCorrect: boolean; message: string } }>({});
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState<{ correct: number; total: number } | null>(null);
    const [showHints, setShowHints] = useState<{ [key: number]: boolean }>({});
    const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>(difficulty);

    // Load exercise on mount
    useEffect(() => {
        const loadExercise = async () => {
            try {
                const newExercise = await exerciseGenerator.generateExercise(selectedDifficulty);
                setExercise(newExercise);
                setUserAnswers({});
                setFeedback({});
                setScore(null);
            } catch (error) {
                console.error('Failed to load exercise:', error);
            } finally {
                setLoading(false);
            }
        };

        loadExercise();
    }, [selectedDifficulty]);

    const handleAnswerChange = (blankNumber: number, value: string) => {
        setUserAnswers(prev => ({
            ...prev,
            [blankNumber]: value
        }));
    };

    const handleSubmitAll = () => {
        if (!exercise) return;

        let correct = 0;
        const newFeedback: typeof feedback = {};

        exercise.missing_words.forEach(mw => {
            const userAnswer = userAnswers[mw.blank_number] || '';
            const isCorrect = exerciseGenerator.validateAnswer(userAnswer, mw.word);
            if (isCorrect) correct++;
            newFeedback[mw.blank_number] = {
                isCorrect,
                message: exerciseGenerator.getFeedback(userAnswer, mw.word, isCorrect)
            };
        });

        setFeedback(newFeedback);
        setScore({ correct, total: exercise.missing_words.length });
    };

    const handleNewExercise = async () => {
        setLoading(true);
        try {
            const newExercise = await exerciseGenerator.generateExercise(selectedDifficulty);
            setExercise(newExercise);
            setUserAnswers({});
            setFeedback({});
            setScore(null);
            setShowHints({});
        } catch (error) {
            console.error('Failed to load new exercise:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
        setSelectedDifficulty(newDifficulty);
        setLoading(true);
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'easy':
                return 'bg-green-100 text-green-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'hard':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-warm-white">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-accent-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading exercise...</p>
                </div>
            </div>
        );
    }

    if (!exercise) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-warm-white">
                <div className="text-center">
                    <p className="text-text-primary font-serif text-2xl mb-4">Failed to load exercise</p>
                    <button
                        onClick={handleNewExercise}
                        className="px-6 py-2 bg-accent-teal hover:bg-accent-teal-dark text-white rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const scorePercentage = score ? Math.round((score.correct / score.total) * 100) : 0;

    return (
        <div className="min-h-screen bg-warm-white py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="font-serif text-3xl text-text-primary font-semibold">Writing Practice</h1>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-warm-gray rounded-lg transition-colors"
                                aria-label="Close"
                            >
                                <svg className="w-6 h-6 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Difficulty Selector */}
                    {score === null && !loading && (
                        <div className="mb-4 flex gap-2">
                            {(['easy', 'medium', 'hard'] as const).map(level => (
                                <button
                                    key={level}
                                    onClick={() => handleDifficultyChange(level)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${selectedDifficulty === level
                                        ? `${getDifficultyColor(level)} shadow-sm`
                                        : 'bg-warm-gray text-text-secondary hover:bg-warm-gray-dark'
                                        }`}
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Metadata */}
                    {exercise && (
                        <div className="flex flex-wrap gap-3 items-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                                {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                            </span>
                            <span className="text-text-secondary text-sm">
                                Topic: <span className="font-medium text-text-primary">{exercise.topic}</span>
                            </span>
                            <span className="text-text-secondary text-sm">
                                {exercise.missing_words.length} blanks to fill
                            </span>
                        </div>
                    )}
                </div>

                {/* Exercise Card */}
                <div className="bg-white rounded-card-lg shadow-card border border-warm-gray-dark p-8 mb-8">
                    {/* Paragraph with Blanks */}
                    <div className="mb-8">
                        <p className="text-lg leading-relaxed text-text-primary font-serif">
                            {exercise.paragraph_with_blanks.split(/____/).map((part, idx) => (
                                <React.Fragment key={idx}>
                                    <span className="inline">{part}</span>
                                    {idx < exercise.missing_words.length && (
                                        <span className="inline-block mx-1">
                                            <input
                                                type="text"
                                                value={userAnswers[idx + 1] || ''}
                                                onChange={(e) => handleAnswerChange(idx + 1, e.target.value)}
                                                placeholder={`[${idx + 1}]`}
                                                maxLength={20}
                                                className={`px-3 py-2 border-b-2 bg-transparent focus:outline-none transition-colors text-center font-medium min-w-[80px] ${feedback[idx + 1]
                                                    ? feedback[idx + 1].isCorrect
                                                        ? 'border-green-500 text-green-700'
                                                        : 'border-red-500 text-red-700'
                                                    : 'border-accent-teal text-text-primary'
                                                    }`}
                                                disabled={score !== null}
                                            />
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </p>
                    </div>

                    {/* Answer Grid */}
                    <div className="space-y-4 border-t border-warm-gray pt-6">
                        <h3 className="font-serif text-lg text-text-primary font-semibold">Hints & Answers</h3>

                        <div className="grid grid-cols-1 gap-4">
                            {exercise.missing_words.map((mw) => (
                                <div
                                    key={mw.blank_number}
                                    className={`p-4 rounded-lg border-2 transition-colors ${feedback[mw.blank_number]
                                        ? feedback[mw.blank_number].isCorrect
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-red-300 bg-red-50'
                                        : 'border-warm-gray-dark bg-warm-white'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="font-semibold text-text-primary">
                                            Blank {mw.blank_number}
                                        </span>
                                        <button
                                            onClick={() => setShowHints(prev => ({
                                                ...prev,
                                                [mw.blank_number]: !prev[mw.blank_number]
                                            }))}
                                            className="text-sm text-accent-teal hover:underline font-medium"
                                        >
                                            {showHints[mw.blank_number] ? 'Hide' : 'Show'} Hint
                                        </button>
                                    </div>

                                    {showHints[mw.blank_number] && (
                                        <div className="text-sm text-text-secondary mb-3 p-3 bg-white rounded border border-warm-gray">
                                            💡 {mw.hint}
                                        </div>
                                    )}

                                    {feedback[mw.blank_number] && (
                                        <div className={`text-sm mb-2 ${feedback[mw.blank_number].isCorrect
                                            ? 'text-green-700'
                                            : 'text-red-700'
                                            }`}>
                                            {feedback[mw.blank_number].message}
                                        </div>
                                    )}

                                    {score !== null && (
                                        <p className="text-sm font-semibold text-text-primary">
                                            Answer: <span className="text-accent-teal">{mw.word}</span>
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 flex-wrap">
                    {score === null ? (
                        <button
                            onClick={handleSubmitAll}
                            className="flex-1 px-6 py-3 bg-accent-teal hover:bg-accent-teal-dark text-white font-medium rounded-lg transition-colors"
                        >
                            Submit Answers
                        </button>
                    ) : (
                        <>
                            {/* Score Display */}
                            <div className="flex-1 bg-accent-teal/10 rounded-lg p-6 text-center">
                                <p className="text-text-secondary text-sm mb-2">Your Score</p>
                                <p className="font-serif text-4xl text-accent-teal font-bold mb-1">
                                    {score.correct}/{score.total}
                                </p>
                                <p className="text-text-primary font-medium">
                                    {scorePercentage}% Correct
                                </p>
                            </div>

                            <button
                                onClick={handleNewExercise}
                                className="flex-1 px-6 py-3 bg-accent-teal hover:bg-accent-teal-dark text-white font-medium rounded-lg transition-colors"
                            >
                                Next Exercise
                            </button>
                        </>
                    )}
                </div>

                {/* Original Paragraph (Reference) */}
                <div className="mt-8 p-6 bg-warm-gray rounded-card border border-warm-gray-dark">
                    <p className="text-sm text-text-muted mb-3 font-semibold">Original Paragraph (for reference):</p>
                    <p className="text-text-secondary leading-relaxed italic">
                        {exercise.paragraph_original}
                    </p>
                </div>
            </div>
        </div>
    );
}
