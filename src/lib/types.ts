// ─── SubPool — Domain Type Definitions ────────────────────────────────────────
// IMPORTANT: Field names match the Supabase DB schema exactly.
// See supabase/schema.sql and migrations/ for the source of truth.

// ─── Pool ─────────────────────────────────────────────────────────────────────

export type PoolStatus = 'open' | 'full' | 'closed';
export type PoolCategory = 'entertainment' | 'work' | 'productivity' | 'ai';

export interface PlatformPricing {
  platform_id: string;
  platform_name: string;
  plan_name: string;
  currency: string;
  official_price: number;
  max_slots: number;
}

export interface Pool {
  id: string;
  owner_id: string;
  owner?: Profile;            // joined via owner_id → profiles
  platform: string;           // DB column: "platform" (e.g. "netflix")
  plan_name: string;
  total_cost?: number;        // DB column (numeric)
  total_slots: number;        // DB column: "total_slots"
  filled_slots: number;       // DB column: "filled_slots"
  price_per_slot: number;     // DB column (numeric)
  category: PoolCategory;
  status: PoolStatus;
  billing_cycle?: 'monthly' | 'yearly';
  description?: string | null;
  auto_approve?: boolean;
  created_at: string;
  updated_at?: string;
}

// Convenience aliases for code that still uses old field names
// (these helpers let us avoid changing every component at once)

/** @deprecated Use pool.platform */
export function getPoolPlatformId(pool: Pool): string {
  return (pool as any).platform_id ?? pool.platform;
}

/** @deprecated Use pool.total_slots */
export function getPoolSlotsTotal(pool: Pool): number {
  return (pool as any).slots_total ?? pool.total_slots ?? 0;
}

/** @deprecated Use pool.filled_slots */
export function getPoolSlotsFilled(pool: Pool): number {
  return (pool as any).slots_filled ?? pool.filled_slots ?? 0;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string;
  display_name?: string | null;   // migration-added column
  avatar_url?: string | null;     // DB column
  avatar_color?: string;          // migration-added, default '#C8F135'
  bio?: string | null;
  rating: number;                 // 0–5
  rating_count?: number;          // DB column
  review_count?: number;          // migration-added alias
  is_verified?: boolean;          // migration-added
  is_pro?: boolean;               // migration-added
  plan?: 'free' | 'pro' | 'host_plus';
  total_hosted?: number;          // P2.2: trust score calculation
  disputes?: number;              // P2.2: trust score calculation
  avg_response_time_mins?: number;// P2.2: trust score calculation
  onboarding_completed?: boolean;
  onboarding_step?: number;
  onboarding_role?: 'host' | 'joiner' | null;
  referral_code?: string | null;
  created_at: string;             // DB column (was "joined_at" in old TS)
}

// ─── Membership (a user's slot in a pool) ─────────────────────────────────────

export type MembershipStatus = 'active' | 'pending' | 'cancelled' | 'expired' | 'removed';

export interface Membership {
  id: string;
  pool_id: string;
  pool: Pool;                    // embedded via join
  user_id: string;
  user?: Profile;                // joined via user_id
  status: MembershipStatus;
  price_per_slot: number;        // numeric in DB
  joined_at: string;
  created_at: string;
  next_billing_at?: string | null;   // migration-added
  billing_anchor_day?: number;       // migration-added, 1–28
  cancelled_at?: string | null;      // migration-added
}

// ─── Ledger Entry ─────────────────────────────────────────────────────────────
// DB schema: id, membership_id, amount (numeric), due_date, status, paid_at, created_at
// The UI needs enriched data (pool name, counterparty, etc.) which is derived
// by joining with memberships → pools → profiles in the hook layer.

export type LedgerStatus = 'owed' | 'paid';

/** Raw ledger row as stored in the DB */
export interface LedgerRow {
  id: string;
  membership_id: string;
  amount: number;                // numeric(10,2) in DB
  due_date: string;              // date
  status: LedgerStatus;
  paid_at: string | null;
  created_at: string;
}

