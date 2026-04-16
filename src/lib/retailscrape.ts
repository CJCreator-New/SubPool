export interface RetailScrapeResponse {
    platform: string;
    country: string;
    currency: string;
    plans: {
        name: string;
        price: number;
        billing_cycle: 'monthly' | 'yearly';
    }[];
}

export async function fetchOTTPricing(platformSlug: string, country: string): Promise<RetailScrapeResponse> {
    const apiKey = (import.meta as any).env.VITE_RETAILSCRAPE_KEY;
    if (!apiKey) throw new Error('Missing VITE_RETAILSCRAPE_KEY');

    const res = await fetch(`https://api.retailscrape.com/v1/pricing?platform=${platformSlug}&country=${country}`, {
        headers: { Authorization: `Bearer ${apiKey}` }
    });

    if (!res.ok) throw new Error(`RetailScrape Error: ${res.statusText}`);
    return res.json();
}

export function normalizeToplatformPricing(raw: RetailScrapeResponse): any[] {
    return raw.plans.map(plan => ({
        platform_id: raw.platform,
        platform_name: raw.platform, // Could map better with a lookup
        category: 'OTT',
        plan_name: plan.name,
        billing_cycle: plan.billing_cycle,
        country_code: raw.country,
        currency: raw.currency,
        official_price: plan.price,
        source: 'retailscrape'
    }));
}

export async function refreshPlatformPricing(platformId: string): Promise<{ updated: number, errors: string[] }> {
    const { supabase, isSupabaseConnected } = await import('./supabase/client');
    if (!isSupabaseConnected || !supabase) {
        throw new Error('Supabase not connected.');
    }

    const { data, error } = await supabase.functions.invoke('refresh-pricing', {
        body: { platform_id: platformId, country_codes: ['US', 'IN'] },
    });

    if (error) {
        throw new Error(error.message || 'Failed to invoke refresh-pricing edge function');
    }

    return data as { updated: number, errors: string[] };
}
