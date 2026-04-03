import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';

// Initialise Sentry only when a DSN is provided (i.e. production) via dynamic import.
const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
if (sentryDsn) {
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      integrations: [Sentry.browserTracingIntegration()],
    });
  }).catch(err => console.warn('[Sentry] Payload loading failed:', err));
}

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
