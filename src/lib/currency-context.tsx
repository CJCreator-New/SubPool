import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CurrencyContextValue {
    currency: 'INR' | 'USD';
    setCurrency: (c: 'INR' | 'USD') => void;
    formatPrice: (amount: number) => string;
    symbol: '₹' | '$';
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    // 1. Initial State Detection
    const [currency, setCurrencyState] = useState<'INR' | 'USD'>(() => {
        // Check local storage first
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('subpool_currency');
            if (stored === 'INR' || stored === 'USD') return stored;
        }

        // Default detection
        const isIndia =
            typeof navigator !== 'undefined' &&
            (navigator.language.startsWith('hi') ||
                navigator.language === 'en-IN' ||
                (Intl.DateTimeFormat().resolvedOptions().timeZone || '').includes('Kolkata'));

        return isIndia ? 'INR' : 'USD';
    });

    // 2. Persist Changes
    const setCurrency = (c: 'INR' | 'USD') => {
        setCurrencyState(c);
        if (typeof window !== 'undefined') {
            localStorage.setItem('subpool_currency', c);
        }
    };

    // 3. Formatters
    const formatPrice = (amount: number) => {
        if (currency === 'INR') {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
            }).format(amount); // e.g., ₹1,499
        } else {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(amount); // e.g., $14.99
        }
    };

    const symbol = currency === 'INR' ? '₹' : '$';

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, symbol }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency(): CurrencyContextValue {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
