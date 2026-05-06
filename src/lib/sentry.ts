import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router";

/**
 * Initialises Sentry for the SubPool application.
 * In development, it uses a mock DSN or captures events to the console.
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn && import.meta.env.PROD) {
    console.warn("Sentry DSN missing in production environment.");
    return;
  }

  Sentry.init({
    dsn: dsn || "https://dummy-dsn@sentry.io/0", // Fallback for dev
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration(),
    ],
    
    // Performance Monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD || !!dsn,
    
    beforeSend(event) {
        // Scrub sensitive data before sending to Sentry
        if (event.user) {
            delete event.user.email;
            delete event.user.ip_address;
        }
        return event;
    },
  });
}

/**
 * Custom Error Boundary Wrapper
 */
export const withSentry = Sentry.withErrorBoundary;

/**
 * Capture custom exceptions
 */
export const captureException = Sentry.captureException;
export const captureMessage = Sentry.captureMessage;
