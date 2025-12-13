import React, { useState, useEffect } from 'react';
import { localStorageApi, VocabItem, dictionaryApi } from '../api/client';
import { Check, X, Volume2 } from 'lucide-react';

interface PracticeModalProps {
    isOpen: boolean;
    vocabId: string;
    onClose: () => void;
    onSubmit: (result: any) => void;
}

type ExerciseType = 'choose_synonym' | 'fill_blank' | 'define' | 'spell';

const PracticeModal: React.FC<PracticeModalProps> = ({ isOpen, vocabId, onClose, onSubmit }) => {
    const [exercise, setExercise] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState('');
    const [selectedOption, setSelectedOption] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [exerciseType, setExerciseType] = useState<ExerciseType>('choose_synonym');

    useEffect(() => {
        if (isOpen && vocabId) {
            loadExercise();
        }
    }, [isOpen, vocabId]);

    const loadExercise = async () => {
        setLoading(true);
        try {
            const userVocab = localStorageApi.getUserVocab();
            const item = userVocab.find((uv: any) => uv.vocab_item_id === vocabId);

            if (item) {
                const word = item.vocab_item.word;
                const definition = item.vocab_item.definition;
                const synonyms = item.vocab_item.synonyms || [];

                // Randomly select exercise type
                const types: ExerciseType[] = ['choose_synonym', 'fill_blank', 'define', 'spell'];
                const type = types[Math.floor(Math.random() * types.length)];
                setExerciseType(type);

                const exercise: any = {
                    type,
                    word,
                    definition,
                    synonyms,
                };

                if (type === 'choose_synonym') {
                    exercise.question = `What is a synonym for "${word}"?`;
                    exercise.options = synonyms.length > 0
                        ? [synonyms[0], 'miscellaneous', 'peripheral', 'mundane'].sort(() => Math.random() - 0.5)
                        : ['option1', 'option2', 'option3', 'option4'];
                    exercise.correct = synonyms[0] || exercise.options[0];
                } else if (type === 'fill_blank') {
                    exercise.question = `Fill in the blank with the correct word:\n\n"The speaker's ${word} choice of words impressed the audience."`;
                    exercise.correctAnswer = word;
                } else if (type === 'define') {
                    exercise.question = `What does "${word}" mean?`;
                    exercise.correctAnswer = definition;
                } else if (type === 'spell') {
                    exercise.question = `Spell the word that means: "${definition}"`;
                    exercise.correctAnswer = word;
                }

                setExercise(exercise);
            }
            setAnswer('');
            setSelectedOption('');
            setSubmitted(false);
            setIsCorrect(false);
        } catch (error) {
            console.error('Failed to load exercise:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkAnswer = () => {
        let correct = false;

        if (exerciseType === 'choose_synonym') {
            correct = selectedOption === exercise.correct;
        } else if (exerciseType === 'fill_blank') {
            correct = answer.toLowerCase().trim() === exercise.correctAnswer.toLowerCase();
        } else if (exerciseType === 'define') {
            // Simple check - contains key words from definition
            const answerWords = answer.toLowerCase().split(' ');
            const correctWords = exercise.correctAnswer.toLowerCase().split(' ');
            const matches = correctWords.filter((w: string) => answerWords.includes(w)).length;
            correct = matches >= Math.max(2, correctWords.length / 2);
        } else if (exerciseType === 'spell') {
            correct = answer.toLowerCase().trim() === exercise.correctAnswer.toLowerCase();
        }

        return correct;
    };

    const handleSubmit = async () => {
        if (!answer && !selectedOption) return;

        const correct = checkAnswer();
        setIsCorrect(correct);
        setSubmitted(true);

        try {
            localStorageApi.addPracticeAttempt(vocabId, correct);

            const userVocab = localStorageApi.getUserVocab();
            const item = userVocab.find((uv: any) => uv.vocab_item_id === vocabId);
            if (item) {
                localStorageApi.updatePracticeScore(item.id, correct);
            }

            onSubmit({ success: true, isCorrect: correct });

            setTimeout(() => {
                onClose();
            }, 2500);
        } catch (error) {
            console.error('Failed to submit exercise:', error);
        }
    };

    const handleSpeak = () => {
        if ('speechSynthesis' in window && exercise) {
            const utterance = new SpeechSynthesisUtterance(exercise.word);
            utterance.lang = 'en-US';
            speechSynthesis.speak(utterance);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-text-primary">Practice Exercise</h2>
                    <button
                        onClick={onClose}
                        className="text-2xl text-text-secondary hover:text-text-primary"
                    >
                        ×
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin h-8 w-8 border-4 border-accent-teal border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-text-secondary">Loading exercise...</p>
                    </div>
                ) : exercise ? (
                    <>
                        {/* Exercise Type Badge */}
                        <div className="mb-4">
                            <span className="inline-block bg-accent-teal/10 text-accent-teal px-3 py-1 rounded-full text-sm font-semibold">
                                {exerciseType === 'choose_synonym' && '🎯 Multiple Choice'}
                                {exerciseType === 'fill_blank' && '📝 Fill the Blank'}
                                {exerciseType === 'define' && '📖 Definition'}
                                {exerciseType === 'spell' && '🔤 Spelling'}
                            </span>
                        </div>

                        {/* Question */}
                        <div className="bg-warm-white p-6 rounded-lg mb-6 border border-warm-gray">
                            <p className="text-lg font-semibold text-text-primary whitespace-pre-line mb-3">
                                {exercise.question}
                            </p>

                            {exercise.word && (
                                <button
                                    onClick={handleSpeak}
                                    className="flex items-center gap-2 text-accent-teal hover:text-accent-teal-dark font-medium"
                                >
                                    <Volume2 size={18} />
                                    Hear pronunciation
                                </button>
                            )}
                        </div>

                        {/* Options */}
                        {exerciseType === 'choose_synonym' ? (
                            <div className="space-y-3 mb-6">
                                {exercise.options?.map((option: string) => (
                                    <label
                                        key={option}
                                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedOption === option
                                                ? 'border-accent-teal bg-accent-teal/5'
                                                : 'border-warm-gray hover:border-accent-teal hover:bg-warm-white'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="option"
                                            value={option}
                                            checked={selectedOption === option}
                                            onChange={(e) => setSelectedOption(e.target.value)}
                                            className="mr-3 w-4 h-4"
                                        />
                                        <span className="text-text-primary font-medium">{option}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="mb-6">
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                                    placeholder={
                                        exerciseType === 'fill_blank' ? 'Type the word...' :
                                            exerciseType === 'spell' ? 'Spell the word...' :
                                                'Describe the meaning...'
                                    }
                                    className="w-full px-4 py-3 border-2 border-warm-gray rounded-lg focus:outline-none focus:border-accent-teal text-text-primary placeholder-text-muted"
                                    disabled={submitted}
                                    autoFocus
                                />
                            </div>
                        )}

                        {/* Feedback */}
                        {submitted && (
                            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                }`}>
                                {isCorrect ? (
                                    <>
                                        <Check className="text-green-600" size={24} />
                                        <div>
                                            <p className="font-semibold text-green-700">Correct! 🎉</p>
                                            <p className="text-sm text-green-600">Great job! Keep practicing.</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <X className="text-red-600" size={24} />
                                        <div>
                                            <p className="font-semibold text-red-700">Not quite right</p>
                                            <p className="text-sm text-red-600">
                                                The correct answer is: <strong>{exercise.correct || exercise.correctAnswer}</strong>
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-warm-gray text-text-primary rounded-lg hover:bg-warm-gray-dark font-semibold transition-all"
                            >
                                Close
                            </button>
                            {!submitted && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={!answer && !selectedOption}
                                    className="flex-1 px-4 py-3 bg-accent-teal text-white rounded-lg hover:bg-accent-teal-dark font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Submit Answer
                                </button>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default PracticeModal;
