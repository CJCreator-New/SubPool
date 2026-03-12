import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { MemoryRouter } from 'react-router';
import { AuthProvider, useAuth } from './auth';
import { supabase } from './client';

vi.mock('./client', () => {
    return {
        supabase: {
            auth: {
                getSession: vi.fn(),
                onAuthStateChange: vi.fn(),
                signOut: vi.fn(),
            },
            from: vi.fn(),
        },
        isSupabaseConnected: true,
    };
});

describe('useAuth hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function wrapper({ children }: { children: React.ReactNode }) {
        return (
            <MemoryRouter>
                <AuthProvider>{children}</AuthProvider>
            </MemoryRouter>
        );
    }

    it('handles initial unauthenticated session', async () => {
        (supabase!.auth.getSession as Mock).mockResolvedValue({ data: { session: null } });
        (supabase!.auth.onAuthStateChange as Mock).mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } },
        });

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.loading).toBe(true);
        expect(result.current.user).toBeNull();
        expect(result.current.profile).toBeNull();

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toBeNull();
    });

    it('handles initial authenticated session and fetches profile', async () => {
        const mockUser = { id: 'user-123', email: 'test@example.com' };
        const mockProfile = { id: 'user-123', username: 'tester' };

        (supabase!.auth.getSession as Mock).mockResolvedValue({
            data: { session: { user: mockUser } },
        });
        (supabase!.auth.onAuthStateChange as Mock).mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } },
        });

        const profileSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
        const profileEq = vi.fn().mockReturnValue({ single: profileSingle });
        const profileSelect = vi.fn().mockReturnValue({ eq: profileEq });

        const planSingle = vi.fn().mockResolvedValue({ data: { plan_id: 'free' }, error: null });
        const planEq = vi.fn().mockReturnValue({ single: planSingle });
        const planSelect = vi.fn().mockReturnValue({ eq: planEq });

        (supabase!.from as Mock).mockImplementation((table: string) => {
            if (table === 'profiles') return { select: profileSelect };
            if (table === 'user_plans') return { select: planSelect };
            return { select: vi.fn() };
        });

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toEqual(mockUser);

        await waitFor(() => {
            expect(result.current.profile).toEqual({ ...mockProfile, plan: 'free' });
        });
    });

    it('clears user on SIGNED_OUT event', async () => {
        (supabase!.auth.getSession as Mock).mockResolvedValue({ data: { session: null } });

        let triggerAuthChange: ((event: string, session: unknown) => void) | undefined;
        (supabase!.auth.onAuthStateChange as Mock).mockImplementation((callback) => {
            triggerAuthChange = callback;
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        });

        const { result } = renderHook(() => useAuth(), { wrapper });
        await waitFor(() => expect(result.current.loading).toBe(false));

        act(() => {
            triggerAuthChange?.('SIGNED_OUT', null);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.profile).toBeNull();
    });
});
