import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { User } from '@supabase/supabase-js';
import { supabase } from './client';
import { Profile } from '../types';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchProfile = async (userId: string) => {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        // 1. Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
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
                navigate('/login');
            } else if (event === 'SIGNED_IN') {
                navigate('/browse');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [navigate]);

    const signOut = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
    };

    return { user, profile, loading, signOut };
}
