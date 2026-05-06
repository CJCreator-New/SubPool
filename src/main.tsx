import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';
// Rebuild trigger: sync remote schema and fix auth

import { initSentry } from './lib/sentry';

// Initialize Global Monitoring
initSentry();

const root = document.getElementById('root')!;
const splash = document.getElementById('splash');
if (splash) splash.remove();

createRoot(root).render(<App />);

// ─── PWA: Register Service Worker ─────────────────────────────────────────────
// Only register in production to avoid caching issues during development.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .catch((err) => console.warn('[SW] Registration failed:', err));
    });
}
