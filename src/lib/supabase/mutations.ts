// ─── Supabase Mutations ────────────────────────────────────────────────────────
// Write operations with mock-mode support.
// When Supabase is not connected, mutations resolve successfully so the UI
// (toasts, state updates) works without any env setup.

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

/** Approve a join request. */
export async function approveRequest(
    requestId: string,
): Promise<MutationResult> {
    if (!isSupabaseConnected || !supabase) return ok(undefined);

    try {
        // 0. Fetch request details
        const { data: req, error: reqErr } = await supabase!
            .from('join_requests')
            .select('*, pool:pools(*)')
            .eq('id', requestId)
            .single();

        if (reqErr || !req) return fail('Request not found');

        // 1. Update join_request status='approved'
        const { error: upErr } = await supabase!
            .from('join_requests')
            .update({ status: 'approved' })
            .eq('id', requestId);
        if (upErr) return fail(upErr.message);

        // 2. Insert membership (status='active')
        const { data: mem, error: memErr } = await supabase!
            .from('memberships')
            .insert({
                pool_id: req.pool_id,
                user_id: req.requester_id,
                status: 'active',
                price_per_slot: req.pool.price_per_slot
            })
            .select('id').single();
        if (memErr) return fail(memErr.message);

        // 3. Increment pool filled_slots
        const newFilledSlots = req.pool.filled_slots + 1;
        const newStatus = newFilledSlots >= req.pool.total_slots ? 'full' : 'open';

        await supabase!
            .from('pools')
            .update({
                filled_slots: newFilledSlots,
                status: newStatus
            })
            .eq('id', req.pool_id);

        // 5. Insert ledger entry (due at end of month)
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextMonth.setDate(1); // Next month's 1st

        await supabase!.from('ledger').insert({
            membership_id: mem.id,
            amount: req.pool.price_per_slot,
            due_date: nextMonth.toISOString().split('T')[0],
            status: 'owed'
        });

        // 6. Insert notification for requester
        await supabase!.from('notifications').insert({
            user_id: req.requester_id,
            type: 'request_approved',
            title: 'Request approved! 🎉',
            body: `You're in the ${req.pool.platform} pool`,
            action_url: '/my-pools'
        });

        return ok(undefined);
    } catch (e) { return fail((e as Error).message); }
}

/** Create a new pool listing. */
export async function createPool(
    input: Omit<Pool, 'id' | 'owner' | 'created_at' | 'updated_at' | 'slots_filled'>,
): Promise<MutationResult<{ poolId: string }>> {
    if (!isSupabaseConnected || !supabase) {
        await delay(600);
        const newId = `pool-mock-${Date.now()}`;
        return ok({ poolId: newId });
    }
    try {
        const { data, error } = await supabase!
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
    if (!isSupabaseConnected || !supabase) { await delay(300); return ok(undefined); }
    try {
        const { error } = await supabase!
            .from('pools').update({ status }).eq('id', poolId);
        return error ? fail(error.message) : ok(undefined);
    } catch (e) { return fail((e as Error).message); }
}

// ─── Profile mutations ───────────────────────────────────────────────────────

/** Update profile fields. */
export async function updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, 'display_name' | 'bio' | 'avatar_color' | 'is_pro'>>,
): Promise<MutationResult> {
    if (!isSupabaseConnected || !supabase) { await delay(400); return ok(undefined); }
    try {
        const { error } = await supabase!.from('profiles').update(updates).eq('id', userId);
        return error ? fail(error.message) : ok(undefined);
    } catch (e) { return fail((e as Error).message); }
}

// ─── Notification mutations ───────────────────────────────────────────────────

export async function markNotificationRead(id: string): Promise<MutationResult> {
    if (!isSupabaseConnected || !supabase) { await delay(150); return ok(undefined); }
    try {
        const { error } = await supabase!.from('notifications').update({ read: true }).eq('id', id);
        return error ? fail(error.message) : ok(undefined);
    } catch (e) { return fail((e as Error).message); }
}

export async function markAllNotificationsRead(userId: string): Promise<MutationResult> {
    if (!isSupabaseConnected || !supabase) { await delay(200); return ok(undefined); }
    try {
        const { error } = await supabase!
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
    if (!isSupabaseConnected || !supabase) {
        await delay(250);
        return ok({ messageId: `msg-mock-${Date.now()}` });
    }
    try {
        const { data, error } = await supabase!
            .from('messages')
            .insert({ thread_id: threadId, sender_id: senderId, body })
            .select('id').single();
        if (error) return fail(error.message);

        await supabase!.from('threads')
            .update({ last_message: body, last_message_at: new Date().toISOString() }).eq('id', threadId);
        return ok({ messageId: (data as { id: string }).id });
    } catch (e) { return fail((e as Error).message); }
}

// ─── Ledger mutations ─────────────────────────────────────────────────────────

export async function markLedgerPaid(ledgerId: string): Promise<MutationResult> {
    if (!isSupabaseConnected || !supabase) { await delay(300); return ok(undefined); }
    try {
        // 1. Update ledger status='paid', paid_at=now()
        const { data: led, error } = await supabase!
            .from('ledger')
            .update({ status: 'paid', paid_at: new Date().toISOString() })
            .eq('id', ledgerId)
            .select('*, membership:memberships(*, pool:pools(*))')
            .single();

        if (error) return fail(error.message);

        // 2. Insert notification for pool owner
        const { data: { user } } = await supabase!.auth.getUser();
        const username = user?.user_metadata?.name || 'Someone';

        await supabase!.from('notifications').insert({
            user_id: (led as any).membership.pool.owner_id,
            type: 'payment_received',
            title: 'Payment received 💸',
            body: `${username} marked ${(led as any).amount} as sent`,
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
    if (!isSupabaseConnected || !supabase) {
        await delay(350);
        return ok({ ratingId: `rating-mock-${Date.now()}` });
    }
    try {
        const { data, error } = await supabase!
            .from('ratings')
            .insert({ pool_id: poolId, rater_id: raterId, rated_id: ratedId, score, review })
            .select('id').single();
        if (error) return fail(error.message);
        return ok({ ratingId: (data as { id: string }).id });
    } catch (e) { return fail((e as Error).message); }
}
