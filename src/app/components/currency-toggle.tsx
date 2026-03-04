import React from 'react';
import { useCurrency } from '../../lib/currency-context';
import { cn } from './ui/utils';

interface CurrencyToggleProps {
    className?: string;
}

export function CurrencyToggle({ className }: CurrencyToggleProps) {
    const { currency, setCurrency } = useCurrency();

    return (
        <div className={cn("bg-secondary rounded-full flex p-0.5", className)}>
            <button
                type="button"
                onClick={() => setCurrency('INR')}
                className={cn(
                    "px-3 py-1 rounded-full text-[12px] font-mono transition-colors",
                    currency === 'INR'
                        ? "bg-primary text-background font-bold"
                        : "text-muted hover:text-foreground cursor-pointer"
                )}
            >
                ₹
            </button>
            <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={cn(
                    "px-3 py-1 rounded-full text-[12px] font-mono transition-colors",
                    currency === 'USD'
                        ? "bg-primary text-background font-bold"
                        : "text-muted hover:text-foreground cursor-pointer"
                )}
            >
                $
            </button>
        </div>
    );
}
