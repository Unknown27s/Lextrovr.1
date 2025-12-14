import React, { useState } from 'react';
import { VocabItem } from '../api/client';

interface VocabCardProps {
    item: VocabItem;
    onSave: (id: string) => void;
    onPractice: (id: string) => void;
    onUseInDocument: (id: string) => void;
    source?: 'offline' | 'cache' | 'online';
    isSaved?: boolean;
}

const VocabCard: React.FC<VocabCardProps> = ({
    item,
    onSave,
    onPractice,
    onUseInDocument,
    source,
    isSaved = false,
}) => {
    const [expanded, setExpanded] = useState(false);
    const [saved, setSaved] = useState(isSaved);
    const [showSaveToast, setShowSaveToast] = useState(false);

    const difficultyDots = {
        easy: 1,
        medium: 3,
        hard: 5,
    };

    const handleSave = () => {
        setSaved(!saved);
        onSave(item.id);
        // Show brief toast feedback
        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 1500);
    };

    const handlePronounce = () => {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(item.word);
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        }
    };

    const getFormattedDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            if (date.toDateString() === today.toDateString()) {
                return 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                return 'Yesterday';
            } else {
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
        } catch {
            return 'Unknown';
        }
    };

    // Category mapping for words
    const getCategoryTag = () => {
        const categoryMap: { [key: string]: { label: string; color: string } } = {
            'leer': { label: 'Expression', color: 'bg-blue-100 text-blue-700' },
            'constrain': { label: 'Expression', color: 'bg-blue-100 text-blue-700' },
            'glare': { label: 'Expression', color: 'bg-blue-100 text-blue-700' },
            'smirk': { label: 'Expression', color: 'bg-blue-100 text-blue-700' },
            'grimace': { label: 'Expression', color: 'bg-blue-100 text-blue-700' },
            'scowl': { label: 'Expression', color: 'bg-blue-100 text-blue-700' },
            'sneer': { label: 'Expression', color: 'bg-blue-100 text-blue-700' },
            'bemoan': { label: 'Expression', color: 'bg-blue-100 text-blue-700' },
            'articulate': { label: 'Expression', color: 'bg-blue-100 text-blue-700' },
            'despairing': { label: 'Emotion', color: 'bg-pink-100 text-pink-700' },
            'hopeful': { label: 'Emotion', color: 'bg-pink-100 text-pink-700' },
            'blustery': { label: 'Emotion', color: 'bg-pink-100 text-pink-700' },
            'placid': { label: 'Emotion', color: 'bg-pink-100 text-pink-700' },
            'volatile': { label: 'Emotion', color: 'bg-pink-100 text-pink-700' },
            'serene': { label: 'Emotion', color: 'bg-pink-100 text-pink-700' },
            'jubilant': { label: 'Emotion', color: 'bg-pink-100 text-pink-700' },
            'meander': { label: 'Movement', color: 'bg-purple-100 text-purple-700' },
            'lurk': { label: 'Action', color: 'bg-orange-100 text-orange-700' },
            'trudge': { label: 'Movement', color: 'bg-purple-100 text-purple-700' },
            'scurry': { label: 'Movement', color: 'bg-purple-100 text-purple-700' },
            'cavort': { label: 'Movement', color: 'bg-purple-100 text-purple-700' },
            'traverse': { label: 'Movement', color: 'bg-purple-100 text-purple-700' },
            'amble': { label: 'Movement', color: 'bg-purple-100 text-purple-700' },
            'hasten': { label: 'Action', color: 'bg-orange-100 text-orange-700' },
            'skulk': { label: 'Movement', color: 'bg-purple-100 text-purple-700' },
            'saunter': { label: 'Movement', color: 'bg-purple-100 text-purple-700' },
            'vale': { label: 'Place', color: 'bg-green-100 text-green-700' },
            'precipice': { label: 'Place', color: 'bg-green-100 text-green-700' },
            'knoll': { label: 'Place', color: 'bg-green-100 text-green-700' },
            'cove': { label: 'Place', color: 'bg-green-100 text-green-700' },
            'chasm': { label: 'Place', color: 'bg-green-100 text-green-700' },
            'plateau': { label: 'Place', color: 'bg-green-100 text-green-700' },
        };

        const category = categoryMap[item.word.toLowerCase()];
        if (category) {
            return (
                <span className={`inline-block px-2 py-0.5 ${category.color} rounded-full text-xs font-medium`}>
                    {category.label}
                </span>
            );
        }
        return null;
    };

    // Hide offline badge if word is saved
    const shouldShowSourceBadge = () => {
        if (saved || !source) return false;
        return source === 'offline' || source === 'cache' || source === 'online';
    };

    const getSourceBadge = () => {
        if (!shouldShowSourceBadge()) return null;

        const badgeConfig = {
            offline: { bg: 'bg-green-100', text: 'text-green-700', label: '📚 Offline' },
            cache: { bg: 'bg-blue-100', text: 'text-blue-700', label: '💾 Cached' },
            online: { bg: 'bg-purple-100', text: 'text-purple-700', label: '🌐 Online' },
        };

        const config = badgeConfig[source || 'online'];
        return (
            <span
                className={`inline-block px-2 py-0.5 ${config.bg} ${config.text} rounded-full text-xs font-medium ml-2`}
            >
                {config.label}
            </span>
        );
    };

    return (
        <article className="bg-card-bg rounded-card shadow-card hover:shadow-card-hover transition-all duration-200 p-card-padding mx-4 mb-card-margin transform hover:scale-[1.01]">
            {/* Top row: Word + POS + Difficulty + Source Badge */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-serif text-word-title text-text-primary mb-1">{item.word}</h3>
                        <button
                            onClick={handlePronounce}
                            className="p-1.5 hover:bg-warm-gray rounded-lg transition-colors"
                            title="Pronounce word"
                            aria-label={`Pronounce ${item.word}`}
                        >
                            <svg className="w-5 h-5 text-accent-teal" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5h-2v-2h2l5 5v2zm6-6c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1zm0-4c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1zm4 10h-2v-2h2v2zm0-4h-2v-2h2v2z" />
                            </svg>
                        </button>
                        {getSourceBadge()}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        {item.pos && (
                            <span className="inline-block px-2 py-0.5 bg-warm-gray rounded-full text-xs text-text-secondary font-medium">
                                {item.pos}
                            </span>
                        )}
                        {getCategoryTag()}
                    </div>
                </div>
                {/* Difficulty dots */}
                <div className="flex items-center space-x-1 ml-3">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${i < difficultyDots[item.difficulty]
                                ? 'bg-accent-teal'
                                : 'bg-warm-gray-dark'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Definition */}
            <p className="text-body-sm text-text-secondary mb-4 leading-relaxed">
                {item.definition}
            </p>

            {/* Synonyms row */}
            {item.synonyms && item.synonyms.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {item.synonyms.slice(0, expanded ? undefined : 4).map((syn) => (
                        <button
                            key={syn}
                            className="inline-flex items-center px-3 py-1 bg-warm-gray hover:bg-warm-gray-dark rounded-full text-sm text-text-secondary transition-colors"
                        >
                            {syn}
                        </button>
                    ))}
                    {item.synonyms.length > 4 && !expanded && (
                        <button
                            onClick={() => setExpanded(true)}
                            className="inline-flex items-center px-3 py-1 text-sm text-accent-teal hover:text-accent-teal-dark"
                        >
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {item.synonyms.length - 4} more
                        </button>
                    )}
                </div>
            )}

            {/* Examples (collapsible) */}
            {expanded && (
                <div className="mb-4 space-y-3 animate-fade-up">
                    {item.example_corpus && (
                        <p className="text-body-sm text-text-primary italic pl-3 border-l-2 border-warm-gray-dark">
                            "{item.example_corpus}"
                        </p>
                    )}
                    {item.ai_example && (
                        <div className="pl-3 border-l-2 border-accent-teal/30">
                            <p className="text-body-sm text-text-secondary italic">
                                "{item.ai_example}"
                            </p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-accent-teal/10 rounded text-xs text-accent-teal font-medium">
                                in your voice
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-warm-gray-dark">
                <div className="flex space-x-2">
                    <button
                        onClick={() => onPractice(item.id)}
                        className="inline-flex items-center px-4 py-2 bg-accent-teal hover:bg-accent-teal-dark text-white rounded-lg text-sm font-medium transition-colors focus-visible:ring-accent"
                        aria-label="Practice this word"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Practice
                    </button>

                    {/* Simple Save Button - No Glow, Green when Saved */}
                    <button
                        onClick={handleSave}
                        className={`p-2 rounded-lg transition-colors ${saved
                            ? 'bg-green-500 text-white'
                            : 'border border-warm-gray-dark text-text-secondary hover:border-text-secondary'
                            }`}
                        aria-label={saved ? 'Unsave word' : 'Save word'}
                        title={saved ? 'Click to remove from saved' : 'Click to save'}
                    >
                        <svg className="w-5 h-5" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                    </button>

                    <button
                        onClick={() => onUseInDocument(item.id)}
                        className="inline-flex items-center px-4 py-2 border border-warm-gray-dark hover:border-accent-teal text-text-secondary hover:text-accent-teal rounded-lg text-sm font-medium transition-colors"
                        aria-label="Use in document"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Use
                    </button>
                </div>
                {!expanded && (item.example_corpus || item.ai_example) && (
                    <button
                        onClick={() => setExpanded(true)}
                        className="text-sm text-text-muted hover:text-text-secondary"
                    >
                        Examples
                    </button>
                )}
            </div>

            {/* Date Added Footer */}
            {item.created_at && (
                <div className="mt-3 pt-3 border-t border-warm-gray-dark">
                    <p className="text-xs text-text-muted">
                        📅 Added {getFormattedDate(item.created_at)}
                    </p>
                </div>
            )}

            {/* Save Feedback Toast */}
            {showSaveToast && (
                <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium animate-pulse z-50">
                    {saved ? '✓ Saved!' : '✗ Removed from saved'}
                </div>
            )}
        </article>
    );
};

export default VocabCard;
