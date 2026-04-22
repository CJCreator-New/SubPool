import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'TRY';

export interface CurrencyContextValue {
    currency: CurrencyCode;
    setCurrency: (c: CurrencyCode) => void;
    formatPrice: (cents: number) => string;
    symbol: string;
    exchangeRate: number; // Against USD base
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const SYMBOLS: Record<CurrencyCode, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    TRY: '₺',
};

const RATES: Record<CurrencyCode, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.42,
    TRY: 32.55,
};

const LOCALES: Record<CurrencyCode, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    INR: 'en-IN',
    TRY: 'tr-TR',
};

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('subpool_currency');
            if (stored && Object.keys(SYMBOLS).includes(stored)) return stored as CurrencyCode;
        }

        // Region detection
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (tz.includes('Kolkata')) return 'INR';
        if (tz.includes('Istanbul')) return 'TRY';
        if (tz.includes('London')) return 'GBP';
        if (tz.includes('Europe')) return 'EUR';
        
        return 'USD';
    });

    const setCurrency = (c: CurrencyCode) => {
        setCurrencyState(c);
        if (typeof window !== 'undefined') {
            localStorage.setItem('subpool_currency', c);
        }
    };

    const formatPrice = (cents: number) => {
        const converted = (cents / 100) * RATES[currency];
        return new Intl.NumberFormat(LOCALES[currency], {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: (currency === 'INR' || currency === 'TRY') ? 0 : 2,
            maximumFractionDigits: 2,
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ 
            currency, 
            setCurrency, 
            formatPrice, 
            symbol: SYMBOLS[currency],
            exchangeRate: RATES[currency]
        }}>
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
