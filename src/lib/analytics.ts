import { supabase } from './supabase/client';

export async function track(eventName: string, properties?: object) {
    try {
        if (!supabase) {
            console.log('Analytics Event (No Supabase):', eventName, properties);
            return;
        }

        const { data: { session } } = await supabase.auth.getSession();

        supabase.from('analytics_events').insert({
            user_id: session?.user?.id || null,
            event_name: eventName,
            properties: properties || {},
            session_id: session?.access_token || null
        }).then(({ error }) => {
            if (error) {
                console.warn('Failed to track event:', error.message);
            }
        });
    } catch (e) {
        console.warn('Failed to track event:', e);
        console.log('Analytics Event (Fallback):', eventName, properties);
    }
}
