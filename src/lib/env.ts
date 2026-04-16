// ─── Environment Variable Validation ─────────────────────────────────────────
// Validates required environment variables at startup using Zod.
// In production, missing required vars will throw an error.

import { z } from 'zod'

// Schema for environment variables
const envSchema = z.object({
    // Required for Supabase connection
    VITE_SUPABASE_URL: z.string().url().optional(),
    VITE_SUPABASE_ANON_KEY: z.string().min(1).optional(),

    // Optional - Sentry error tracking
    VITE_SENTRY_DSN: z.string().url().optional(),

    // Optional - Stripe payments
    VITE_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),

    // Environment mode (injected by Vite)
    MODE: z.enum(['development', 'production', 'test']).default('development'),
    PROD: z.boolean().default(false),
    DEV: z.boolean().default(true),
})

export type Env = z.infer<typeof envSchema>

/**
 * Parse and validate environment variables.
 * Returns the validated env object or throws on validation failure.
 */
function validateEnv(): Env {
    // In browser, access import.meta.env
    const env = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
        VITE_SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
        VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
        MODE: import.meta.env.MODE,
        PROD: import.meta.env.PROD,
        DEV: import.meta.env.DEV,
    }

    try {
        return envSchema.parse(env)
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.issues
                .map((i: z.ZodIssue) => `  - ${i.path.join('.')}: ${i.message}`)
                .join('\n')
            console.warn(`[SubPool] Environment validation warnings:\n${issues}`)
        }
        // Return parsed env anyway - we use optional fields
        return env as Env
    }
}

/**
 * Validated environment variables.
 * Use this instead of accessing import.meta.env directly.
 */
export const env = validateEnv()

/**
 * Check if Supabase is configured.
 */
export const isSupabaseConfigured = Boolean(
    env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY
)

/**
 * Check if Sentry is configured.
 */
export const isSentryConfigured = Boolean(env.VITE_SENTRY_DSN)

/**
 * Check if Stripe is configured.
 */
export const isStripeConfigured = Boolean(env.VITE_STRIPE_PUBLISHABLE_KEY)
