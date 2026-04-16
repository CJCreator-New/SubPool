import { describe, it, expect, vi } from 'vitest';
import { analyzePricing, getSuggestion, getPricingData } from './pricing-service';

describe('Pricing Service', () => {
    describe('analyzePricing', () => {
        it('identifies a steal when price is very low', () => {
            // Netflix 4K is $22.99
            const analysis = analyzePricing({
                platformId: 'netflix',
                planName: '4K',
                userSlotPrice: 5.0, // < 40% of solo price
                totalSlots: 4,
                currency: 'USD',
                countryCode: 'US'
            });
            expect(analysis.band).toBe('steal');
            expect(analysis.label).toBe('steal');
        });

        it('identifies an overpriced plan when above solo price', () => {
            const analysis = analyzePricing({
                platformId: 'netflix',
                planName: 'Standard',
                userSlotPrice: 20.0, // Standard solo is $15.49
                totalSlots: 2,
                currency: 'USD',
                countryCode: 'US'
            });
            expect(analysis.band).toBe('overpriced');
        });

        it('calculates host offset correctly', () => {
            // Hotstar Super is 299 INR
            const analysis = analyzePricing({
                platformId: 'disneyplus',
                planName: 'Super',
                userSlotPrice: 200,
                totalSlots: 2,
                currency: 'INR',
                countryCode: 'IN'
            });
            // Host offset = (200 * (2-1)) / 299 = ~66%
            expect(analysis.hostOffset).toBeCloseTo(66.88, 1);
        });

        it('calculates savings percentage for members', () => {
            const analysis = analyzePricing({
                platformId: 'netflix',
                planName: '4K',
                userSlotPrice: 7.0,
                totalSlots: 4,
                currency: 'USD',
                countryCode: 'US'
            });
            // Savings = (22.99 - 7) / 22.99 = ~69.5%
            expect(analysis.savingsPct).toBeCloseTo(69.55, 1);
        });
    });

    describe('getSuggestion', () => {
        it('recommends ~75% of solo price', () => {
            const suggestion = getSuggestion('prime', 'Individual', 3, 'USD');
            // Prime is $8.99. Recommended = 8.99 * 0.75 = 6.74
            expect(suggestion.recommended).toBeCloseTo(6.74, 2);
        });
    });
});