/** Enriched ledger entry used by the UI (computed in the hook layer) */
export interface LedgerEntry {
  id: string;
  membership_id: string;
  pool_id: string;
  pool_name: string;
  platform: string;              // platform ID
  platform_emoji: string;
  counterparty_id: string;
  counterparty_name: string;
  counterparty_initials: string;
  counterparty_color: string;
  type: 'payment' | 'payout' | 'refund';
  status: LedgerStatus | 'pending' | 'overdue';
  amount_cents: number;          // amount * 100 for UI
  due_at: string;
  settled_at: string | null;
  note: string | null;
}

// ─── Join Request ─────────────────────────────────────────────────────────────

export type JoinRequestStatus = 'pending' | 'approved' | 'rejected';

export interface JoinRequest {
  id: string;
  pool_id: string;
  pool?: Pool;
  requester_id: string;
  requester?: Profile;
  status: JoinRequestStatus;
  message: string | null;
  created_at: string;
}

// ─── Message ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  pool_id: string;
  sender_id: string;
  sender?: Profile;
  content: string;
  read_at?: string | null;      // P3-34 Read Receipts
  read_by?: string[] | null;
  created_at: string;
}

// ─── Notification ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: string;                 // DB: text not null (e.g. 'info', 'success', etc.)
  icon?: string;                // migration-added, optional emoji
  title: string;
  body: string;
  read: boolean;
  action_url?: string | null;
  source_id?: string | null;
  source_type?: string | null;
  created_at: string;
}

// ─── Rating ───────────────────────────────────────────────────────────────────

export interface Rating {
  id: string;
  rater_id: string;             // DB column name
  rated_id: string;             // DB column name
  pool_id: string;
  score: 1 | 2 | 3 | 4 | 5;
  review?: string | null;       // DB column name (was "comment")
  created_at: string;
}

// ─── Wishlist Request ─────────────────────────────────────────────────────────
// Maps to the wishlist_requests table (migration-created)

export type WishlistUrgency = 'low' | 'medium' | 'high';
export type WishlistStatus = 'open' | 'fulfilled' | 'expired' | 'cancelled';

export interface WishlistRequest {
  id: string;
  user_id: string;
  user?: Profile;               // joined
  platform: string;
  budget_max: number;
  urgency: WishlistUrgency;
  status: WishlistStatus;
  created_at: string;
}

// ─── Waitlist Entry ──────────────────────────────────────────────────────────
// Maps to the pool_waitlist table

export type WaitlistStatus = 'waiting' | 'notified' | 'joined' | 'expired' | 'cancelled';

export interface WaitlistEntry {
  id: string;
  pool_id: string;
  pool?: Pool;                 // joined
  user_id: string;
  user?: Profile;              // joined
  position: number;
  status: WaitlistStatus;
  joined_at: string;
  notified_at?: string | null;
  created_at: string;
}

// ─── Subscription Detail ──────────────────────────────────────────────────────

export interface PaymentRecord {
  id: string;
  amount_cents: number;
  status: 'paid' | 'owed' | 'overdue' | 'pending';
  due_at: string;
  settled_at: string | null;
}

export type RenewalStatus = 'active' | 'renewing_soon' | 'overdue' | 'expiring' | 'cancelled';

export interface SubscriptionDetail {
  membership: Membership;
  platform: { id: string; name: string; icon: string; color: string; bg: string; };
  planPricing: { official_price: number; currency: string; } | null;
  renewalStatus: RenewalStatus;
  daysUntilRenewal: number | null;
  billingCycle: 'monthly' | 'yearly';
  totalPaid: number;
  savingsVsRetail: number;
  paymentHistory: PaymentRecord[];
  lastPaymentAt: string | null;
  memberSince: string;
}

// ─── Utility ──────────────────────────────────────────────────────────────────

/** Convenience: derive slot count from a Pool */
export function slotsRemaining(pool: Pool): number {
  return (pool.total_slots ?? 0) - (pool.filled_slots ?? 0);
}

/** Format cents → "$4.99" */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
