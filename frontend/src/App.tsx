import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import VocabFeed from './components/VocabFeed';
import WordSuggestions from './components/WordSuggestions';
import SettingsModal from './components/SettingsModal';
import PracticeModal from './components/PracticeModal';
import UseInDocumentOverlay from './components/UseInDocumentOverlay';
import WordSearch from './components/WordSearch';
import WritingPractice from './components/WritingPractice';
import Login from './components/Login';
import PracticeMode from './components/PracticeMode';
import { authService } from './services/authService';
import { spacedRepetitionService, ReviewSession } from './services/spacedRepetitionService';
import './styles/index.css';

function AppContent() {
    const [isPracticeOpen, setIsPracticeOpen] = useState(false);
    const [isUseInDocOpen, setIsUseInDocOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedVocabId, setSelectedVocabId] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [activeTab, setActiveTab] = useState('home');
    const [showSearch, setShowSearch] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());
    const [activePracticeMode, setActivePracticeMode] = useState<'quick' | 'standard' | 'focused' | null>(null);
    const [stats, setStats] = useState(spacedRepetitionService.getStatistics());

    useEffect(() => {
        // Initialize PWA service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .then(() => console.log('✅ Service Worker registered'))
                .catch((err) => console.log('Service Worker registration failed:', err));
        }
    }, []);

    const handlePracticeClick = (vocabId: string) => {
        setSelectedVocabId(vocabId);
        setIsPracticeOpen(true);
    };

    const handleUseInDocumentClick = (vocabId: string) => {
        setSelectedVocabId(vocabId);
        setIsUseInDocOpen(true);
    };

    const handleWordAdded = () => {
        setRefreshKey(prev => prev + 1);
        setShowSearch(false);
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        authService.logout();
        setIsAuthenticated(false);
    };

    const handlePracticeComplete = (session: ReviewSession) => {
        console.log('Practice session complete:', session);
        setStats(spacedRepetitionService.getStatistics());
        setActivePracticeMode(null);
    };

    // Show login if not authenticated
    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <div className="min-h-screen bg-warm-white pb-20">
            <Header
                onSearchClick={() => setShowSearch(!showSearch)}
                onSettingsClick={() => setIsSettingsOpen(true)}
            />

            <main className="pb-4">
                {showSearch && (
                    <div className="pt-4 animate-fade-up">
                        <WordSearch
                            onWordAdded={handleWordAdded}
                            onClose={() => setShowSearch(false)}
                            onPractice={handlePracticeClick}
                            onUseInDocument={handleUseInDocumentClick}
                        />
                    </div>
                )}

                {activeTab === 'home' && (
                    <div className="pt-0">
                        <VocabFeed
                            key={refreshKey}
                            onPractice={handlePracticeClick}
                            onUseInDocument={handleUseInDocumentClick}
                            showTypeSelector={true}
                        />
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="pt-4">
                        <VocabFeed
                            key={refreshKey}
                            onPractice={handlePracticeClick}
                            onUseInDocument={handleUseInDocumentClick}
                        />
                    </div>
                )}

                {activeTab === 'editor' && (
                    <div className="pt-4">
                        <WritingPractice />
                    </div>
                )}

                {activeTab === 'practice' && (
                    <div className="pt-4">
                        <div className="mx-4 space-y-4">
                            {/* Stats Card */}
                            <div className="bg-gradient-to-br from-accent-teal/10 to-accent-teal/5 rounded-lg p-6 border border-accent-teal/20">
                                <h3 className="font-crimson text-xl text-warm-charcoal mb-4">Today's Stats</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-warm-taupe font-inter uppercase">Due Today</p>
                                        <p className="font-crimson text-3xl text-accent-teal font-semibold">{stats.dueToday}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-warm-taupe font-inter uppercase">Accuracy</p>
                                        <p className="font-crimson text-3xl text-accent-teal font-semibold">{stats.accuracy}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Practice Modes */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => setActivePracticeMode('quick')}
                                    className="w-full bg-white border-2 border-warm-border rounded-lg p-4 text-left hover:border-accent-teal hover:bg-accent-teal/5 transition-all"
                                >
                                    <h4 className="font-crimson text-lg text-warm-charcoal mb-1">⚡ Quick Practice</h4>
                                    <p className="text-sm text-warm-taupe font-inter">5 words • 2-3 minutes</p>
                                </button>

                                <button
                                    onClick={() => setActivePracticeMode('standard')}
                                    className="w-full bg-white border-2 border-warm-border rounded-lg p-4 text-left hover:border-accent-teal hover:bg-accent-teal/5 transition-all"
                                >
                                    <h4 className="font-crimson text-lg text-warm-charcoal mb-1">📚 Standard Practice</h4>
                                    <p className="text-sm text-warm-taupe font-inter">10 words • 10-15 minutes</p>
                                </button>

                                <button
                                    onClick={() => setActivePracticeMode('focused')}
                                    className="w-full bg-white border-2 border-warm-border rounded-lg p-4 text-left hover:border-accent-teal hover:bg-accent-teal/5 transition-all"
                                >
                                    <h4 className="font-crimson text-lg text-warm-charcoal mb-1">🎯 Focused (Hard Words)</h4>
                                    <p className="text-sm text-warm-taupe font-inter">5 difficult words • 8-10 minutes</p>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="pt-4">
                        <div className="mx-4 space-y-4">
                            <div className="bg-white rounded-lg p-6 border border-warm-border">
                                <h3 className="font-crimson text-2xl text-warm-charcoal mb-4">Profile</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-warm-taupe font-inter uppercase">Name</p>
                                        <p className="font-inter text-warm-charcoal">{authService.getCurrentUser()?.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="mt-6 w-full py-3 bg-red-50 text-red-700 rounded-lg font-inter font-medium hover:bg-red-100 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Modals */}
            <PracticeModal
                isOpen={isPracticeOpen}
                vocabId={selectedVocabId}
                onClose={() => setIsPracticeOpen(false)}
                onSubmit={(result) => console.log('Practice result:', result)}
            />

            <UseInDocumentOverlay
                isOpen={isUseInDocOpen}
                onClose={() => setIsUseInDocOpen(false)}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />

            {activePracticeMode && (
                <PracticeMode
                    mode={activePracticeMode}
                    onComplete={handlePracticeComplete}
                    onClose={() => setActivePracticeMode(null)}
                />
            )}

            {/* Floating Add Button */}
            <button
                onClick={() => setShowSearch(!showSearch)}
                className="fixed bottom-20 right-4 w-14 h-14 bg-accent-teal hover:bg-accent-teal-dark text-white rounded-full shadow-card-elevated transition-all duration-200 flex items-center justify-center z-40"
                aria-label="Add custom word"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>
    );
}

function App() {
    return (
        <Provider store={store}>
            <AppContent />
        </Provider>
    );
}

export default App;
