-- Migration: Add Pool Sessions for Time-Based Sharing
-- Target: Support platforms with concurrency limits (e.g., Midjourney, Canva Pro)

CREATE TABLE IF NOT EXISTS public.pool_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID REFERENCES public.pools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraint: No overlapping sessions for the same pool
    CONSTRAINT no_overlapping_sessions EXCLUDE USING gist (
        pool_id WITH =,
        tstzrange(start_at, end_at) WITH &&
    )
);

-- RLS Policies
ALTER TABLE public.pool_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view sessions"
ON public.pool_sessions FOR SELECT
USING (true);

CREATE POLICY "Pool members can book sessions"
ON public.pool_sessions FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.memberships
        WHERE pool_id = pool_sessions.pool_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
);

CREATE POLICY "Users can cancel their own sessions"
ON public.pool_sessions FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (status = 'cancelled');

-- Add trigger to update platform status if hardware/session required
COMMENT ON TABLE public.pool_sessions IS 'Tracks time-slot bookings for exclusive access nodes.';
