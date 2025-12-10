import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setLoading, addItems } from '../store/feedSlice';
import { localStorageApi, dictionaryApi } from '../api/client';
import VocabCard from './VocabCard';

interface VocabFeedProps {
    onPractice: (id: string) => void;
    onUseInDocument: (id: string) => void;
    showTypeSelector?: boolean;
}

const VocabFeed: React.FC<VocabFeedProps> = ({ onPractice, onUseInDocument, showTypeSelector = false }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { items, loading } = useSelector((state: RootState) => state.feed);
    const loaderRef = useRef<HTMLDivElement>(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [loadingSamples, setLoadingSamples] = useState(false);
    const [selectedType, setSelectedType] = useState('random');
    const [apiWords, setApiWords] = useState<any[]>([]);
    const [customCategories, setCustomCategories] = useState<Array<{ id: string, label: string, icon: string, words: string[] }>>([]);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryWords, setNewCategoryWords] = useState('');
    const [savedWordIds, setSavedWordIds] = useState<Set<string>>(new Set());
    const [displayedWordCount, setDisplayedWordCount] = useState(0);
    const [allCategoryWords, setAllCategoryWords] = useState<string[]>([]);
    const [filterType, setFilterType] = useState<'all' | 'recent' | 'trending' | 'difficulty'>('all');
    const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

    // Comprehensive word lists by category
    const wordsByCategory: { [key: string]: string[] } = {
        random: ['eloquent', 'ephemeral', 'ubiquitous', 'sanguine', 'mellifluous', 'pragmatic', 'taciturn', 'querulous', 'ebullient', 'ephemeral', 'perspicacious', 'verbose', 'laconic', 'obfuscate', 'ameliorate', 'exacerbate', 'serendipity', 'pandemonium', 'euphoria', 'malaise'],
        expression: ['leer', 'constrain', 'glare', 'smirk', 'grimace', 'scowl', 'sneer', 'bemoan', 'articulate', 'elucidate', 'pontificate', 'expound', 'harangue', 'castigate', 'admonish', 'exhort'],
        emotion: ['despairing', 'hopeful', 'blustery', 'placid', 'volatile', 'serene', 'jubilant', 'melancholic', 'tranquil', 'morose', 'sanguine', 'despondent', 'elated', 'dejected', 'buoyant'],
        action: ['meander', 'lurk', 'trudge', 'scurry', 'cavort', 'traverse', 'amble', 'hasten', 'skulk', 'saunter', 'procrastinate', 'languish', 'toil', 'dally', 'squander'],
        place: ['vale', 'precipice', 'knoll', 'cove', 'chasm', 'gorge', 'dell', 'plateau', 'ravine', 'glade', 'archipelago', 'moor', 'estuary', 'lagoon', 'tundra'],
        movement: ['slither', 'glide', 'saunter', 'skulk', 'spiral', 'undulate', 'propel', 'careen', 'hurtle', 'meander', 'flounder', 'lurch', 'shuffle', 'amble', 'pirouette'],
    };

    // Load custom categories and saved words on mount
    useEffect(() => {
        const saved = localStorage.getItem('customCategories');
        if (saved) {
            setCustomCategories(JSON.parse(saved));
        }

        const savedVocab = localStorageApi.getUserVocab();
        const savedIds = new Set(savedVocab.map((v: any) => v.vocab_item_id));
        setSavedWordIds(savedIds);
    }, []);

    const getWordsForCategory = (type: string) => {
        const customCategory = customCategories.find(c => c.id === type);
        return customCategory ? customCategory.words : wordsByCategory[type] || wordsByCategory['random'];
    };

    const fetchApiWords = async (type: string) => {
        setLoadingSamples(true);
        setDisplayedWordCount(0);
        try {
            const words = getWordsForCategory(type);
            setAllCategoryWords(words);

            // Load first 3 words
            await loadMoreWords(words, 0);
        } catch (error) {
            console.error('Failed to fetch API words:', error);
        } finally {
            setLoadingSamples(false);
        }
    };

    const loadMoreWords = async (words: string[], startIndex: number) => {
        const batchSize = 3;
        const endIndex = Math.min(startIndex + batchSize, words.length);
        const wordsToFetch = words.slice(startIndex, endIndex);

        const fetchedWords = await Promise.all(
            wordsToFetch.map(async (word) => {
                try {
                    const data = await dictionaryApi.getWord(word);
                    const vocabItem = dictionaryApi.transformToVocabItem(data, word);
                    return vocabItem;
                } catch {
                    return null;
                }
            })
        );

        setApiWords(prev => [...prev, ...fetchedWords.filter(Boolean)]);
        setDisplayedWordCount(endIndex);
    };

    const handleTypeSelect = (type: string) => {
        setSelectedType(type);
        setApiWords([]);
        fetchApiWords(type);
    };

    const handleToggleSave = (vocabItem: any) => {
        const isSaved = savedWordIds.has(vocabItem.id);

        if (isSaved) {
            // Remove from saved
            const savedVocab = localStorageApi.getUserVocab();
            const itemToRemove = savedVocab.find((v: any) => v.vocab_item_id === vocabItem.id);
            if (itemToRemove) {
                localStorageApi.removeVocab(itemToRemove.id);
            }
            setSavedWordIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(vocabItem.id);
                return newSet;
            });
        } else {
            // Add to saved
            localStorageApi.saveVocab(vocabItem.id, vocabItem, 'saved');
            setSavedWordIds(prev => new Set(prev).add(vocabItem.id));
        }
    };

    const handleAddCategory = () => {
        if (!newCategoryName.trim() || !newCategoryWords.trim()) return;

        const words = newCategoryWords.split(',').map(w => w.trim()).filter(Boolean);
        const newCategory = {
            id: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
            label: newCategoryName,
            icon: '📝',
            words: words
        };

        const updated = [...customCategories, newCategory];
        setCustomCategories(updated);
        localStorage.setItem('customCategories', JSON.stringify(updated));

        setNewCategoryName('');
        setNewCategoryWords('');
        setShowAddCategory(false);
    };

    const loadMore = useCallback(async () => {
        dispatch(setLoading(true));
        try {
            const savedVocab = localStorageApi.getUserVocab();
            const vocabItems = savedVocab.map((sv: any) => sv.vocab_item);

            dispatch(
                addItems({
                    items: vocabItems,
                    nextCursor: null,
                }),
            );
        } catch (error) {
            console.error('Failed to load feed:', error);
        } finally {
            dispatch(setLoading(false));
        }
    }, [dispatch]);

    // Initial load
    useEffect(() => {
        if (isInitialLoad) {
            if (showTypeSelector) {
                fetchApiWords('random');
            } else {
                loadMore();
            }
            setIsInitialLoad(false);
        }
    }, [isInitialLoad, loadMore, showTypeSelector]);

    // Infinite scroll observer for home tab
    useEffect(() => {
        if (!showTypeSelector || !loaderRef.current) return;

        const observer = new IntersectionObserver(
            async entries => {
                if (entries[0].isIntersecting && !loadingSamples && displayedWordCount < allCategoryWords.length) {
                    await loadMoreWords(allCategoryWords, displayedWordCount);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(loaderRef.current);
        return () => observer.disconnect();
    }, [displayedWordCount, loadingSamples, allCategoryWords, showTypeSelector]);

    return (
        <div className="w-full pb-8">
            {showTypeSelector && (
                <div className="px-4 py-3 bg-white border-b border-warm-gray">
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                        What type of word would you like?
                    </label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {[
                            { id: 'random', label: 'Random', icon: '🎲' },
                            { id: 'expression', label: 'Expression', icon: '💬' },
                            { id: 'emotion', label: 'Emotion', icon: '😊' },
                            { id: 'action', label: 'Action', icon: '⚡' },
                            { id: 'place', label: 'Place', icon: '🏞️' },
                            { id: 'movement', label: 'Movement', icon: '🚶' },
                            ...customCategories
                        ].map((type) => (
                            <button
                                key={type.id}
                                onClick={() => handleTypeSelect(type.id)}
                                disabled={loadingSamples}
                                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all flex items-center gap-2 transform hover:scale-105 active:scale-95 ${selectedType === type.id
                                    ? 'bg-accent-teal text-white shadow-md'
                                    : 'bg-warm-gray text-text-secondary hover:bg-warm-gray-dark'
                                    } disabled:opacity-50`}
                            >
                                <span>{type.icon}</span>
                                <span>{type.label}</span>
                            </button>
                        ))}
                        <button
                            onClick={() => setShowAddCategory(!showAddCategory)}
                            className="px-4 py-2 rounded-full whitespace-nowrap font-medium bg-accent-violet text-white hover:bg-accent-violet-light transition-all flex items-center gap-2"
                        >
                            <span>➕</span>
                            <span>Add</span>
                        </button>
                    </div>

                    {/* Additional Filters Section */}
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all transform hover:scale-105 ${filterType === 'all'
                                ? 'bg-accent-teal text-white'
                                : 'bg-warm-gray text-text-secondary hover:bg-warm-gray-dark'
                                }`}
                        >
                            All Words
                        </button>
                        <button
                            onClick={() => setFilterType('recent')}
                            className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all transform hover:scale-105 ${filterType === 'recent'
                                ? 'bg-accent-teal text-white'
                                : 'bg-warm-gray text-text-secondary hover:bg-warm-gray-dark'
                                }`}
                        >
                            Recently Added
                        </button>
                        <button
                            onClick={() => setFilterType('trending')}
                            className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all transform hover:scale-105 ${filterType === 'trending'
                                ? 'bg-accent-teal text-white'
                                : 'bg-warm-gray text-text-secondary hover:bg-warm-gray-dark'
                                }`}
                        >
                            🔥 Trending
                        </button>
                        <button
                            onClick={() => setFilterType('difficulty')}
                            className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition-all transform hover:scale-105 ${filterType === 'difficulty'
                                ? 'bg-accent-teal text-white'
                                : 'bg-warm-gray text-text-secondary hover:bg-warm-gray-dark'
                                }`}
                        >
                            Difficulty
                        </button>
                    </div>

                    {/* Difficulty Filter Dropdown */}
                    {filterType === 'difficulty' && (
                        <div className="mt-3 flex gap-2">
                            {(['all', 'easy', 'medium', 'hard'] as const).map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setDifficultyFilter(level)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${difficultyFilter === level
                                        ? 'bg-accent-teal text-white'
                                        : 'bg-warm-gray text-text-secondary hover:bg-warm-gray-dark'
                                        }`}
                                >
                                    {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}

                    {showAddCategory && (
                        <div className="mt-4 p-4 bg-warm-white rounded-lg border border-warm-gray">
                            <h4 className="font-semibold text-text-primary mb-3">Create Custom Category</h4>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Category name (e.g., Science)"
                                className="w-full px-3 py-2 mb-2 border border-warm-gray rounded-lg focus:outline-none focus:border-accent-teal"
                            />
                            <textarea
                                value={newCategoryWords}
                                onChange={(e) => setNewCategoryWords(e.target.value)}
                                placeholder="Enter words separated by commas"
                                className="w-full px-3 py-2 mb-3 border border-warm-gray rounded-lg focus:outline-none focus:border-accent-teal resize-none"
                                rows={3}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddCategory}
                                    className="flex-1 px-4 py-2 bg-accent-teal text-white rounded-lg font-medium hover:bg-accent-teal-dark"
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => setShowAddCategory(false)}
                                    className="px-4 py-2 bg-warm-gray text-text-secondary rounded-lg font-medium hover:bg-warm-gray-dark"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="px-4 py-4 space-y-4">
                {/* Today's Word Banner - Only show on home tab */}
                {showTypeSelector && (
                    <div className="bg-gradient-to-r from-accent-teal to-accent-teal-dark rounded-card p-4 text-white shadow-card mb-4 transform hover:scale-[1.02] transition-transform">
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">Today's Word</p>
                        <h3 className="font-serif text-2xl font-bold mb-2 mt-1">{apiWords.length > 0 ? apiWords[0].word : 'Loading...'}</h3>
                        {apiWords.length > 0 && (
                            <>
                                <p className="text-sm opacity-95 mb-3">{apiWords[0].definition}</p>
                                <button
                                    onClick={() => {
                                        if (apiWords[0]) {
                                            handleToggleSave(apiWords[0]);
                                        }
                                    }}
                                    className="text-sm font-medium bg-white text-accent-teal hover:bg-warm-white rounded-lg px-3 py-1 transition-colors"
                                >
                                    {savedWordIds.has(apiWords[0].id) ? '✓ Saved' : '+ Save'}
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Home tab - Category words with infinite scroll */}
                {showTypeSelector && apiWords.length > 0 && (
                    <>
                        {apiWords.map((item: any) => (
                            <VocabCard
                                key={item.id}
                                item={item}
                                onSave={() => {
                                    const isSaved = savedWordIds.has(item.id);
                                    if (isSaved) {
                                        const savedVocab = localStorageApi.getUserVocab();
                                        const itemToRemove = savedVocab.find((v: any) => v.vocab_item_id === item.id);
                                        if (itemToRemove) {
                                            localStorageApi.removeVocab(itemToRemove.id);
                                        }
                                        setSavedWordIds(prev => {
                                            const newSet = new Set(prev);
                                            newSet.delete(item.id);
                                            return newSet;
                                        });
                                    } else {
                                        localStorageApi.saveVocab(item.id, item, 'saved');
                                        setSavedWordIds(prev => new Set(prev).add(item.id));
                                    }
                                }}
                                onPractice={onPractice}
                                onUseInDocument={onUseInDocument}
                                isLoading={loadingSamples}
                                isSaved={savedWordIds.has(item.id)}
                            />
                        ))}
                        {displayedWordCount < allCategoryWords.length && (
                            <div ref={loaderRef} className="py-4 text-center">
                                <p className="text-text-muted text-sm">Scroll for more words...</p>
                            </div>
                        )}
                    </>
                )}

                {/* Saved tab - Show vocabulary list */}
                {!showTypeSelector && (
                    <>
                        {items.length > 0 ? (
                            items.map((item: any) => (
                                <VocabCard
                                    key={item.id}
                                    item={item}
                                    onSave={(itemId: string) => {
                                        // Remove from saved
                                        const savedVocab = localStorageApi.getUserVocab();
                                        const itemToRemove = savedVocab.find((v: any) => v.vocab_item_id === itemId);
                                        if (itemToRemove) {
                                            localStorageApi.removeVocab(itemToRemove.id);
                                        }

                                        // Update saved IDs
                                        setSavedWordIds(prev => {
                                            const newSet = new Set(prev);
                                            newSet.delete(itemId);
                                            return newSet;
                                        });

                                        // Remove from Redux items (display)
                                        dispatch(addItems({ items: items.filter((i: any) => i.id !== itemId), nextCursor: null }));
                                    }}
                                    onPractice={onPractice}
                                    onUseInDocument={onUseInDocument}
                                    isLoading={loading}
                                    isSaved={true}
                                />
                            ))
                        ) : !loading ? (
                            <div className="mx-auto text-center py-12">
                                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                                    No saved words yet. Search or select a category to add words to your vocabulary.
                                </p>
                            </div>
                        ) : null}
                    </>
                )}

                {/* Loading skeleton */}
                {showTypeSelector && loadingSamples && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-warm-gray border border-warm-gray-dark rounded-card p-6 animate-pulse">
                                <div className="h-6 bg-warm-gray-dark rounded w-1/3 mb-4"></div>
                                <div className="h-4 bg-warm-gray-dark rounded w-full mb-2"></div>
                                <div className="h-4 bg-warm-gray-dark rounded w-5/6"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VocabFeed;
