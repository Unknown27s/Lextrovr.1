import axios from 'axios';
import pako from 'pako';

// ✅ FREE Dictionary API - https://dictionaryapi.dev/ (no auth required!)
const DICTIONARY_API = 'https://api.dictionaryapi.dev/api/v2/entries/en';

// Lazy-load dictionary - only load when needed
let apiFormatDictionary: any[] | null = null;
let dictionaryIndex: Record<string, number> | null = null;
let classifiedDictionary: Record<string, Record<string, string>> | null = null;

// Load API format dictionary with built-in index
const loadApiFormatDictionary = async (): Promise<{ words: any[], index: Record<string, number> } | null> => {
    if (apiFormatDictionary && dictionaryIndex) {
        return { words: apiFormatDictionary, index: dictionaryIndex };
    }

    try {
        const response = await fetch('/dictionary_indexed.json.gz');
        const buffer = await response.arrayBuffer();
        const decompressed = pako.inflate(new Uint8Array(buffer), { to: 'string' });
        const data = JSON.parse(decompressed);

        apiFormatDictionary = data.words;
        dictionaryIndex = data.index;

        console.log(`✅ Loaded indexed dictionary with ${data.totalWords} words`);
        return { words: apiFormatDictionary!, index: dictionaryIndex! };
    } catch (error) {
        console.error('Failed to load API format dictionary:', error);
        return null;
    }
};

// Fallback to classified dictionary
const loadClassifiedDictionary = async (): Promise<Record<string, Record<string, string>> | null> => {
    if (classifiedDictionary) {
        return classifiedDictionary;
    }

    try {
        const response = await fetch('/dictionary_classified.json.gz');
        const buffer = await response.arrayBuffer();
        const decompressed = pako.inflate(new Uint8Array(buffer), { to: 'string' });
        classifiedDictionary = JSON.parse(decompressed);
        return classifiedDictionary;
    } catch (error) {
        console.warn('Failed to load classified dictionary:', error);
        return null;
    }
};

export const dictionaryClient = axios.create({
    baseURL: DICTIONARY_API,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface VocabItem {
    id: string;
    word: string;
    pos: string;
    difficulty: 'easy' | 'medium' | 'hard';
    definition: string;
    example_corpus: string;
    ai_example: string;
    synonyms: string[];
    tags: string[];
    created_at: string;
}

export interface FeedResponse {
    items: VocabItem[];
    nextCursor: string | null;
}

// ✅ Optimized API layer
export const dictionaryApi = {
    // Fast O(1) word lookup using index
    getWord: async (word: string): Promise<any> => {
        const normalizedWord = word.toLowerCase().trim();

        if (!normalizedWord) {
            throw new Error('Word cannot be empty');
        }

        // 1. Check localStorage cache first (fastest)
        try {
            const cachedData = localStorage.getItem(`dict_cache_${normalizedWord}`);
            if (cachedData) {
                console.log('⚡ Found in cache:', normalizedWord);
                return JSON.parse(cachedData);
            }
        } catch (error) {
            console.warn('Failed to access cache:', error);
        }

        // 2. Check local indexed dictionary (instant, no network)
        try {
            const data = await loadApiFormatDictionary();
            if (data && data.index[normalizedWord] !== undefined) {
                const wordData = data.words[data.index[normalizedWord]];
                console.log('✅ Found in offline dictionary:', normalizedWord);

                // Cache for future use
                try {
                    localStorage.setItem(`dict_cache_${normalizedWord}`, JSON.stringify(wordData));
                } catch (e) {
                    console.warn('Failed to cache:', e);
                }

                return wordData;
            }
        } catch (error) {
            console.warn('Failed to load offline dictionary:', error);
        }

        // 3. Fallback to online API
        try {
            console.log('🌐 Fetching from API:', normalizedWord);
            const response = await dictionaryClient.get(`/${normalizedWord}`);
            if (!response.data || response.data.length === 0) {
                throw new Error('Word not found');
            }

            const apiData = response.data[0];
            try {
                localStorage.setItem(`dict_cache_${normalizedWord}`, JSON.stringify(apiData));
            } catch (e) {
                console.warn('Failed to cache API response:', e);
            }

            return apiData;
        } catch (error) {
            console.error('Dictionary lookup failed:', error);
            throw error;
        }
    },

    // Transform API data to VocabItem
    transformToVocabItem: (data: any, word: string): VocabItem => {
        const meaning = data.meanings?.[0];
        const definition = meaning?.definitions?.[0];
        const source = data.source || data.category || 'offline';

        return {
            id: word.toLowerCase(),
            word: word.toLowerCase(),
            pos: meaning?.partOfSpeech || 'unknown',
            difficulty: 'medium',
            definition: definition?.definition || 'No definition available',
            example_corpus: definition?.example || '',
            ai_example: `"${word}" is widely used in professional contexts.`,
            synonyms: meaning?.synonyms || [],
            tags: source ? [source] : ['offline'],
            created_at: new Date().toISOString(),
        };
    },

    // Get dictionary source for a word
    getWordSource: async (word: string): Promise<'offline' | 'cache' | 'online' | 'unknown'> => {
        const normalizedWord = word.toLowerCase().trim();

        try {
            if (localStorage.getItem(`dict_cache_${normalizedWord}`)) {
                return 'cache';
            }
        } catch (error) {
            console.warn('Failed to check cache:', error);
        }

        try {
            const data = await loadApiFormatDictionary();
            if (data && data.index[normalizedWord] !== undefined) {
                return 'offline';
            }
        } catch (error) {
            console.warn('Failed to check offline dictionary:', error);
        }

        return 'unknown';
    },

    // Get words by category
    getWordsByCategory: async (category: string): Promise<string[]> => {
        const VALID_CATEGORIES = ['emotion', 'expression', 'movement', 'action', 'place', 'quality', 'other'] as const;
        const normalizedCategory = category.toLowerCase();

        if (!VALID_CATEGORIES.includes(normalizedCategory as any)) {
            console.warn(`Invalid category: ${category}`);
            return [];
        }

        try {
            const classified = await loadClassifiedDictionary();
            if (classified && classified[normalizedCategory as any]) {
                return Object.keys(classified[normalizedCategory as any]);
            }
        } catch (error) {
            console.error(`Failed to get words for category ${category}:`, error);
        }

        return [];
    },

    // Search within a specific category
    searchInCategory: async (searchTerm: string, category: string): Promise<any[]> => {
        const VALID_CATEGORIES = ['emotion', 'expression', 'movement', 'action', 'place', 'quality', 'other'] as const;
        const normalizedCategory = category.toLowerCase();
        const normalizedTerm = searchTerm.toLowerCase().trim();

        if (!normalizedTerm) {
            console.warn('Search term is empty');
            return [];
        }

        if (!VALID_CATEGORIES.includes(normalizedCategory as any)) {
            console.warn(`Invalid category: ${category}`);
            return [];
        }

        try {
            const classified = await loadClassifiedDictionary();
            if (!classified || !classified[normalizedCategory as any]) {
                return [];
            }

            const categoryWords = classified[normalizedCategory as any];
            const matches = Object.keys(categoryWords).filter(word =>
                word.includes(normalizedTerm)
            );

            return matches.slice(0, 10).map(word => ({
                word,
                definition: categoryWords[word]
            }));
        } catch (error) {
            console.error(`Failed to search in category ${category}:`, error);
        }

        return [];
    },

    // Get category for a word
    getWordCategory: async (word: string): Promise<string | null> => {
        const VALID_CATEGORIES = ['emotion', 'expression', 'movement', 'action', 'place', 'quality', 'other'] as const;
        const normalizedWord = word.toLowerCase().trim();

        if (!normalizedWord) {
            console.warn('Word is empty');
            return null;
        }

        try {
            const classified = await loadClassifiedDictionary();
            if (!classified) return null;

            for (const category of VALID_CATEGORIES) {
                if (classified[category as any] && classified[category as any][normalizedWord]) {
                    return category;
                }
            }
        } catch (error) {
            console.error(`Failed to get category for word "${word}":`, error);
        }

        return null;
    },

    // Clear dictionary cache
    clearCache: (): void => {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('dict_cache_')) {
                localStorage.removeItem(key);
            }
        });
        console.log('✅ Dictionary cache cleared');
    },
};

