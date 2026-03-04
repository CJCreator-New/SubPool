import { PLATFORM_PRICING_SEED } from './pricing-seed';
export { PLATFORM_PRICING_SEED };
export type { PlatformPricing } from './pricing-seed';
import { supabase, isSupabaseConnected } from './supabase/client';
import { MOCK_POOLS } from './mock-data';

export type PricingBand = 'steal' | 'cheap' | 'fair' | 'aggressive' | 'overpriced';

export interface PricingAnalysis {
    band: PricingBand;
    label: string;
    color: string;
    userSlotPrice: number;
    officialSoloPrice: number;
    savingsPct: number;
    hostEarnings: number;
    hostOffset: number;
    fairRangeMin: number;
    fairRangeMax: number;
    marketMin: number;
    marketMedian: number;
    warningMessage: string | null;
    tipMessage: string | null;
}

export interface SlotPriceSuggestion {
    recommended: number;
    rangeMin: number;
    rangeMax: number;
    currency: string;
    basis: string;
}

export function analyzePricing(params: {
    platformId: string;
    planName: string;
    userSlotPrice: number;
    totalSlots: number;
    currency: 'USD' | 'INR';
    countryCode: string;
}): PricingAnalysis {
    const seed = PLATFORM_PRICING_SEED.find(
        (s) =>
            s.platform_id === params.platformId &&
            s.plan_name.toLowerCase() === params.planName.toLowerCase() &&
            s.currency === params.currency
    );

    const officialPrice = seed ? seed.official_price : 0;
    const officialSoloPrice = officialPrice; // Per instructions: official_price / 1

    const ratio = officialSoloPrice > 0 ? params.userSlotPrice / officialSoloPrice : 0;

    let band: PricingBand = 'fair';
    let color = '#C8F135';
    let label = 'Fair Price';
    let warningMessage: string | null = null;
    let tipMessage: string | null = null;

    if (ratio < 0.40) {
        band = 'steal';
        color = '#4DFF91';
        label = 'steal';
        warningMessage = "You're essentially subsidising others. Consider raising the price.";
    } else if (ratio < 0.65) {
        band = 'cheap';
        color = '#A8E063';
        label = 'hot deal';
        tipMessage = "This will fill fast. You could charge a bit more and still save members money.";
    } else if (ratio <= 0.85) {
        band = 'fair';
        color = '#C8F135';
        label = 'fair';
        tipMessage = "Great price! This typically fills within 24 hours.";
    } else if (ratio <= 1.05) {
        band = 'aggressive';
        color = '#F5A623';
        label = 'above market';
        warningMessage = "Expect slower fill times."; // Can append actual market data if passed
    } else {
        band = 'overpriced';
        color = '#FF4D4D';
        label = 'above market';
        warningMessage = "This is above solo pricing — most users will skip this pool.";
    }

    const savingsPct = officialSoloPrice > 0 ? ((officialSoloPrice - params.userSlotPrice) / officialSoloPrice) * 100 : 0;
    const hostEarnings = params.userSlotPrice * (params.totalSlots - 1);
    const hostOffset = officialPrice > 0 ? (hostEarnings / officialPrice) * 100 : 0;

    const fairRangeMin = officialPrice * 0.65;
    const fairRangeMax = officialPrice * 0.85;

    // Market metrics placeholder
    const marketMin = 0;
    const marketMedian = 0;

    return {
        band,
        label,
        color,
        userSlotPrice: params.userSlotPrice,
        officialSoloPrice,
        savingsPct,
        hostEarnings,
        hostOffset,
        fairRangeMin,
        fairRangeMax,
        marketMin,
        marketMedian,
        warningMessage,
        tipMessage
    };
}

export function getSuggestion(platformId: string, planName: string, totalSlots: number, currency: 'USD' | 'INR'): SlotPriceSuggestion {
    const seed = PLATFORM_PRICING_SEED.find(
        (s) =>
            s.platform_id === platformId &&
            s.plan_name.toLowerCase() === planName.toLowerCase() &&
            s.currency === currency
    );

    const officialPrice = seed ? seed.official_price : 0;

    const recommended = officialPrice * 0.75; // 75% sweet spot
    const rangeMin = officialPrice * 0.65;
    const rangeMax = officialPrice * 0.85;

    return {
        recommended,
        rangeMin,
        rangeMax,
        currency,
        basis: `Based on official ${seed ? seed.platform_name : platformId} ${planName} pricing`
    };
}

export async function getMarketMetrics(platformId: string, planName: string) {
    if (isSupabaseConnected && supabase) {
        const { data, error } = await supabase
            .from('pool_market_metrics')
            .select('*')
            .eq('platform_id', platformId)
            .eq('plan_name', planName)
            .maybeSingle();

        if (!error && data) return data;
    }

    // mock fallback
    const pools = MOCK_POOLS.filter(p => p.platform_id === platformId && p.plan_name.toLowerCase() === planName.toLowerCase());
    if (pools.length === 0) return null;

    const prices = pools.map(p => p.price_per_slot / 100);
    prices.sort((a, b) => a - b);
    const min_slot_price = prices[0];
    const max_slot_price = prices[prices.length - 1];
    const median_slot_price = prices[Math.floor(prices.length / 2)];
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg_slot_price = sum / prices.length;

    return {
        avg_slot_price,
        min_slot_price,
        max_slot_price,
        median_slot_price,
        platform_id: platformId,
        plan_name: planName,
        pool_count: pools.length,
        is_mock: true
    };
}


// Fallback formatPrice if needed outside context
export function formatPrice(amount: number, currency: string = 'USD'): string {
    if (currency === 'INR') {
        return `₹${amount.toFixed(0)}`;
    }
    return `$${amount.toFixed(2)}`;
}

// Fallback detectUserCurrency
export function detectUserCurrency(): 'INR' | 'USD' {
    if (typeof navigator !== 'undefined' && navigator.language && navigator.language.includes('en-IN')) {
        return 'INR';
    }
    return 'USD';
}

export function getPlatformSharingNote(platformId: string, planName: string): {
    policy: 'allowed' | 'grey_area' | 'not_recommended';
    note: string;
    color: string;
} {
    const seed = PLATFORM_PRICING_SEED.find(
        (s) =>
            s.platform_id === platformId &&
            s.plan_name.toLowerCase() === planName.toLowerCase()
    );

    let policy: 'allowed' | 'grey_area' | 'not_recommended' = 'allowed';
    if (seed && seed.sharing_policy) {
        policy = seed.sharing_policy;
    }

    switch (policy) {
        case 'allowed':
            return { policy, note: 'Sharing is fully supported by this plan.', color: '#4DFF91' };
        case 'grey_area':
            return { policy, note: 'Sharing is unofficially tolerated (grey area). Proceed at your discretion.', color: '#F5A623' };
        case 'not_recommended':
            return { policy, note: 'Each person should have their own seat. Sharing credentials is against terms.', color: '#FF4D4D' };
        default:
            return { policy: 'allowed', note: '', color: '#FFFFFF' };
    }
}
