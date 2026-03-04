import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { useAuth } from './auth';
import { supabase } from './client';
import { MemoryRouter } from 'react-router';
import React from 'react';

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock Supabase client
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

    it('handles initial unauthenticated session', async () => {
        (supabase!.auth.getSession as Mock).mockResolvedValue({ data: { session: null } });
        (supabase!.auth.onAuthStateChange as Mock).mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } }
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <MemoryRouter>{children}</MemoryRouter>
        );

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
            data: { session: { user: mockUser } }
        });
        (supabase!.auth.onAuthStateChange as Mock).mockReturnValue({
            data: { subscription: { unsubscribe: vi.fn() } }
        });

        // Mock profile fetch
        const mockSingle = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
        const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        (supabase!.from as Mock).mockReturnValue({ select: mockSelect });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <MemoryRouter>{children}</MemoryRouter>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.user).toEqual(mockUser);

        await waitFor(() => {
            expect(result.current.profile).toEqual(mockProfile);
        });
    });

    it('calls signOut and redirects when signed out', async () => {
        (supabase!.auth.signOut as Mock).mockResolvedValue({ error: null });
        (supabase!.auth.getSession as Mock).mockResolvedValue({ data: { session: null } });

        let triggerAuthChange: any;
        (supabase!.auth.onAuthStateChange as Mock).mockImplementation((callback) => {
            triggerAuthChange = callback;
            return { data: { subscription: { unsubscribe: vi.fn() } } };
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <MemoryRouter>{children}</MemoryRouter>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        // Trigger manual auth state change
        act(() => {
            if (triggerAuthChange) {
                triggerAuthChange('SIGNED_OUT', null);
            }
        });

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
});
