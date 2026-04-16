import { createRoot } from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './app/App.tsx';
import './styles/index.css';

// Initialise Sentry only when a DSN is provided (i.e. production).
// In dev / CI / demo mode the DSN is empty and this is a no-op.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    // Capture 10% of sessions for performance traces
    tracesSampleRate: 0.1,
    // Capture 100% of errors
    integrations: [Sentry.browserTracingIntegration()],
  });
}

createRoot(document.getElementById('root')!).render(<App />);

// ─── PWA: Register Service Worker ─────────────────────────────────────────────
// Only register in production to avoid caching issues during development.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js', { scope: '/' })
            .catch((err) => console.warn('[SW] Registration failed:', err));
    });
}
