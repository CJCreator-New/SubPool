import { describe, it, expect } from 'vitest';
import { CreatePoolSchema, WishlistRequestSchema, ProfileUpdateSchema, SendMessageSchema, zodErrorToString } from '../lib/validation';

describe('CreatePoolSchema', () => {
    it('accepts valid pool data', () => {
        const result = CreatePoolSchema.safeParse({
            platform: 'netflix',
            plan_name: 'Standard 4K',
            category: 'entertainment',
            total_cost: 17.99,
            total_slots: 4,
            billing_cycle: 'monthly',
        });
        expect(result.success).toBe(true);
    });

    it('rejects empty platform', () => {
        const result = CreatePoolSchema.safeParse({
            platform: '',
            plan_name: 'Plan',
            category: 'entertainment',
            total_cost: 10,
            total_slots: 2,
            billing_cycle: 'monthly',
        });
        expect(result.success).toBe(false);
    });

    it('rejects total_slots < 2', () => {
        const result = CreatePoolSchema.safeParse({
            platform: 'netflix',
            plan_name: 'Plan',
            category: 'productivity',
            total_cost: 10,
            total_slots: 1,
            billing_cycle: 'monthly',
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.errors[0].message).toContain('Minimum 2');
        }
    });

    it('rejects total_slots > 10', () => {
        const result = CreatePoolSchema.safeParse({
            platform: 'netflix',
            plan_name: 'Plan',
            category: 'ai',
            total_cost: 10,
            total_slots: 11,
            billing_cycle: 'yearly',
        });
        expect(result.success).toBe(false);
    });
});

describe('WishlistRequestSchema', () => {
    it('accepts valid wishlist request', () => {
        const result = WishlistRequestSchema.safeParse({
            platform: 'spotify',
            budget_max: 5.99,
        });
        expect(result.success).toBe(true);
    });

    it('rejects negative budget', () => {
        const result = WishlistRequestSchema.safeParse({
            platform: 'spotify',
            budget_max: -1,
        });
        expect(result.success).toBe(false);
    });

    it('rejects budget over $500', () => {
        const result = WishlistRequestSchema.safeParse({
            platform: 'spotify',
            budget_max: 600,
        });
        expect(result.success).toBe(false);
    });
});

describe('ProfileUpdateSchema', () => {
    it('accepts optional fields', () => {
        const result = ProfileUpdateSchema.safeParse({});
        expect(result.success).toBe(true);
    });

    it('rejects display_name that is too short', () => {
        const result = ProfileUpdateSchema.safeParse({ display_name: 'a' });
        expect(result.success).toBe(false);
    });

    it('rejects invalid avatar_color', () => {
        const result = ProfileUpdateSchema.safeParse({ avatar_color: 'red' });
        expect(result.success).toBe(false);
    });

    it('accepts valid hex avatar_color', () => {
        const result = ProfileUpdateSchema.safeParse({ avatar_color: '#C8F135' });
        expect(result.success).toBe(true);
    });
});

describe('SendMessageSchema', () => {
    it('accepts normal message', () => {
        const result = SendMessageSchema.safeParse({ body: 'Hello!' });
        expect(result.success).toBe(true);
    });

    it('rejects empty body', () => {
        const result = SendMessageSchema.safeParse({ body: '' });
        expect(result.success).toBe(false);
    });
});

describe('zodErrorToString', () => {
    it('joins multiple errors with comma', () => {
        const result = CreatePoolSchema.safeParse({ platform: '', plan_name: '', category: 'bad', total_cost: -1, total_slots: 1, billing_cycle: 'daily' });
        if (!result.success) {
            const str = zodErrorToString(result.error);
            expect(typeof str).toBe('string');
            expect(str.length).toBeGreaterThan(0);
        }
    });
});

// ─── sanitizeInput — Level 5 SecOps XSS Sweep ────────────────────────────────

import { sanitizeInput } from '../lib/validation';

describe('sanitizeInput (XSS Sanitization — Level 5 SecOps)', () => {
    it('escapes the ampersand character', () => {
        expect(sanitizeInput('AT&T')).toBe('AT&amp;T');
    });

    it('escapes opening angle bracket (script injection)', () => {
        expect(sanitizeInput('<script>')).toContain('&lt;');
        expect(sanitizeInput('<script>')).not.toContain('<');
    });

    it('escapes closing angle bracket', () => {
        expect(sanitizeInput('</script>')).toContain('&gt;');
        expect(sanitizeInput('</script>')).not.toContain('>');
    });

    it('escapes double-quote characters', () => {
        expect(sanitizeInput('"hello"')).toBe('&quot;hello&quot;');
    });

    it('escapes single-quote characters', () => {
        expect(sanitizeInput("it's")).toContain('&#x27;');
    });

    it('escapes forward slashes', () => {
        expect(sanitizeInput('/etc/passwd')).toContain('&#x2F;');
    });

    it('neutralises a typical XSS payload', () => {
        const payload = '<img src=x onerror="alert(1)">';
        const sanitized = sanitizeInput(payload);
        expect(sanitized).not.toContain('<');
        expect(sanitized).not.toContain('>');
        expect(sanitized).not.toContain('"');
    });

    it('returns an empty string for empty input', () => {
        expect(sanitizeInput('')).toBe('');
    });

    it('leaves safe plain text unchanged', () => {
        const safe = 'Hello, this is a normal message.';
        expect(sanitizeInput(safe)).toBe(safe);
    });
});

