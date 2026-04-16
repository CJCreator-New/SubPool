import { describe, it, expect } from 'vitest';
import { getPlatform, formatPrice, formatDate, calcSavings, abbrevNumber } from './constants';

describe('Constants Utilities', () => {
    describe('getPlatform', () => {
        it('returns correct platform for valid id', () => {
            const p = getPlatform('netflix');
            expect(p?.name).toBe('Netflix');
            expect(p?.category).toBe('entertainment');
        });

        it('returns undefined for invalid id', () => {
            expect(getPlatform('non-existent')).toBeUndefined();
        });
    });

    describe('formatPrice', () => {
        it('formats cents to USD string', () => {
            expect(formatPrice(499)).toBe('$4.99');
            expect(formatPrice(1250)).toBe('$12.50');
            expect(formatPrice(0)).toBe('$0.00');
        });
    });

    describe('formatDate', () => {
        it('formats ISO to short label', () => {
            const iso = '2025-02-28T00:00:00Z';
            // Output depends on locale, but typically 'Feb 28'
            expect(formatDate(iso)).toContain('Feb 28');
        });
    });

    describe('calcSavings', () => {
        it('calculates savings correctly', () => {
            // (1599 - 499) / 1599 = 68.79%
            expect(calcSavings(1599, 499)).toBe(69);
            expect(calcSavings(100, 100)).toBe(0);
            expect(calcSavings(100, 110)).toBe(-10);
        });

        it('returns 0 if retail is 0', () => {
            expect(calcSavings(0, 499)).toBe(0);
        });
    });

    describe('abbrevNumber', () => {
        it('abbreviates thousands', () => {
            expect(abbrevNumber(1200)).toBe('1.2k');
            expect(abbrevNumber(500)).toBe('500');
        });

        it('abbreviates millions', () => {
            expect(abbrevNumber(2500000)).toBe('2.5M');
        });
    });
});
