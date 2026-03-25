import { describe, it, expect } from 'vitest';
import {
    SubPoolError,
    RateLimitError,
    AuthError,
    PermissionError,
    NetworkError,
    ValidationError,
    NotFoundError,
    classifyError,
    isRateLimitError,
    isAuthError,
} from '../lib/errors';

describe('SubPoolError hierarchy', () => {
    it('creates a base SubPoolError', () => {
        const err = new SubPoolError('test message', 'TEST');
        expect(err.message).toBe('test message');
        expect(err.code).toBe('TEST');
        expect(err.isRetryable).toBe(false);
        expect(err instanceof Error).toBe(true);
    });

    it('RateLimitError has correct defaults', () => {
        const err = new RateLimitError();
        expect(err.code).toBe('RATE_LIMIT');
        expect(err.isRetryable).toBe(true);
        expect(err.retryAfterSec).toBe(60);
        expect(isRateLimitError(err)).toBe(true);
    });

    it('RateLimitError with custom seconds', () => {
        const err = new RateLimitError(30);
        expect(err.retryAfterSec).toBe(30);
    });

    it('AuthError has correct code', () => {
        const err = new AuthError();
        expect(err.code).toBe('AUTH_REQUIRED');
        expect(err.httpStatus).toBe(401);
        expect(isAuthError(err)).toBe(true);
    });

    it('PermissionError has 403 status', () => {
        const err = new PermissionError();
        expect(err.httpStatus).toBe(403);
        expect(err.isRetryable).toBe(false);
    });

    it('NetworkError is retryable', () => {
        const err = new NetworkError();
        expect(err.isRetryable).toBe(true);
    });

    it('ValidationError captures field', () => {
        const err = new ValidationError('Too short', 'bio');
        expect(err.field).toBe('bio');
        expect(err.isRetryable).toBe(false);
    });

    it('NotFoundError has 404 status', () => {
        const err = new NotFoundError('Pool');
        expect(err.httpStatus).toBe(404);
        expect(err.message).toContain('Pool');
    });
});

describe('classifyError', () => {
    it('returns same SubPoolError if already typed', () => {
        const orig = new RateLimitError(45);
        expect(classifyError(orig)).toBe(orig);
    });

    it('classifies rate limit messages', () => {
        const err = classifyError(new Error('You hit the rate limit, wait 30 seconds'));
        expect(isRateLimitError(err)).toBe(true);
        expect((err as RateLimitError).retryAfterSec).toBe(30);
    });

    it('classifies JWT errors as AuthError', () => {
        const err = classifyError(new Error('jwt expired'));
        expect(isAuthError(err)).toBe(true);
    });

    it('classifies permission denied', () => {
        const err = classifyError(new Error('permission denied for table pools'));
        expect(err.code).toBe('PERMISSION_DENIED');
    });

    it('classifies network failures', () => {
        const err = classifyError(new Error('failed to fetch'));
        expect(err instanceof NetworkError).toBe(true);
        expect(err.isRetryable).toBe(true);
    });

    it('wraps unknown errors as generic SubPoolError', () => {
        const err = classifyError('just a string error');
        expect(err instanceof SubPoolError).toBe(true);
        expect(err.code).toBe('UNKNOWN');
    });
});
