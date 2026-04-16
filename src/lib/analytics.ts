import { supabase } from './supabase/client';
import {
    AnalyticsEventName,
    AnalyticsProperties,
    validateAnalyticsProperties,
} from './analytics-events';

export async function track<N extends AnalyticsEventName>(
    eventName: N,
    properties?: AnalyticsProperties<N>,
): Promise<void>;
export async function track(eventName: string, properties?: Record<string, unknown>): Promise<void>;
export async function track(eventName: string, properties?: Record<string, unknown>) {
    try {
        const safeProperties = validateAnalyticsProperties(eventName, properties);
        if (!supabase) {
            console.log('Analytics Event (No Supabase):', eventName, safeProperties);
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();

        const { error } = await supabase.from('analytics_events').insert({
            user_id: session?.user?.id || null,
            event_name: eventName,
            properties: safeProperties,
            // Token-derived identifiers are intentionally not stored client-side.
            session_id: null,
        });
        if (error) {
            console.warn('Failed to track event:', error.message);
        }
    } catch (e) {
        console.warn('Failed to track event:', e);
        console.log('Analytics Event (Fallback):', eventName, properties);
    }
}
