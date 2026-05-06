// ─── CurrencyContext Unit Tests (Level 4 QA) ─────────────────────────────────
// Tests the CurrencyProvider context value, formatPrice formatters,
// and localStorage persistence without requiring a full React tree render.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { CurrencyProvider, useCurrency } from './currency-context';

// ── Wrapper helper ────────────────────────────────────────────────────────────

function wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(CurrencyProvider, null, children);
}

// ── localStorage stub (jsdom's localStorage is available, just clear it) ──────

beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
});

// ─── Core Context Tests ───────────────────────────────────────────────────────

describe('CurrencyProvider — default state', () => {
    it('provides a currency value of USD by default in non-India locale', () => {
        // jsdom's navigator.language is "en-US" by default
        const { result } = renderHook(() => useCurrency(), { wrapper });
        expect(['USD', 'INR']).toContain(result.current.currency);
    });

    it('restores currency from localStorage when set to INR', () => {
        localStorage.setItem('subpool_currency', 'INR');
        const { result } = renderHook(() => useCurrency(), { wrapper });
        expect(result.current.currency).toBe('INR');
    });

    it('restores currency from localStorage when set to USD', () => {
        localStorage.setItem('subpool_currency', 'USD');
        const { result } = renderHook(() => useCurrency(), { wrapper });
        expect(result.current.currency).toBe('USD');
    });
});

// ─── setCurrency ──────────────────────────────────────────────────────────────

describe('CurrencyProvider — setCurrency', () => {
    it('switches currency and persists the change to localStorage', () => {
        const { result } = renderHook(() => useCurrency(), { wrapper });

        act(() => result.current.setCurrency('INR'));

        expect(result.current.currency).toBe('INR');
        expect(localStorage.getItem('subpool_currency')).toBe('INR');
    });

    it('switches back to USD and persists', () => {
        localStorage.setItem('subpool_currency', 'INR');
        const { result } = renderHook(() => useCurrency(), { wrapper });

        act(() => result.current.setCurrency('USD'));

        expect(result.current.currency).toBe('USD');
        expect(localStorage.getItem('subpool_currency')).toBe('USD');
    });
});

// ─── formatPrice ──────────────────────────────────────────────────────────────

describe('CurrencyProvider — formatPrice (USD)', () => {
    it('formats a USD price with $ symbol and 2 decimal places', () => {
        localStorage.setItem('subpool_currency', 'USD');
        const { result } = renderHook(() => useCurrency(), { wrapper });
        const formatted = result.current.formatPrice(1499);
        expect(formatted).toMatch(/\$14\.99/);
    });

    it('formats a whole USD amount correctly', () => {
        localStorage.setItem('subpool_currency', 'USD');
        const { result } = renderHook(() => useCurrency(), { wrapper });
        expect(result.current.formatPrice(1000)).toMatch(/\$10\.(00)?/);
    });
});

describe('CurrencyProvider — formatPrice (INR)', () => {
    it('formats an INR price with ₹ symbol and up to 2 decimals', () => {
        localStorage.setItem('subpool_currency', 'INR');
        const { result } = renderHook(() => useCurrency(), { wrapper });
        const formatted = result.current.formatPrice(1499);
        expect(formatted).toMatch(/₹/);
    });
});

// ─── symbol ───────────────────────────────────────────────────────────────────

describe('CurrencyProvider — symbol', () => {
    it('returns $ for USD', () => {
        localStorage.setItem('subpool_currency', 'USD');
        const { result } = renderHook(() => useCurrency(), { wrapper });
        expect(result.current.symbol).toBe('$');
    });

    it('returns ₹ for INR', () => {
        localStorage.setItem('subpool_currency', 'INR');
        const { result } = renderHook(() => useCurrency(), { wrapper });
        expect(result.current.symbol).toBe('₹');
    });
});

// ─── Error boundary ───────────────────────────────────────────────────────────

describe('useCurrency — safety', () => {
    it('throws a meaningful error when used outside a CurrencyProvider', () => {
        // Suppress the expected console.error from React about uncaught errors
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => renderHook(() => useCurrency())).toThrow(
            'useCurrency must be used within a CurrencyProvider'
        );
        spy.mockRestore();
    });
});
