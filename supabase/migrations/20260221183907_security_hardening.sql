-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Security Hardening  (2026-02-21)
-- Fixes:
--   B1 — Restrict notifications INSERT policy (was open to all authenticated users)
--   B2 — Atomic slot-count increment via DB function (no more race conditions)
--   B3 — Wrap approve_join_request in a single ACID transaction
--   Bonus — Add missing index on join_requests(pool_id, status)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── B1: Fix notifications INSERT policy ──────────────────────────────────────
-- The old policy `with check (true)` let any authenticated user insert a
-- notification for ANY user_id, enabling spam/phishing.
-- New policy: only allow inserts where the calling user IS the recipient.
-- Server-side inserts (Edge Functions using service_role key) bypass RLS
-- entirely, so they are unaffected.

drop policy if exists "notifs_insert_service" on notifications;

create policy "notifs_own_insert"
  on notifications
  for insert
  with check (auth.uid() = user_id);

-- ── B2 + B3: Atomic approve_join_request RPC ─────────────────────────────────
-- All steps run inside a single transaction with explicit locking.
-- Returns a JSON result so the client knows what happened.
--
-- Steps:
--   1. Lock the join_request row for update
--   2. Guard: already approved?
--   3. Lock the pool row FOR UPDATE — prevents concurrent slot increment race
--   4. Guard: pool full?
--   5. Mark join_request approved
--   6. Insert membership
--   7. Atomic slot increment + status flip  (filled_slots + 1)
--   8. Insert ledger entry (due = 1st of next month)
--   9. Insert notification for requester
-- Notifications to the pool owner are sent by the client after the RPC
-- succeeds (as they are not critical-path).

create or replace function approve_join_request(p_request_id uuid)
returns json
language plpgsql
security definer   -- runs with owner's rights so it can bypass row-level checks
                   -- for internal consistency while still honouring caller auth
as $$
declare
  v_req         join_requests%rowtype;
  v_pool        pools%rowtype;
  v_mem_id      uuid;
  v_due_date    date;
  v_new_filled  integer;
  v_new_status  text;
begin
  -- 1. Fetch & lock the request
  select * into v_req
    from join_requests
   where id = p_request_id
     for update;

  if not found then
    return json_build_object('ok', false, 'error', 'Request not found');
  end if;

  -- 2. Guard: idempotency — already approved?
  if v_req.status = 'approved' then
    return json_build_object('ok', false, 'error', 'Request already approved');
  end if;

  -- Only the pool owner can call this
  select * into v_pool
    from pools
   where id = v_req.pool_id
     for update;  -- 3. Lock pool row — prevents concurrent race condition

  if v_pool.owner_id <> auth.uid() then
    return json_build_object('ok', false, 'error', 'Not authorized');
  end if;

  -- 4. Guard: pool full?
  if v_pool.filled_slots >= v_pool.total_slots then
    return json_build_object('ok', false, 'error', 'Pool is already full');
  end if;

  -- 5. Mark request approved
  update join_requests
     set status = 'approved'
   where id = p_request_id;

  -- 6. Insert membership
  insert into memberships (pool_id, user_id, status, price_per_slot)
  values (v_req.pool_id, v_req.requester_id, 'active', v_pool.price_per_slot)
  returning id into v_mem_id;

  -- 7. Atomic slot increment (no stale read possible — pool row is locked)
  v_new_filled := v_pool.filled_slots + 1;
  v_new_status := case when v_new_filled >= v_pool.total_slots then 'full' else 'open' end;

  update pools
     set filled_slots = v_new_filled,
         status       = v_new_status
   where id = v_req.pool_id;

  -- 8. Insert ledger entry (due on 1st of next month)
  v_due_date := date_trunc('month', now())::date + interval '1 month';

  insert into ledger (membership_id, amount, due_date, status)
  values (v_mem_id, v_pool.price_per_slot, v_due_date, 'owed');

  -- 9. Notify the requester that they were approved
  insert into notifications (user_id, type, title, body, action_url)
  values (
    v_req.requester_id,
    'request_approved',
    'You''re in! 🎉',
    'Your join request was approved — check My Pools.',
    '/my-pools'
  );

  return json_build_object(
    'ok',           true,
    'membership_id', v_mem_id,
    'new_status',   v_new_status,
    'filled_slots', v_new_filled
  );

exception
  when others then
    -- Any error rolls back the whole transaction automatically
    return json_build_object('ok', false, 'error', sqlerrm);
end;
$$;

-- Grant execute to authenticated users (owner check is inside the function)
grant execute on function approve_join_request(uuid) to authenticated;

-- ── Bonus: Missing index on join_requests ────────────────────────────────────
-- Common query: "fetch all pending requests for my pool"
create index if not exists idx_join_requests_pool_status
  on join_requests(pool_id, status);