// ✅ LOCAL STORAGE API
export const localStorageApi = {
    // Get user's saved vocabulary
    getUserVocab: (): any[] => {
        const data = localStorage.getItem('userVocab');
        return data ? JSON.parse(data) : [];
    },

    // Save a word
    saveVocab: (vocabItemId: string, vocabItem: VocabItem, status = 'saved'): any => {
        const userVocab = localStorageApi.getUserVocab();
        const exists = userVocab.find((uv: any) => uv.vocab_item_id === vocabItemId);

        if (exists) {
            exists.status = status;
        } else {
            userVocab.push({
                id: `${vocabItemId}-${Date.now()}`,
                vocab_item_id: vocabItemId,
                vocab_item: vocabItem,
                status,
                practice_score: 0,
                added_at: new Date().toISOString(),
            });
        }

        localStorage.setItem('userVocab', JSON.stringify(userVocab));
        return userVocab.find((uv: any) => uv.vocab_item_id === vocabItemId);
    },

    // Remove saved word
    removeVocab: (userVocabId: string): void => {
        let userVocab = localStorageApi.getUserVocab();
        userVocab = userVocab.filter((uv: any) => uv.id !== userVocabId);
        localStorage.setItem('userVocab', JSON.stringify(userVocab));
    },

    // Update practice score
    updatePracticeScore: (userVocabId: string, isCorrect: boolean): void => {
        const userVocab = localStorageApi.getUserVocab();
        const item = userVocab.find((uv: any) => uv.id === userVocabId);
        if (item) {
            item.practice_score = item.practice_score * 0.8 + (isCorrect ? 1 : 0) * 0.2;
            localStorage.setItem('userVocab', JSON.stringify(userVocab));
        }
    },

    // Get practice stats
    getPracticeStats: (vocabItemId: string): any => {
        const results = localStorage.getItem(`practice_${vocabItemId}`);
        const attempts = results ? JSON.parse(results) : [];
        const correctCount = attempts.filter((a: any) => a.correct).length;

        return {
            totalAttempts: attempts.length,
            correctAttempts: correctCount,
            successRate: attempts.length > 0 ? (correctCount / attempts.length) * 100 : 0,
        };
    },

    // Add practice attempt
    addPracticeAttempt: (vocabItemId: string, correct: boolean): void => {
        const key = `practice_${vocabItemId}`;
        const results = localStorage.getItem(key);
        const attempts = results ? JSON.parse(results) : [];
        attempts.push({ correct, timestamp: new Date().toISOString() });
        localStorage.setItem(key, JSON.stringify(attempts.slice(-100))); // Keep last 100
    },
};
