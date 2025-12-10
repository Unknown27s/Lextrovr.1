import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import styles
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);

// Register service worker for PWA offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                console.log('✅ Service Worker registered:', registration);
            })
            .catch((error) => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}
