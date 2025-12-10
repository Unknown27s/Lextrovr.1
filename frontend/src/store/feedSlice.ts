import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

export interface FeedState {
    items: VocabItem[];
    loading: boolean;
}

const initialState: FeedState = {
    items: [],
    loading: false,
};

export const feedSlice = createSlice({
    name: 'feed',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        addItems: (state, action: PayloadAction<{ items: VocabItem[]; nextCursor: string | null }>) => {
            state.items = action.payload.items;
        },
        resetFeed: (state) => {
            state.items = [];
        },
        prependDaily: (state, action: PayloadAction<VocabItem>) => {
            // Add daily word at top
            const exists = state.items.some((item) => item.id === action.payload.id);
            if (!exists) {
                state.items.unshift(action.payload);
            }
        },
    },
});

export const { setLoading, addItems, resetFeed, prependDaily } = feedSlice.actions;
export default feedSlice.reducer;
