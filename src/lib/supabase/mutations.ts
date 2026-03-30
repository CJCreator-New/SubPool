// ─── Supabase Mutations ────────────────────────────────────────────────────────
// Write operations with mock-mode support.
// When Supabase is not connected AND we are in demo/dev mode, mutations resolve
// optimistically so the UI can be exercised without env setup.
// In production (VITE_SUPABASE_URL is set) a null client is a hard error.

import { supabase } from './client';
import type { Pool, Profile } from '../types';
import { resolveDataMode } from '../data-mode';

// ─── Result type ──────────────────────────────────────────────────────────────

export interface MutationResult<T = void> {
    data: T | null;
    error: string | null;
    success: boolean;
}
function ok<T>(data: T): MutationResult<T> { return { data, error: null, success: true }; }
function fail(msg: string): MutationResult<never> { return { data: null, error: msg, success: false }; }
function delay(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }

/**
 * Returns true only when we are explicitly in offline/demo mode.

// ─── Result type ───────────────────────────────────────────────────────────

export interface MutationResult<T = void> {
    data: T | null;
    error: string | null;
    success: boolean;
}
function ok<T>(data: T): MutationResult<T> { return { data, error: null, success: true }; }
function fail(msg: string): MutationResult<never> { return { data: null, error: msg, success: false }; }
function delay(ms: number) { return new Promise<void>((r) => setTimeout(r, ms)); }

/**
 * Returns true only when we are explicitly in offline/demo mode.
 * A missing URL means dev mode; a configured URL means production → never mock.
 */
function isDemoMode(allowDemoFallback = false): boolean {
    return resolveDataMode({ allowDemoFallback }) === 'demo';
}

