// src/lib/stripe.ts
// Thin helper for Stripe.js — lazy-loaded to avoid blocking initial render.
// Uses Stripe-hosted Checkout (redirect flow) so raw card data NEVER touches SubPool.

import { loadStripe, Stripe } from '@stripe/stripe-js';

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

let stripePromise: Promise<Stripe | null> | null = null;

/** Returns the Stripe.js instance, lazy-loading the SDK on first call. */
export function getStripe(): Promise<Stripe | null> {
    if (!PUBLISHABLE_KEY) {
        console.warn('[SubPool] VITE_STRIPE_PUBLISHABLE_KEY is not set — Stripe payments disabled.');
        return Promise.resolve(null);
    }
    if (!stripePromise) {
        stripePromise = loadStripe(PUBLISHABLE_KEY);
    }
    return stripePromise;
}

/** Returns true if Stripe is configured and can accept payments. */
export const isStripeEnabled = Boolean(PUBLISHABLE_KEY);

/**
 * Redirect to a Stripe-hosted Checkout session.
 * The `url` is returned by the `create-checkout-session` Edge Function.
 */
export function redirectToCheckout(url: string): void {
    window.location.href = url;
}
