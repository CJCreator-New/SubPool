// ─── Supabase Mutations ────────────────────────────────────────────────────────
// Write operations with mock-mode support.
// When Supabase is not connected AND we are in demo/dev mode, mutations resolve
// optimistically so the UI can be exercised without env setup.
// In production (VITE_SUPABASE_URL is set) a null client is a hard error.

import { supabase, isSupabaseConnected } from './client';
import { MOCK_POOLS, CURRENT_USER, MOCK_MEMBERSHIPS } from '../mock-data';
import type { Pool, Profile, Membership } from '../types';
import { getPlatform } from '../constants';

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
 * A missing URL means dev mode; a configured URL means production → never mock.
 */
function isDemoMode(): boolean {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (!url) return true; // no env var at all → local development, mock is fine
    if (url.includes('placeholder') || url.includes('your_url') || url.includes('your_supabase')) return true;
    return false; // real URL configured → never silently mock
}

/** Ensures Supabase is available; throws a user-visible error in production. */
function requireSupabase(): NonNullable<typeof supabase> {
    if (supabase) return supabase;
    throw new Error(
        'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
}

// ─── Pool mutations ───────────────────────────────────────────────────────────

/** Request to join a pool slot. */
export async function joinPool(
    poolId: string,
    userId: string,
    message?: string,
): Promise<MutationResult<{ requestId: string }>> {
    const isMock = !isSupabaseConnected || !supabase || (import.meta as any).env.VITE_SUPABASE_URL?.includes('placeholder');

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
}

/** Approve a join request.
 *  Delegates to the `approve_join_request` Postgres RPC which runs the entire
 *  flow (status update, membership insert, atomic slot increment, ledger entry,
 *  requester notification) inside a single ACID transaction.
 *  This eliminates the previous race condition on filled_slots.
 */
export async function approveRequest(
    requestId: string,
): Promise<MutationResult> {
    if (isDemoMode()) { await delay(600); return ok(undefined); }

    try {
        const db = requireSupabase();
        const { data, error } = await db.rpc('approve_join_request', {
            p_request_id: requestId,
        });

        if (error) return fail(error.message);

        // The RPC returns { ok: boolean, error?: string, ... }
        const result = data as { ok: boolean; error?: string };
        if (!result.ok) return fail(result.error ?? 'Approval failed');

        return ok(undefined);
    } catch (e) { return fail((e as Error).message); }
}

/** Create a new pool listing. */
export async function createPool(
    input: Omit<Pool, 'id' | 'owner' | 'created_at' | 'updated_at' | 'slots_filled'>,
): Promise<MutationResult<{ poolId: string }>> {
    if (isDemoMode()) {
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
        return ok({ poolId: (data as { id: string }).id });
    } catch (e) { return fail((e as Error).message); }
}

/** Change pool status. */
export async function updatePoolStatus(
    poolId: string,
    status: 'open' | 'full' | 'closed',
): Promise<MutationResult> {
    if (isDemoMode()) { await delay(300); return ok(undefined); }
    try {
        const { error } = await requireSupabase()
            .from('pools').update({ status }).eq('id', poolId);
        return error ? fail(error.message) : ok(undefined);
    } catch (e) { return fail((e as Error).message); }
}

// ─── Profile mutations ───────────────────────────────────────────────────────

/**
 * Update safe profile fields.
 * NOTE: `is_pro` is intentionally excluded — elevation to Pro must happen
 * server-side (e.g., via a Stripe webhook) to prevent self-promotion.
 */
export async function updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, 'display_name' | 'bio' | 'avatar_color'>>,
): Promise<MutationResult> {
    if (isDemoMode()) { await delay(400); return ok(undefined); }
    try {
        const { error } = await requireSupabase().from('profiles').update(updates).eq('id', userId);
        return error ? fail(error.message) : ok(undefined);
    } catch (e) { return fail((e as Error).message); }
}

// ─── Notification mutations ───────────────────────────────────────────────────

export async function markNotificationRead(id: string): Promise<MutationResult> {
    if (isDemoMode()) { await delay(150); return ok(undefined); }
    try {
        const { error } = await requireSupabase().from('notifications').update({ read: true }).eq('id', id);
        return error ? fail(error.message) : ok(undefined);
    } catch (e) { return fail((e as Error).message); }
}

export async function markAllNotificationsRead(userId: string): Promise<MutationResult> {
    if (isDemoMode()) { await delay(200); return ok(undefined); }
    try {
        const { error } = await requireSupabase()
            .from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
        return error ? fail(error.message) : ok(undefined);
    } catch (e) { return fail((e as Error).message); }
}

// ─── Message mutations ────────────────────────────────────────────────────────

export async function sendMessage(
    threadId: string,
    senderId: string,
    body: string,
): Promise<MutationResult<{ messageId: string }>> {
    if (isDemoMode()) {
        await delay(250);
        return ok({ messageId: `msg-mock-${Date.now()}` });
    }
    try {
        const db = requireSupabase();
        const { data, error } = await db
            .from('messages')
            .insert({ thread_id: threadId, sender_id: senderId, body })
            .select('id').single();
        if (error) return fail(error.message);

        await db.from('threads')
            .update({ last_message: body, last_message_at: new Date().toISOString() }).eq('id', threadId);
        return ok({ messageId: (data as { id: string }).id });
    } catch (e) { return fail((e as Error).message); }
}

// ─── Ledger mutations ─────────────────────────────────────────────────────────

export async function markLedgerPaid(ledgerId: string): Promise<MutationResult> {
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
}

// ─── Rating mutations ─────────────────────────────────────────────────────────

export async function submitRating(
    poolId: string,
    raterId: string,
    ratedId: string,
    score: number,
    review: string | null,
): Promise<MutationResult<{ ratingId: string }>> {
    if (isDemoMode()) {
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
}