/** Ensures Supabase is available; throws a user-visible error in production. */
function requireSupabase(): NonNullable<typeof supabase> {
    if (supabase) return supabase;
    throw new Error(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
}

// ─── Mutation Rate Limiter (Double-click Guard) ─────────────────────────────
const activeMutations = new Map<string, Promise<any>>();

/**
 * Wraps a mutation with a deduplication lock based on a unique key.
 * If a mutation with the same key is already running, it returns a 
 * "Please wait" error to prevent double-click submissions.
 */
async function withRateLimit<T>(
    key: string,
    mutationFn: () => Promise<MutationResult<T>>
): Promise<MutationResult<T>> {
    if (activeMutations.has(key)) {
        return fail('Request already in progress. Please wait.');
    }

    const promise = mutationFn();
    activeMutations.set(key, promise);

    try {
        const result = await promise;
        return result;
    } finally {
        activeMutations.delete(key);
    }
}

// ─── Pool mutations ───────────────────────────────────────────────────────────

/** Request to join a pool slot. */
export function joinPool(
    poolId: string,
    userId: string,
    message?: string,
    options?: { allowDemoFallback?: boolean },
): Promise<MutationResult<{ requestId: string }>> {
    return withRateLimit(`joinPool:${userId}:${poolId}`, async () => {
        const isMock = isDemoMode(options?.allowDemoFallback ?? false);

        if (isMock) {
            await delay(400);
            return ok({ requestId: `req-mock-${Date.now()}` });
        }

        try {
            // 1. Check not already member
            const { data: memberRows } = await supabase!
                .from('memberships')
                .select('id')
                .eq('pool_id', poolId)
                .eq('user_id', userId);

            if (memberRows && memberRows.length > 0) {
                return fail('You are already a member of this pool.');
            }

            // 2. Check pool not full
            const { data: poolData, error: poolErr } = await supabase!
                .from('pools')
                .select('filled_slots, total_slots, owner_id, platform, plan_name')
                .eq('id', poolId)
                .single();

            if (poolErr || !poolData) return fail('Pool not found.');
            if (poolData.filled_slots >= poolData.total_slots) {
                return fail('This pool is already full.');
            }

            // 3. Insert join_request
            const { data: reqData, error: reqErr } = await supabase!
                .from('join_requests')
                .insert({
                    pool_id: poolId,
                    requester_id: userId,
                    message: message || '',
                    status: 'pending'
                })
                .select('id').single();

            if (reqErr) return fail(reqErr.message);

            // 4. Insert notification for pool owner
            const { data: userData } = await supabase!.auth.getUser();
            const username = userData.user?.user_metadata?.name || 'Someone';

            await supabase!.from('notifications').insert({
                user_id: poolData.owner_id,
                type: 'join_request',
                title: `${username} wants to join your pool`,
                body: `${poolData.platform} · ${poolData.plan_name}`,
                action_url: `/my-pools`
            });

            return ok({ requestId: (reqData as { id: string }).id });
        } catch (e) { return fail((e as Error).message); }
    });
}

/** Approve a join request.
 *  Delegates to the `approve_join_request` Postgres RPC which runs the entire
 *  flow (status update, membership insert, atomic slot increment, ledger entry,
 *  requester notification) inside a single ACID transaction.
 *  This eliminates the previous race condition on filled_slots.
 */
export function approveRequest(
    requestId: string,
    options?: { allowDemoFallback?: boolean },
): Promise<MutationResult> {
    return withRateLimit(`approveRequest:${requestId}`, async () => {
        if (isDemoMode(options?.allowDemoFallback ?? false)) { await delay(600); return ok(undefined); }

        try {
            const db = requireSupabase();
            const { data, error } = await db.functions.invoke('manage-membership', {
                body: { joinRequestId: requestId, action: 'approve' }
            });

            if (error) return fail(error.message);
            if (data?.error) return fail(data.error);

            return ok(undefined);
        } catch (e) { return fail((e as Error).message); }
    });
}

/** Reject a join request. */
export function rejectRequest(
    requestId: string,
    options?: { allowDemoFallback?: boolean },
): Promise<MutationResult> {
    return withRateLimit(`rejectRequest:${requestId}`, async () => {
        if (isDemoMode(options?.allowDemoFallback ?? false)) { await delay(400); return ok(undefined); }
        try {
            const db = requireSupabase();
            const { data, error } = await db.functions.invoke('manage-membership', {
                body: { joinRequestId: requestId, action: 'reject' }
            });

            if (error) return fail(error.message);
            if (data?.error) return fail(data.error);

            return ok(undefined);
        } catch (e) { return fail((e as Error).message); }
    });
}

/** Create a new pool listing. */
export function createPool(
    input: Omit<Pool, 'id' | 'owner' | 'created_at' | 'updated_at' | 'filled_slots'>,
    options?: { allowDemoFallback?: boolean },
): Promise<MutationResult<{ poolId: string }>> {
    return withRateLimit('createPool', async () => {
        if (isDemoMode(options?.allowDemoFallback ?? false)) {
            await delay(600);
            return ok({ poolId: `pool-mock-${Date.now()}` });
        }
        try {
            const db = requireSupabase();
            const { data, error } = await db
                .from('pools')
                .insert({ ...input, slots_filled: 0 })
                .select('id').single();
            if (error) return fail(error.message);
            const poolId = (data as { id: string }).id;
            
                        // Fire-and-forget: notify wishlist users who match this new pool
                        void db.functions.invoke('match-wishlist', {
                            body: { pool_id: poolId }
                        }).catch(() => { /* non-critical */ });
            
                        return ok({ poolId });
        } catch (e) { return fail((e as Error).message); }
    });
}

/** Change pool status. */
export function updatePoolStatus(
    poolId: string,
    status: 'open' | 'full' | 'closed',
    options?: { allowDemoFallback?: boolean },
): Promise<MutationResult> {
    return withRateLimit(`updatePoolStatus:${poolId}`, async () => {
        if (isDemoMode(options?.allowDemoFallback ?? false)) { await delay(300); return ok(undefined); }
        try {
            const { error } = await requireSupabase()
                .from('pools').update({ status }).eq('id', poolId);
            return error ? fail(error.message) : ok(undefined);
        } catch (e) { return fail((e as Error).message); }
    });
}

// ─── Profile mutations ───────────────────────────────────────────────────────

/**
 * Update safe profile fields.
 * NOTE: `is_pro` is intentionally excluded — elevation to Pro must happen
 * server-side (e.g., via a Stripe webhook) to prevent self-promotion.
 */
export function updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, 'display_name' | 'bio' | 'avatar_color'>>,
    options?: { allowDemoFallback?: boolean },
): Promise<MutationResult> {
    return withRateLimit(`updateProfile:${userId}`, async () => {
        if (isDemoMode(options?.allowDemoFallback ?? false)) { await delay(400); return ok(undefined); }
        try {
            const { error } = await requireSupabase().from('profiles').update(updates).eq('id', userId);
            return error ? fail(error.message) : ok(undefined);
        } catch (e) { return fail((e as Error).message); }
    });
}

