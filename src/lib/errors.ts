// ─── SubPool Error Hierarchy ─────────────────────────────────────────────────
// Structured error types for consistent error handling across the app.
// Extends the existing getUserFacingError() helper in error-feedback.ts.

// ─── Base Error ──────────────────────────────────────────────────────────────

export class SubPoolError extends Error {
    public readonly code: string;
    public readonly isRetryable: boolean;
    public readonly httpStatus?: number;

    constructor(message: string, code: string, { isRetryable = false, httpStatus }: { isRetryable?: boolean; httpStatus?: number } = {}) {
        super(message);
        this.name = 'SubPoolError';
        this.code = code;
        this.isRetryable = isRetryable;
        this.httpStatus = httpStatus;
    }
}

// ─── Sub-types ───────────────────────────────────────────────────────────────

/** Triggered when a user hits API rate limits. */
export class RateLimitError extends SubPoolError {
    public readonly retryAfterSec: number;

    constructor(retryAfterSec = 60) {
        super(
            `You are doing that too quickly. Please wait ${retryAfterSec}s and try again.`,
            'RATE_LIMIT',
            { isRetryable: true }
        );
        this.name = 'RateLimitError';
        this.retryAfterSec = retryAfterSec;
    }
}

/** Auth/session errors — user needs to re-login. */
export class AuthError extends SubPoolError {
    constructor(message = 'Your session expired. Please sign in again.') {
        super(message, 'AUTH_REQUIRED', { isRetryable: false, httpStatus: 401 });
        this.name = 'AuthError';
    }
}

/** Row-Level Security / permission errors. */
export class PermissionError extends SubPoolError {
    constructor(action = 'perform this action') {
        super(`You do not have permission to ${action}.`, 'PERMISSION_DENIED', { isRetryable: false, httpStatus: 403 });
        this.name = 'PermissionError';
    }
}

/** Network/connectivity errors. */
export class NetworkError extends SubPoolError {
    constructor(message = 'Network issue. Check your connection and retry.') {
        super(message, 'NETWORK_ERROR', { isRetryable: true });
        this.name = 'NetworkError';
    }
}

/** Business logic validation failures (e.g. pool full). */
export class ValidationError extends SubPoolError {
    public readonly field?: string;

    constructor(message: string, field?: string) {
        super(message, 'VALIDATION', { isRetryable: false });
        this.name = 'ValidationError';
        this.field = field;
    }
}

/** No data found for a given query. */
export class NotFoundError extends SubPoolError {
    constructor(entity = 'resource') {
        super(`${entity} not found.`, 'NOT_FOUND', { isRetryable: false, httpStatus: 404 });
        this.name = 'NotFoundError';
    }
}

// ─── Classifier ─────────────────────────────────────────────────────────────

/**
 * Converts an unknown thrown value into a typed SubPoolError.
 * Use this in catch blocks across the codebase.
 */
export function classifyError(error: unknown): SubPoolError {
    if (error instanceof SubPoolError) return error;

    const message = error instanceof Error ? error.message : String(error ?? 'Unknown error');
    const lowered = message.toLowerCase();

    if (lowered.includes('rate limit') || lowered.includes('too many requests')) {
        const match = message.match(/(\d+)\s*seconds?/i);
        return new RateLimitError(match ? Number(match[1]) : 60);
    }
    if (lowered.includes('jwt') || lowered.includes('session') || lowered.includes('not signed in')) {
        return new AuthError();
    }
    if (lowered.includes('permission denied') || lowered.includes('row-level security')) {
        return new PermissionError();
    }
    if (lowered.includes('network') || lowered.includes('failed to fetch') || lowered.includes('timeout')) {
        return new NetworkError(message);
    }
    if (lowered.includes('not found') || lowered.includes('no rows')) {
        return new NotFoundError();
    }

    return new SubPoolError(message, 'UNKNOWN', { isRetryable: false });
}

// ─── Type guards ─────────────────────────────────────────────────────────────

export const isRateLimitError    = (e: unknown): e is RateLimitError   => e instanceof RateLimitError;
export const isAuthError         = (e: unknown): e is AuthError         => e instanceof AuthError;
export const isPermissionError   = (e: unknown): e is PermissionError   => e instanceof PermissionError;
export const isNetworkError      = (e: unknown): e is NetworkError       => e instanceof NetworkError;
export const isValidationError   = (e: unknown): e is ValidationError   => e instanceof ValidationError;
export const isNotFoundError     = (e: unknown): e is NotFoundError     => e instanceof NotFoundError;
