import React, { useState, useEffect, useCallback } from 'react';
import { dictionaryApi, localStorageApi } from '../api/client';

interface WordSuggestionsProps {
    onWordSelect?: (word: string) => void;
}

interface CategoryWords {
    [key: string]: string[];
}

// Comprehensive vocabulary organized by category
const WORD_CATEGORIES: CategoryWords = {
    'expression': [
        'grin', 'smirk', 'scowl', 'glare', 'blush', 'frown', 'sigh', 'grimace', 'sneer', 'beam',
        'pout', 'squint', 'wince', 'leer', 'sniff', 'whisper', 'murmur', 'stammer', 'eloquent', 'articulate'
    ],
    'emotion': [
        'elated', 'despondent', 'euphoric', 'melancholy', 'jubilant', 'sorrowful', 'ecstatic', 'dejected',
        'anxious', 'serene', 'furious', 'placid', 'nostalgic', 'wistful', 'exuberant', 'forlorn',
        'blissful', 'anguished', 'content', 'restless'
    ],
    'place description': [
        'misty', 'ancient', 'bustling', 'dimly-lit', 'serene', 'abandoned', 'quaint', 'sprawling',
        'desolate', 'vibrant', 'cramped', 'cavernous', 'ornate', 'austere', 'labyrinthine', 'verdant',
        'barren', 'teeming', 'tranquil', 'turbulent'
    ],
    'movement': [
        'stride', 'saunter', 'lurk', 'glide', 'trudge', 'sprint', 'creep', 'scurry', 'shuffle', 'dash',
        'meander', 'sway', 'prance', 'crawl', 'stumble', 'lurch', 'slither', 'bound', 'amble', 'bolt'
    ],
    'action verbs': [
        'fabricate', 'decipher', 'unravel', 'constrain', 'embark', 'traverse', 'capture', 'summon',
        'vanquish', 'kindle', 'diminish', 'augment', 'obliterate', 'forge', 'plunder', 'nurture',
        'deceive', 'banish', 'embrace', 'pierce'
    ],
    'narrative tone': [
        'ominous', 'whimsical', 'somber', 'comedic', 'dramatic', 'sardonic', 'hopeful', 'despairing',
        'ethereal', 'gritty', 'poetic', 'matter-of-fact', 'ironic', 'sincere', 'cynical', 'optimistic',
        'melancholic', 'vivacious', 'austere', 'lush'
    ],
    'mood': [
        'foreboding', 'enchanting', 'haunting', 'uplifting', 'eerie', 'cozy', 'oppressive', 'liberating',
        'intimate', 'imposing', 'playful', 'grim', 'magical', 'desolate', 'triumphant', 'bittersweet',
        'exhilarating', 'suffocating', 'luminous', 'murky'
    ],
    'weather': [
        'tempestuous', 'balmy', 'blustery', 'sultry', 'frigid', 'torrential', 'drizzle', 'sweltering',
        'crisp', 'humid', 'damp', 'arid', 'violent', 'gentle', 'harsh', 'soothing', 'fierce', 'mild',
        'scorching', 'bitter'
    ],
    'danger': [
        'perilous', 'treacherous', 'ominous', 'sinister', 'menacing', 'sinister', 'precarious',
        'hazardous', 'lethal', 'menace', 'lurking', 'predatory', 'vicious', 'cutthroat', 'ruthless',
        'savage', 'brutal', 'malicious', 'nefarious', 'treachery'
    ],
    'calm': [
        'placid', 'serene', 'tranquil', 'peaceful', 'still', 'quiet', 'hushed', 'restful', 'soothing',
        'meditative', 'zen', 'composed', 'poised', 'unruffled', 'imperturbable', 'equanimous', 'patient',
        'mild', 'gentle', 'benevolent'
    ]
};

interface WordDetail {
    word: string;
    category: string;
    partOfSpeech?: string;
    definition?: string;
    synonyms?: string[];
    antonyms?: string[];
    example?: string;
    isSaved?: boolean;
}

