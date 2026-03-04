-- supabase/migrations/20260221_stripe_fields.sql
-- Adds Stripe-related columns needed for real payment processing.

-- Store the Stripe Customer ID on the profile so we can reuse
-- saved payment methods across multiple Checkout Sessions.
alter table profiles
    add column if not exists stripe_customer_id text;

-- Store the Stripe PaymentIntent / Session ID on each ledger entry
-- so we can cross-reference payments and handle refunds.
alter table ledger
    add column if not exists stripe_session_id text,
    add column if not exists stripe_payment_intent_id text;

-- Index to look up a ledger entry by session ID quickly (webhook use-case).
create index if not exists idx_ledger_stripe_session
    on ledger (stripe_session_id)
    where stripe_session_id is not null;
