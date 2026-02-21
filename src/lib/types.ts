// ─── SubPool — Domain Type Definitions ────────────────────────────────────────

// ─── Pool ─────────────────────────────────────────────────────────────────────

export type PoolStatus = 'open' | 'full' | 'closed';
export type PoolCategory = 'entertainment' | 'work' | 'productivity' | 'ai';

export interface Pool {
  id: string;
  platform_id: string;
  owner_id: string;
  owner: Profile;          // embedded for list views
  category: PoolCategory;
  status: PoolStatus;
  plan_name: string;
  price_per_slot: number;           // USD cents
  slots_total: number;
  slots_filled: number;
  auto_approve: boolean;
  description: string | null;
  created_at: string;           // ISO 8601
  updated_at: string;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  avatar_color: string;                 // hex
  is_verified: boolean;
  is_pro: boolean;
  rating: number;                 // 0–5
  review_count: number;
  joined_at: string;
  bio: string | null;
}

// ─── Membership (a user's slot in a pool) ─────────────────────────────────────

export type MembershipStatus = 'active' | 'pending' | 'cancelled' | 'expired';

export interface Membership {
  id: string;
  pool_id: string;
  pool: Pool;           // embedded
  user_id: string;
  status: MembershipStatus;
  price_per_slot: number;         // USD cents (locked at join time)
  joined_at: string;
  next_billing_at: string | null;
  billing_anchor_day: number;         // 1–28
  cancelled_at: string | null;
}

// ─── Ledger Entry ─────────────────────────────────────────────────────────────

export type LedgerType = 'payment' | 'payout' | 'refund';
export type LedgerStatus = 'owed' | 'paid' | 'pending' | 'overdue';

export interface LedgerEntry {
  id: string;
  pool_id: string;
  pool_name: string;
  platform_emoji: string;
  counterparty_id: string;
  counterparty_name: string;
  counterparty_initials: string;
  counterparty_color: string;
  type: LedgerType;
  status: LedgerStatus;
  amount_cents: number;
  due_at: string;
  settled_at: string | null;
  note: string | null;
}

// ─── Join Request ─────────────────────────────────────────────────────────────

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface JoinRequest {
  id: string;
  pool_id: string;
  pool: Pool;
  requester_id: string;
  requester: Profile;
  status: JoinRequestStatus;
  message: string | null;
  created_at: string;
  resolved_at: string | null;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export type NotificationType = 'info' | 'success' | 'warning' | 'danger';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  icon: string;             // emoji
  title: string;
  body: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

// ─── Rating ───────────────────────────────────────────────────────────────────

export interface Rating {
  id: string;
  pool_id: string;
  reviewer_id: string;
  reviewee_id: string;
  score: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  created_at: string;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Convenience: derive slot count from a Pool */
export function slotsRemaining(pool: Pool): number {
  return pool.slots_total - pool.slots_filled;
}

/** Format cents → "$4.99" */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
