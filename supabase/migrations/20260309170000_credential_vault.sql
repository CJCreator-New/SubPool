-- P2.1: Credential Vault Schema

CREATE TABLE IF NOT EXISTS credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
    encrypted_data TEXT NOT NULL,
    nonce TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(pool_id)
);

ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;

-- Owner can manage
CREATE POLICY "owner_can_manage_credentials" ON credentials
FOR ALL
USING (EXISTS (SELECT 1 FROM pools WHERE id = pool_id AND owner_id = auth.uid()));

-- Active members can view
CREATE POLICY "members_can_view_credentials" ON credentials
FOR SELECT
USING (EXISTS (SELECT 1 FROM memberships WHERE pool_id = credentials.pool_id AND user_id = auth.uid() AND status = 'active'));