// ─── Notification mutations ───────────────────────────────────────────────────

export function markNotificationRead(id: string): Promise<MutationResult> {
    return withRateLimit(`markNotificationRead:${id}`, async () => {
        if (isDemoMode()) { await delay(150); return ok(undefined); }
        try {
            const { error } = await requireSupabase().from('notifications').update({ read: true }).eq('id', id);
            return error ? fail(error.message) : ok(undefined);
        } catch (e) { return fail((e as Error).message); }
    });
}

export function markAllNotificationsRead(userId: string): Promise<MutationResult> {
    return withRateLimit(`markAllNotificationsRead:${userId}`, async () => {
        if (isDemoMode()) { await delay(200); return ok(undefined); }
        try {
            const { error } = await requireSupabase()
                .from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
            return error ? fail(error.message) : ok(undefined);
        } catch (e) { return fail((e as Error).message); }
    });
}

// ─── Message mutations ────────────────────────────────────────────────────────

export function sendMessage(
    threadId: string,
    body: string,
    options?: { allowDemoFallback?: boolean },
): Promise<MutationResult<{ messageId: string }>> {
    return withRateLimit(`sendMessage:${threadId}`, async () => {
        if (isDemoMode(options?.allowDemoFallback ?? false)) {
            await delay(250);
            return ok({ messageId: `msg-mock-${Date.now()}` });
        }
        try {
            const db = requireSupabase();
            const { data, error } = await db
                .from('messages')
                .insert({ thread_id: threadId, body })
                .select('id').single();
            if (error) return fail(error.message);

            await db.from('threads')
                .update({ last_message: body, last_message_at: new Date().toISOString() }).eq('id', threadId);
            return ok({ messageId: (data as { id: string }).id });
        } catch (e) { return fail((e as Error).message); }
    });
}

// ─── Ledger mutations ─────────────────────────────────────────────────────────

export function markLedgerPaid(ledgerId: string): Promise<MutationResult> {
    return withRateLimit(`markLedgerPaid:${ledgerId}`, async () => {
        if (isDemoMode()) { await delay(300); return ok(undefined); }
        try {
            const db = requireSupabase();

            // 1. Update ledger status='paid', paid_at=now()
            const { data: led, error } = await db
                .from('ledger')
                .update({ status: 'paid', paid_at: new Date().toISOString() })
                .eq('id', ledgerId)
                .select('*, membership:memberships(*, pool:pools(*))')
                .single();

            if (error) return fail(error.message);

            // 2. Notify pool owner (self-reported payment — flagged for future Stripe verification)
            const { data: { user } } = await db.auth.getUser();
            const username = user?.user_metadata?.name || 'Someone';

            await db.from('notifications').insert({
                user_id: (led as any).membership.pool.owner_id,
                type: 'payment_received',
                title: 'Payment received 💸',
                body: `${username} marked payment as sent — please verify.`,
                action_url: '/ledger'
            });

            return ok(undefined);
        } catch (e) { return fail((e as Error).message); }
    });
}

// ─── Rating mutations ─────────────────────────────────────────────────────────

export function submitRating(
    poolId: string,
    raterId: string,
    ratedId: string,
    score: number,
    review: string | null,
    options?: { allowDemoFallback?: boolean },
): Promise<MutationResult<{ ratingId: string }>> {
    return withRateLimit(`submitRating:${raterId}:${poolId}`, async () => {
        if (isDemoMode(options?.allowDemoFallback ?? false)) {
            await delay(350);
            return ok({ ratingId: `rating-mock-${Date.now()}` });
        }
        try {
            const { data, error } = await requireSupabase()
                .from('ratings')
                .insert({ pool_id: poolId, rater_id: raterId, rated_id: ratedId, score, review })
                .select('id').single();
            if (error) return fail(error.message);
            return ok({ ratingId: (data as { id: string }).id });
        } catch (e) { return fail((e as Error).message); }
    });
}