export default function WordSuggestions({ onWordSelect }: WordSuggestionsProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredWords, setFilteredWords] = useState<WordDetail[]>([]);
    const [selectedWord, setSelectedWord] = useState<WordDetail | null>(null);
    const [wordDetails, setWordDetails] = useState<{ [key: string]: any }>({});
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [savedWords, setSavedWords] = useState<string[]>([]);

    useEffect(() => {
        loadSavedWords();
        initializeFilteredWords();
    }, [loadSavedWords, initializeFilteredWords]);

    useEffect(() => {
        filterWords(searchTerm);
    }, [searchTerm, savedWords, filterWords]);

    const loadSavedWords = useCallback(() => {
        const saved = localStorageApi.getUserVocab();
        const wordList = saved.map((sv: any) => sv.vocab_item.word.toLowerCase());
        setSavedWords(wordList);
    }, []);

    const initializeFilteredWords = useCallback(() => {
        // Show a mix of words from all categories initially
        const allWords: WordDetail[] = [];
        Object.entries(WORD_CATEGORIES).forEach(([category, words]) => {
            words.forEach(word => {
                allWords.push({
                    word,
                    category,
                    isSaved: savedWords.includes(word.toLowerCase())
                });
            });
        });

        // Shuffle and show first 15
        const shuffled = allWords.sort(() => 0.5 - Math.random());
        setFilteredWords(shuffled.slice(0, 15));
    }, [savedWords]);

    const filterWords = useCallback((term: string) => {
        if (!term.trim()) {
            initializeFilteredWords();
            return;
        }

        const searchLower = term.toLowerCase();
        const results: WordDetail[] = [];

        // Search by category
        if (WORD_CATEGORIES[searchLower]) {
            WORD_CATEGORIES[searchLower].forEach(word => {
                results.push({
                    word,
                    category: searchLower,
                    isSaved: savedWords.includes(word.toLowerCase())
                });
            });
        } else {
            // Search by keyword in category names
            Object.entries(WORD_CATEGORIES).forEach(([category, words]) => {
                if (category.includes(searchLower)) {
                    words.forEach(word => {
                        results.push({
                            word,
                            category,
                            isSaved: savedWords.includes(word.toLowerCase())
                        });
                    });
                }
            });

            // If no category match, search word names
            if (results.length === 0) {
                Object.entries(WORD_CATEGORIES).forEach(([category, words]) => {
                    words.forEach(word => {
                        if (word.includes(searchLower)) {
                            results.push({
                                word,
                                category,
                                isSaved: savedWords.includes(word.toLowerCase())
                            });
                        }
                    });
                });
            }
        }

        setFilteredWords(results.length > 0 ? results : []);
    }, [savedWords, initializeFilteredWords]);

    const loadWordDetails = async (word: WordDetail) => {
        if (wordDetails[word.word]) {
            setSelectedWord({
                ...word,
                ...wordDetails[word.word],
                isSaved: savedWords.includes(word.word.toLowerCase())
            });
            return;
        }

        setDetailsLoading(true);
        try {
            const data = await dictionaryApi.getWord(word.word.toLowerCase());

            if (data && data.meanings && data.meanings.length > 0) {
                const meaning = data.meanings[0];
                const details = {
                    partOfSpeech: meaning.partOfSpeech,
                    definition: meaning.definitions?.[0]?.definition || 'No definition available',
                    example: meaning.definitions?.[0]?.example,
                    synonyms: meaning.synonyms?.slice(0, 5) || [],
                    antonyms: meaning.antonyms?.slice(0, 5) || []
                };

                setWordDetails(prev => ({
                    ...prev,
                    [word.word]: details
                }));

                setSelectedWord({
                    ...word,
                    ...details,
                    isSaved: savedWords.includes(word.word.toLowerCase())
                });
            }
        } catch (error) {
            console.error('Failed to load word details:', error);
            setSelectedWord({
                ...word,
                definition: 'Definition not available',
                isSaved: savedWords.includes(word.word.toLowerCase())
            });
        } finally {
            setDetailsLoading(false);
        }
    };

    const handleAddWord = async (word: WordDetail) => {
        try {
            const data = await dictionaryApi.getWord(word.word.toLowerCase());
            const vocabItem = dictionaryApi.transformToVocabItem(data, word.word);
            localStorageApi.saveVocab(vocabItem.id, vocabItem, 'saved');

            setSavedWords(prev => [...prev, word.word.toLowerCase()]);

            setFilteredWords(prev =>
                prev.map(w =>
                    w.word === word.word
                        ? { ...w, isSaved: true }
                        : w
                )
            );

            if (selectedWord?.word === word.word) {
                setSelectedWord(prev => prev ? { ...prev, isSaved: true } : null);
            }

            if (onWordSelect) {
                onWordSelect(word.word);
            }
        } catch (error) {
            console.error('Failed to add word:', error);
        }
    };

    return (
        <div className="w-full px-4 pb-8">
            {/* Search Bar */}
            <div className="mb-6 sticky top-0 z-40">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search categories (e.g., expression, emotion, movement, weather)..."
                    className="w-full px-4 py-3 bg-warm-white border border-warm-gray rounded-lg focus:outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal transition-all font-serif text-text-primary placeholder-text-muted"
                />
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Words List */}
                <div className="lg:col-span-2">
                    {filteredWords.length > 0 ? (
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {filteredWords.map((word) => (
                                <button
                                    key={word.word}
                                    onClick={() => loadWordDetails(word)}
                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedWord?.word === word.word
                                        ? 'border-accent-teal bg-accent-teal/5'
                                        : 'border-warm-gray hover:border-accent-teal/50 bg-white'
                                        } ${word.isSaved ? 'bg-warm-cream/50' : ''}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-serif text-base font-semibold text-text-primary">
                                                    {word.word}
                                                </h3>
                                                <span className="text-xs font-medium text-accent-teal bg-accent-teal/10 rounded px-2 py-1">
                                                    {word.category}
                                                </span>
                                            </div>
                                            {word.definition && (
                                                <p className="text-sm text-text-secondary line-clamp-1">
                                                    {word.definition}
                                                </p>
                                            )}
                                        </div>
                                        {word.isSaved && (
                                            <span className="text-accent-teal text-lg">✓</span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-white rounded-lg border border-warm-gray">
                            <p className="text-text-secondary">No words found for "{searchTerm}"</p>
                            <p className="text-xs text-text-muted mt-2">Try searching: expression, emotion, movement, etc.</p>
                        </div>
                    )}
                </div>

                {/* Details Panel */}
                <div className="lg:col-span-1">
                    {selectedWord ? (
                        <div className="bg-white rounded-lg border border-warm-gray p-5 sticky top-20 max-h-96 overflow-y-auto">
                            {detailsLoading ? (
                                <div className="space-y-3">
                                    <div className="h-6 bg-warm-gray rounded w-1/2 animate-pulse"></div>
                                    <div className="h-4 bg-warm-gray rounded w-full animate-pulse"></div>
                                    <div className="h-4 bg-warm-gray rounded w-5/6 animate-pulse"></div>
                                </div>
                            ) : (
                                <>
                                    <h2 className="font-serif text-2xl font-semibold text-text-primary mb-2">
                                        {selectedWord.word}
                                    </h2>

                                    {selectedWord.partOfSpeech && (
                                        <p className="text-sm text-accent-teal font-medium mb-3">
                                            {selectedWord.partOfSpeech}
                                        </p>
                                    )}

                                    <div className="space-y-4">
                                        {selectedWord.definition && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-text-primary mb-1">Definition</h3>
                                                <p className="text-sm text-text-secondary leading-relaxed">
                                                    {selectedWord.definition}
                                                </p>
                                            </div>
                                        )}

                                        {selectedWord.example && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-text-primary mb-1">Example</h3>
                                                <p className="text-sm text-text-secondary italic leading-relaxed">
                                                    "{selectedWord.example}"
                                                </p>
                                            </div>
                                        )}

                                        {selectedWord.synonyms && selectedWord.synonyms.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-text-primary mb-2">Synonyms</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedWord.synonyms.map((syn) => (
                                                        <span
                                                            key={syn}
                                                            className="text-xs bg-warm-cream text-text-primary rounded-full px-3 py-1"
                                                        >
                                                            {syn}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {selectedWord.antonyms && selectedWord.antonyms.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-semibold text-text-primary mb-2">Antonyms</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedWord.antonyms.map((ant) => (
                                                        <span
                                                            key={ant}
                                                            className="text-xs bg-red-100 text-red-700 rounded-full px-3 py-1"
                                                        >
                                                            {ant}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleAddWord(selectedWord)}
                                            disabled={selectedWord.isSaved}
                                            className={`w-full py-2 rounded-lg font-medium text-sm transition-all mt-4 ${selectedWord.isSaved
                                                ? 'bg-warm-gray text-text-muted cursor-default'
                                                : 'bg-accent-teal text-white hover:bg-accent-teal-dark'
                                                }`}
                                        >
                                            {selectedWord.isSaved ? '✓ Added to Vocabulary' : '+ Add to Vocabulary'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="bg-warm-cream rounded-lg p-5 text-center text-text-secondary text-sm">
                            <p>Select a word to see details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}