import { configureStore } from '@reduxjs/toolkit';
import feedReducer from './feedSlice';
import userVocabReducer from './userVocabSlice';

export const store = configureStore({
    reducer: {
        feed: feedReducer,
        userVocab: userVocabReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
