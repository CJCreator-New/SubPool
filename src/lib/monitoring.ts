// src/lib/monitoring.ts
// Centralised error & analytics logging.
// In production (with VITE_SENTRY_DSN set) all errors are forwarded to Sentry.
// In development / demo mode, errors are logged to the console only.

import * as Sentry from '@sentry/react';

const IS_PROD = import.meta.env.PROD;
const HAS_SENTRY = Boolean(import.meta.env.VITE_SENTRY_DSN);

/** Log an error with optional context tags. Always safe to call. */
export function logError(
    err: unknown,
    context?: Record<string, string | number | boolean>,
): void {
    const error = err instanceof Error ? err : new Error(String(err));
    if (IS_PROD && HAS_SENTRY) {
        Sentry.withScope((scope) => {
            if (context) {
                Object.entries(context).forEach(([k, v]) => scope.setTag(k, String(v)));
            }
            Sentry.captureException(error);
        });
    } else {
        console.error('[SubPool]', error, context ?? '');
    }
}

/** Track an analytics event. Currently forwards to Sentry as a breadcrumb. */
export function logEvent(
    name: string,
    data?: Record<string, string | number | boolean>,
): void {
    if (IS_PROD && HAS_SENTRY) {
        Sentry.addBreadcrumb({ message: name, data, level: 'info' });
    } else {
        console.info(`[event] ${name}`, data ?? '');
    }
}
