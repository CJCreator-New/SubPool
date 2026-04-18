import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { joinPool, approveRequest, createPool } from './mutations';
import { supabase, isSupabaseConnected } from './client';

// Mock import.meta.env inline since vitest setup already handles it, but we want to specify it for this file
vi.mock('./client', () => {
    return {
        supabase: {
            from: vi.fn(),
            rpc: vi.fn(),
            auth: { getUser: vi.fn() },
            functions: { invoke: vi.fn() },
        },
        // Force true to avoid demo mode
        isSupabaseConnected: true,
    };
});

describe('Supabase Mutations', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Since we stubbed import.meta in setup, we ensure real VITE_SUPABASE_URL here 
        // to bypass the `isDemoMode` check in mutations.ts
        vi.stubGlobal('import.meta', {
            env: {
                VITE_SUPABASE_URL: 'https://real.supabase.co',
                VITE_SUPABASE_ANON_KEY: 'mock-key',
            }
        });
    });

    describe('joinPool', () => {
        it('returns an error if the user is already a member', async () => {
            const mockEq2 = vi.fn().mockResolvedValue({ data: [{ id: 'mem-1' }], error: null });
            const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
            const mockSelect = vi.fn().mockReturnValue({ eq: mockEq1 });
            (supabase!.from as Mock).mockReturnValue({ select: mockSelect });

            const result = await joinPool('pool-1', 'user-1', 'Hi');

            expect(result.success).toBe(false);
            expect(result.error).toBe('You are already a member of this pool.');
        });

        it('returns an error if the pool is already full', async () => {
            const mockEq2 = vi.fn().mockResolvedValue({ data: [], error: null });
            const mockEq1 = vi.fn().mockReturnValue({ eq: mockEq2 });
            const mockSelectMembership = vi.fn().mockReturnValue({ eq: mockEq1 });

            const mockSingle = vi.fn().mockResolvedValue({
                data: { filled_slots: 4, total_slots: 4, owner_id: 'ow-1' },
                error: null
            });
            const mockEqPool = vi.fn().mockReturnValue({ single: mockSingle });
            const mockSelectPool = vi.fn().mockReturnValue({ eq: mockEqPool });

            (supabase!.from as Mock).mockImplementation((table) => {
                if (table === 'memberships') return { select: mockSelectMembership };
                if (table === 'pools') return { select: mockSelectPool };
            });

            const result = await joinPool('pool-1', 'user-1', 'Hi');

            expect(result.success).toBe(false);
            expect(result.error).toBe('This pool is already full.');
        });
    });

    describe('approveRequest', () => {
        it('calls the manage-membership edge function', async () => {
            (supabase!.functions.invoke as Mock).mockResolvedValue({ data: { ok: true }, error: null });

            const result = await approveRequest('req-123');

            expect(supabase!.functions.invoke).toHaveBeenCalledWith('manage-membership', {
                body: { joinRequestId: 'req-123', action: 'approve' },
            });
            expect(result.success).toBe(true);
        });

        it('handles edge function errors gracefully', async () => {
            (supabase!.functions.invoke as Mock).mockResolvedValue({ data: null, error: { message: 'DB Error' } });

            const result = await approveRequest('req-123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('DB Error');
        });
    });

    describe('createPool', () => {
        it('successfully inserts a new pool and invokes wishlist matching', async () => {
            const mockInput = {
                platform: 'netflix',
                owner_id: 'user-123',
                category: 'entertainment' as const,
                status: 'open' as const,
                plan_name: 'Premium',
                price_per_slot: 400,
                total_slots: 4,
                auto_approve: false,
                description: '',
            };

            const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'pool-789' }, error: null });
            const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
            const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });

            (supabase!.auth.getUser as Mock).mockResolvedValue({ data: { user: { user_metadata: { name: 'Test User' } } } });
            
            (supabase!.from as Mock).mockImplementation((table) => {
                if (table === 'pools') return { insert: mockInsert };
                return { insert: vi.fn().mockResolvedValue({ error: null }) };
            });

            const result = await createPool(mockInput);

            expect(result.success).toBe(true);
            expect(result.data?.poolId).toBe('pool-789');
            expect(mockInsert).toHaveBeenCalledWith({ ...mockInput, slots_filled: 0 });
            // Wishlist matching is fire-and-forget but should still be called
            expect(supabase!.functions.invoke).toHaveBeenCalledWith('match-wishlist', {
                body: { pool_id: 'pool-789' }
            });
        });
    });
});
