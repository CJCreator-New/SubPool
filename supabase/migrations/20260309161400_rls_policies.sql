-- P1.2 Complete RLS Policy Audit & Fixes

-- 1. POOLS RLS
-- UPDATE: Only pool owner can update their own pool
DROP POLICY IF EXISTS "Users can update their own pools" ON pools;
CREATE POLICY "Users can update their own pools" ON pools
    FOR UPDATE USING (auth.uid() = owner_id);

-- DELETE: Only the pool owner can delete, AND only if pool status is 'open'
DROP POLICY IF EXISTS "Users can delete their own open pools" ON pools;
CREATE POLICY "Users can delete their own open pools" ON pools
    FOR DELETE USING (auth.uid() = owner_id AND status = 'open');


-- 2. MEMBERSHIPS RLS
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;

-- SELECT: User can see their own memberships OR pool owner can see all memberships for their pool
DROP POLICY IF EXISTS "Users can view their own memberships" ON memberships;
CREATE POLICY "Users can view their own memberships" ON memberships
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pool owners can view all memberships for their pool" ON memberships;
CREATE POLICY "Pool owners can view all memberships for their pool" ON memberships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pools WHERE pools.id = memberships.pool_id AND pools.owner_id = auth.uid()
        )
    );

-- INSERT: Authenticated user can only insert where user_id = auth.uid() AND status forced to 'pending'
DROP POLICY IF EXISTS "Users can join pools" ON memberships;
CREATE POLICY "Users can join pools" ON memberships
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND status = 'pending'
    );

-- UPDATE: Only pool owner can change membership status. Members can only cancel their own.
DROP POLICY IF EXISTS "Pool owners can approve/reject memberships" ON memberships;
CREATE POLICY "Pool owners can approve/reject memberships" ON memberships
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM pools WHERE pools.id = memberships.pool_id AND pools.owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can cancel their own memberships" ON memberships;
CREATE POLICY "Users can cancel their own memberships" ON memberships
    FOR UPDATE USING (
        auth.uid() = user_id AND status = 'cancelled'
    );
    
-- DELETE: User can delete their own membership if status='pending' or 'cancelled' only
DROP POLICY IF EXISTS "Users can delete pending or cancelled memberships" ON memberships;
CREATE POLICY "Users can delete pending or cancelled memberships" ON memberships
    FOR DELETE USING (
        auth.uid() = user_id AND status IN ('pending', 'cancelled')
    );

-- 3. PROFILES RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: All authenticated users can read all profiles
DROP POLICY IF EXISTS "Profiles are readable by everyone" ON profiles;
CREATE POLICY "Profiles are readable by everyone" ON profiles
    FOR SELECT USING (true);

-- UPDATE: Users can only update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- INSERT: Handled by Auth trigger, deny direct inserts
-- Only IF inserting hasn't been blocked yet
DROP POLICY IF EXISTS "No direct inserts to profiles" ON profiles;
CREATE POLICY "No direct inserts to profiles" ON profiles
    FOR INSERT WITH CHECK (false);

-- 4. CONSTRAINT
ALTER TABLE memberships 
    DROP CONSTRAINT IF EXISTS unique_pool_member;
ALTER TABLE memberships 
    ADD CONSTRAINT unique_pool_member UNIQUE (pool_id, user_id);
