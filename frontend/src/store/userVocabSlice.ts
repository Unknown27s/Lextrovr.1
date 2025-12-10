import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserVocabItem {
    id: string;
    vocab_item_id: string;
    status: 'saved' | 'learning' | 'mastered';
    practice_score: number;
    added_at: string;
}

export interface UserVocabState {
    items: UserVocabItem[];
    loading: boolean;
}

const initialState: UserVocabState = {
    items: [],
    loading: false,
};

export const userVocabSlice = createSlice({
    name: 'userVocab',
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setItems: (state, action: PayloadAction<UserVocabItem[]>) => {
            state.items = action.payload;
        },
        addItem: (state, action: PayloadAction<UserVocabItem>) => {
            const exists = state.items.find((item) => item.vocab_item_id === action.payload.vocab_item_id);
            if (!exists) {
                state.items.push(action.payload);
            }
        },
        updateItem: (state, action: PayloadAction<UserVocabItem>) => {
            const index = state.items.findIndex((item) => item.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        removeItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
    },
});

export const {
    setLoading,
    setItems,
    addItem,
    updateItem,
    removeItem,
} = userVocabSlice.actions;

export default userVocabSlice.reducer;
