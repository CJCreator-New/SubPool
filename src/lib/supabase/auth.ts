import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { User } from '@supabase/supabase-js';
import { supabase } from './client';
import { Profile } from '../types';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Track whether there was a previous session so we don't navigate on
    // every token auto-refresh (which also fires SIGNED_IN).
    const hadSessionRef = useRef<boolean | null>(null);

    const fetchProfile = async (userId: string) => {
        if (!supabase) return;
        try {
            // Fetch profile and plan in parallel or via join
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) throw profileError;

            const { data: planData } = await supabase
                .from('user_plans')
                .select('plan_id')
                .eq('user_id', userId)
                .single();

            setProfile({
                ...(profileData as Profile),
                plan: (planData?.plan_id as any) || 'free'
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        // 1. Initial session check — sets the hadSession ref BEFORE the listener fires
        supabase.auth.getSession().then(({ data: { session } }) => {
            hadSessionRef.current = Boolean(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
            setLoading(false);
        });

        // 2. Auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser.id);
            }

            if (event === 'SIGNED_OUT') {
                setProfile(null);
                hadSessionRef.current = false;
                navigate('/login');
            } else if (event === 'SIGNED_IN') {
                // Only navigate if this is a FRESH sign-in (hadSession was false/null).
                // Token auto-refreshes also emit SIGNED_IN — we ignore those.
                if (!hadSessionRef.current) {
                    hadSessionRef.current = true;
                    navigate('/browse');
                }
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate]); // eslint-disable-line react-hooks/exhaustive-deps

    const signOut = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
    };

    return { user, profile, loading, signOut };
}
