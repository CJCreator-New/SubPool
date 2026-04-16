-- Phase 1 reconciliation pass.
-- This migration is intentionally idempotent and only closes gaps left by earlier drift.

-- pools: missing fields + soft delete/search support
ALTER TABLE public.pools
    ADD COLUMN IF NOT EXISTS category text,
    ADD COLUMN IF NOT EXISTS auto_approve boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS description text,
    ADD COLUMN IF NOT EXISTS search_vector tsvector,
    ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- profiles: avatar and trust-score scaffolding
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS avatar_color text DEFAULT '#C8F135',
    ADD COLUMN IF NOT EXISTS total_hosted integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS disputes integer DEFAULT 0,
    ADD COLUMN IF NOT EXISTS avg_response_time_mins integer;

-- wishlist requests
CREATE TABLE IF NOT EXISTS public.wishlist_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    platform text NOT NULL,
    budget_max numeric,
    urgency text CHECK (urgency IN ('low', 'medium', 'high')),
    status text DEFAULT 'open',
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.wishlist_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlist_read" ON public.wishlist_requests;
CREATE POLICY "wishlist_read" ON public.wishlist_requests
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "wishlist_own_insert" ON public.wishlist_requests;
CREATE POLICY "wishlist_own_insert" ON public.wishlist_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlist_own_update" ON public.wishlist_requests;
CREATE POLICY "wishlist_own_update" ON public.wishlist_requests
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlist_own_delete" ON public.wishlist_requests;
CREATE POLICY "wishlist_own_delete" ON public.wishlist_requests
    FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_requests_user_id ON public.wishlist_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_requests_status ON public.wishlist_requests(status);

-- full-text search on pools
CREATE OR REPLACE FUNCTION public.update_pools_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.platform, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.plan_name, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(NEW.category, '')), 'C') ||
        setweight(to_tsvector('english', coalesce(NEW.description, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_pools_search_vector ON public.pools;
DROP TRIGGER IF EXISTS tr_pools_search_vector ON public.pools;
DROP TRIGGER IF EXISTS trg_pools_search_vector_update ON public.pools;

CREATE TRIGGER update_pools_search_vector
BEFORE INSERT OR UPDATE ON public.pools
FOR EACH ROW EXECUTE FUNCTION public.update_pools_search_vector();

UPDATE public.pools
SET search_vector =
    setweight(to_tsvector('english', coalesce(platform, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(plan_name, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(category, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'D')
WHERE search_vector IS NULL;

DROP INDEX IF EXISTS public.idx_pools_search;
DROP INDEX IF EXISTS public.idx_pools_search_vector;
CREATE INDEX idx_pools_search_vector ON public.pools USING gin (search_vector);

-- memberships uniqueness + RLS
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.memberships
    DROP CONSTRAINT IF EXISTS unique_pool_member;

ALTER TABLE public.memberships
    ADD CONSTRAINT unique_pool_member UNIQUE (pool_id, user_id);

DROP POLICY IF EXISTS "Users can view their own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Pool owners can view all memberships for their pool" ON public.memberships;
DROP POLICY IF EXISTS "Users can join pools" ON public.memberships;
DROP POLICY IF EXISTS "Pool owners can approve/reject memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can cancel their own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Users can delete pending or cancelled memberships" ON public.memberships;

CREATE POLICY "Users can view their own memberships" ON public.memberships
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Pool owners can view all memberships for their pool" ON public.memberships
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.pools
            WHERE pools.id = memberships.pool_id
            AND pools.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can join pools" ON public.memberships
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
        AND status = 'pending'
    );

CREATE POLICY "Pool owners can approve/reject memberships" ON public.memberships
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.pools
            WHERE pools.id = memberships.pool_id
            AND pools.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can cancel their own memberships" ON public.memberships
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete pending or cancelled memberships" ON public.memberships
    FOR DELETE USING (
        auth.uid() = user_id
        AND status IN ('pending', 'cancelled')
    );

-- profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles are readable by everyone" ON public.profiles;
CREATE POLICY "Profiles are readable by everyone" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- pools owner-only update/delete
DROP POLICY IF EXISTS "Users can update their own pools" ON public.pools;
CREATE POLICY "Users can update their own pools" ON public.pools
    FOR UPDATE USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Users can delete their own open pools" ON public.pools;
CREATE POLICY "Users can delete their own open pools" ON public.pools
    FOR DELETE USING (auth.uid() = owner_id);

-- sender_id hardening
ALTER TABLE public.messages
    ALTER COLUMN sender_id SET DEFAULT auth.uid(),
    ALTER COLUMN sender_id SET NOT NULL;

DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;
DROP POLICY IF EXISTS "messages_insert" ON public.messages;
CREATE POLICY "messages_insert" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND (
            auth.uid() = (
                SELECT owner_id
                FROM public.pools
                WHERE pools.id = messages.pool_id
            )
            OR EXISTS (
                SELECT 1
                FROM public.memberships
                WHERE memberships.pool_id = messages.pool_id
                AND memberships.user_id = auth.uid()
                AND memberships.status = 'active'
            )
        )
    );

-- soft delete helper
CREATE OR REPLACE FUNCTION public.soft_delete_pool(pool_uuid uuid)
RETURNS void AS $$
BEGIN
    UPDATE public.pools
    SET deleted_at = now(),
        status = 'closed'
    WHERE id = pool_uuid
    AND owner_id = auth.uid();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Not authorized to delete pool';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
