// @ts-nocheck
import * as React from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './client';
import { Profile } from '../types';
import { resolveDataMode } from '../data-mode';



const {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} = React;

export type ReactNode = React.ReactNode;

export type AuthRole = 'guest' | 'member' | 'host';
const AUTH_BOOT_TIMEOUT_MS = 4000;

export interface AuthContextValue {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    role: AuthRole;
    isDemoMode: boolean;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function deriveRole(profile: Profile | null): AuthRole {
    if (!profile) return 'guest';
    if (profile.plan === 'host_plus') return 'host';
    return 'member';
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [user, setUser] = React.useState<User | null>(null);
    const [profile, setProfile] = React.useState<Profile | null>(null);
    const [loading, setLoading] = React.useState(true);
    const userIdRef = React.useRef<string | null>(null);

    const fetchProfile = React.useCallback(async (userId: string) => {
        if (!supabase) return;
        try {
            const [{ data: profileData, error: profileError }, { data: planData }] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', userId).single(),
                supabase.from('user_plans').select('plan_id').eq('user_id', userId).single(),
            ]);

            if (profileError) throw profileError;

            setProfile({
                ...(profileData as Profile),
                plan: (planData?.plan_id as Profile['plan']) || 'free',
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
            setProfile(null);
        }
    }, []);

    const refreshProfile = React.useCallback(async () => {
        if (!userIdRef.current) return;
        await fetchProfile(userIdRef.current);
    }, [fetchProfile]);

    const applySession = React.useCallback(async (session: { user?: User | null } | null) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        userIdRef.current = currentUser?.id ?? null;
        if (currentUser) {
            await fetchProfile(currentUser.id);

            // Check if we have a pending referral to process
            const pendingReferral = localStorage.getItem('subpool_referral_code');
            if (pendingReferral) {
                try {
                    const { data: res, error: refErr } = await supabase!.rpc('process_referral', {
                        p_referral_code: pendingReferral,
                        p_new_user_id: currentUser.id
                    });

                    if (res?.ok) {
                        console.log('Referral processed successfully:', res);
                        // Refresh profile after referral is linked
                        await fetchProfile(currentUser.id);
                    } else if (refErr) {
                        console.warn('Referral processing error:', refErr);
                    }
                } catch (e) {
                    console.error('Failed to process referral:', e);
                } finally {
                    localStorage.removeItem('subpool_referral_code');
                }
            }
            return;
        }
        setProfile(null);
    }, [fetchProfile]);

    React.useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        let mounted = true;
        const timeoutId = window.setTimeout(() => {
            if (!mounted) return;
            console.warn('Auth initialization timed out; continuing in guest mode.');
            setUser(null);
            setProfile(null);
            setLoading(false);
        }, AUTH_BOOT_TIMEOUT_MS);

        supabase.auth.getSession().then(async ({ data: { session } }) => {
            try {
                if (!mounted) return;
                window.clearTimeout(timeoutId);
                await applySession(session);
            } catch (err) {
                console.error('Auth initialization error:', err);
            } finally {
                setLoading(false);
            }
        }).catch((err) => {
            console.error('Fatal auth session error:', err);
            window.clearTimeout(timeoutId);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            try {
                await applySession(session);
            } catch (err) {
                console.error('Auth state change error:', err);
                setUser(null);
                setProfile(null);
            } finally {
                setLoading(false);
            }
        });

        return () => {
            mounted = false;
            window.clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, [applySession]);

    const signOut = React.useCallback(async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
    }, []);

    const value = React.useMemo<AuthContextValue>(() => ({
        user,
        profile,
        loading,
        role: deriveRole(profile),
        isDemoMode: resolveDataMode({ allowDemoFallback: true }) === 'demo',
        refreshProfile,
        signOut,
    }), [loading, profile, refreshProfile, signOut, user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const ctx = React.useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return ctx;
}
