import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, Volume2, Check, X } from 'lucide-react';
import { dictionaryApi, localStorageApi } from '../api/client';

interface FlashcardPracticeProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'flip' | 'guess' | 'mixed';
}

interface Flashcard {
    word: string;
    definition: string;
    phonetics: string[];
    synonyms: string[];
    category: string;
}

export const FlashcardPractice: React.FC<FlashcardPracticeProps> = ({
    isOpen,
    onClose,
    mode = 'mixed'
}) => {
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userGuess, setUserGuess] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [stats, setStats] = useState({ correct: 0, incorrect: 0, skipped: 0 });
    const [currentMode, setCurrentMode] = useState<'flip' | 'guess'>(mode === 'mixed' ? 'flip' : mode);
    const [showGuessInput, setShowGuessInput] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadFlashcards();
        }
    }, [isOpen]);

    const loadFlashcards = async () => {
        setLoading(true);
        try {
            const userVocab = localStorageApi.getUserVocab();
            if (userVocab.length === 0) {
                setCards([]);
                setLoading(false);
                return;
            }

            // Shuffle and limit to 10 words for practice
            const shuffled = userVocab
                .sort(() => Math.random() - 0.5)
                .slice(0, 10);

            const flashcards: Flashcard[] = shuffled.map((item: any) => ({
                word: item.vocab_item.word,
                definition: item.vocab_item.definition,
                phonetics: item.vocab_item.synonyms || [],
                synonyms: item.vocab_item.synonyms || [],
                category: item.vocab_item.tags?.[0] || 'other',
            }));

            setCards(flashcards);
            setCurrentIndex(0);
            setIsFlipped(false);
            setUserGuess('');
            setFeedback(null);
            setStats({ correct: 0, incorrect: 0, skipped: 0 });
        } catch (error) {
            console.error('Failed to load flashcards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFlip = () => {
        if (currentMode === 'flip') {
            setIsFlipped(!isFlipped);
        } else if (currentMode === 'guess') {
            setShowGuessInput(!showGuessInput);
        }
    };

    const handleGuessSubmit = (guess: string) => {
        const isCorrect = guess.toLowerCase().trim() === currentCard.word.toLowerCase().trim();

        setFeedback(isCorrect ? 'correct' : 'incorrect');

        if (isCorrect) {
            setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
            localStorageApi.addPracticeAttempt(currentCard.word, true);
        } else {
            setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
            localStorageApi.addPracticeAttempt(currentCard.word, false);
        }

        setUserGuess('');
        setTimeout(() => {
            nextCard();
        }, 1500);
    };

    const handleSkip = () => {
        setStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
        nextCard();
    };

    const nextCard = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
            setShowGuessInput(false);
            setFeedback(null);
            setUserGuess('');
        } else {
            // Session complete
            showCompletionModal();
        }
    };

    const previousCard = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setIsFlipped(false);
            setShowGuessInput(false);
            setFeedback(null);
            setUserGuess('');
        }
    };

    const handleSpeak = (word: string) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(word);
            utterance.lang = 'en-US';
            speechSynthesis.speak(utterance);
        }
    };

    const resetSession = () => {
        loadFlashcards();
    };

    const showCompletionModal = () => {
        const accuracy = Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100) || 0;

        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Session Complete! 🎉</h2>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
                            <div className="text-xs text-text-muted">Correct</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
                            <div className="text-xs text-text-muted">Incorrect</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
                            <div className="text-xs text-text-muted">Accuracy</div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={resetSession}
                            className="flex-1 bg-accent-teal text-white py-2 rounded-lg hover:bg-accent-teal-dark"
                        >
                            Again
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 bg-warm-gray text-text-primary py-2 rounded-lg hover:bg-warm-gray-dark"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (!isOpen) return null;
    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-accent-teal border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-text-secondary">Loading flashcards...</p>
                </div>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl p-8 text-center max-w-md">
                    <h2 className="text-xl font-bold text-text-primary mb-3">No Words to Practice</h2>
                    <p className="text-text-secondary mb-6">Add some words to your vocabulary first!</p>
                    <button
                        onClick={onClose}
                        className="bg-accent-teal text-white px-6 py-2 rounded-lg hover:bg-accent-teal-dark"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];
    const progressPercent = ((currentIndex + 1) / cards.length) * 100;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-screen overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-accent-teal to-accent-teal-dark text-white p-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Flashcard Practice</h1>
                        <p className="text-sm opacity-90">Card {currentIndex + 1} of {cards.length}</p>
                    </div>
                    <button onClick={onClose} className="text-2xl hover:opacity-75">×</button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-warm-gray">
                    <div
                        className="h-full bg-accent-teal transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Mode Selector */}
                <div className="flex gap-2 p-4 bg-warm-white border-b border-warm-gray">
                    <button
                        onClick={() => setCurrentMode('flip')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${currentMode === 'flip'
                                ? 'bg-accent-teal text-white'
                                : 'bg-warm-gray text-text-secondary'
                            }`}
                    >
                        Flip Mode
                    </button>
                    <button
                        onClick={() => setCurrentMode('guess')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${currentMode === 'guess'
                                ? 'bg-accent-teal text-white'
                                : 'bg-warm-gray text-text-secondary'
                            }`}
                    >
                        Guess Mode
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Flip Mode */}
                    {currentMode === 'flip' && (
                        <div className="space-y-6">
                            <div
                                onClick={handleFlip}
                                className={`min-h-64 rounded-xl p-8 cursor-pointer transition-all transform flex items-center justify-center ${isFlipped
                                        ? 'bg-gradient-to-br from-blue-50 to-blue-100'
                                        : 'bg-gradient-to-br from-accent-teal to-accent-teal-dark'
                                    }`}
                            >
                                <div className="text-center">
                                    <p className="text-sm opacity-75 mb-2">
                                        {isFlipped ? 'Definition' : 'Word'}
                                    </p>
                                    <p className={`text-3xl font-bold ${isFlipped ? 'text-blue-900' : 'text-white'}`}>
                                        {isFlipped ? currentCard.definition : currentCard.word}
                                    </p>
                                    <p className="text-xs opacity-50 mt-4">Click to flip</p>
                                </div>
                            </div>

                            {isFlipped && currentCard.synonyms.length > 0 && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm font-semibold text-blue-900 mb-2">Synonyms:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {currentCard.synonyms.slice(0, 3).map((syn, idx) => (
                                            <span key={idx} className="bg-white px-3 py-1 rounded-full text-sm text-blue-800">
                                                {syn}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Guess Mode */}
                    {currentMode === 'guess' && (
                        <div className="space-y-6">
                            <div className="bg-accent-teal/10 p-8 rounded-xl text-center">
                                <p className="text-sm text-text-secondary mb-3">Definition:</p>
                                <p className="text-xl font-semibold text-text-primary">{currentCard.definition}</p>
                                <p className="text-xs text-text-muted mt-2">Category: {currentCard.category}</p>
                            </div>

                            {!showGuessInput ? (
                                <button
                                    onClick={() => setShowGuessInput(true)}
                                    className="w-full bg-accent-teal text-white py-3 rounded-lg font-semibold hover:bg-accent-teal-dark"
                                >
                                    Show Input
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={userGuess}
                                        onChange={(e) => setUserGuess(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleGuessSubmit(userGuess)}
                                        placeholder="Type the word..."
                                        className="w-full px-4 py-3 border-2 border-accent-teal rounded-lg focus:outline-none"
                                        autoFocus
                                    />

                                    {feedback && (
                                        <div className={`p-4 rounded-lg flex items-center gap-3 ${feedback === 'correct' ? 'bg-green-50' : 'bg-red-50'
                                            }`}>
                                            {feedback === 'correct' ? (
                                                <>
                                                    <Check className="text-green-600" size={24} />
                                                    <span className="text-green-700 font-semibold">Correct! The word is "{currentCard.word}"</span>
                                                </>
                                            ) : (
                                                <>
                                                    <X className="text-red-600" size={24} />
                                                    <span className="text-red-700">The word is <strong>{currentCard.word}</strong></span>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {!feedback && (
                                        <button
                                            onClick={() => handleGuessSubmit(userGuess)}
                                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                                        >
                                            Submit
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 p-6 bg-warm-white border-t border-warm-gray">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
                        <div className="text-xs text-text-muted">Correct</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
                        <div className="text-xs text-text-muted">Incorrect</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.skipped}</div>
                        <div className="text-xs text-text-muted">Skipped</div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-3 p-6 bg-white border-t border-warm-gray">
                    <button
                        onClick={previousCard}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-warm-gray text-text-primary rounded-lg hover:bg-warm-gray-dark disabled:opacity-50"
                    >
                        <ChevronLeft size={20} /> Previous
                    </button>

                    <button
                        onClick={handleSkip}
                        className="flex-1 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-semibold"
                    >
                        Skip
                    </button>

                    <button
                        onClick={nextCard}
                        className="flex items-center gap-2 px-4 py-2 bg-accent-teal text-white rounded-lg hover:bg-accent-teal-dark"
                    >
                        Next <ChevronRight size={20} />
                    </button>

                    <button
                        onClick={handleSpeak}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                    >
                        <Volume2 size={20} />
                    </button>
                </div>
            </div>

            {/* Completion Modal */}
            {currentIndex === cards.length - 1 && feedback && (
                showCompletionModal()
            )}
        </div>
    );
};

export default FlashcardPractice;
