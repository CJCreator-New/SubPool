-- ─── P3-38: Ledger Audit Logging ──────────────────────────────────────────
-- Tracks every update to the ledger for transparency and debugging.

CREATE TABLE IF NOT EXISTS ledger_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ledger_id UUID NOT NULL,
    old_status TEXT,
    new_status TEXT,
    old_amount NUMERIC(10,2),
    new_amount NUMERIC(10,2),
    changed_by UUID DEFAULT auth.uid(),
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- RLS — only pool owners or the member involved can see audit logs for that row
ALTER TABLE ledger_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_read" ON ledger_audit FOR SELECT
  USING (
    EXISTS (
        SELECT 1 FROM ledger l
        JOIN memberships m ON m.id = l.membership_id
        JOIN pools p ON p.id = m.pool_id
        WHERE l.id = ledger_audit.ledger_id
        AND (m.user_id = auth.uid() OR p.owner_id = auth.uid())
    )
  );

-- Function to record the change
CREATE OR REPLACE FUNCTION record_ledger_audit() RETURNS trigger AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status OR OLD.amount IS DISTINCT FROM NEW.amount) THEN
        INSERT INTO ledger_audit (ledger_id, old_status, new_status, old_amount, new_amount)
        VALUES (NEW.id, OLD.status, NEW.status, OLD.amount, NEW.amount);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS trg_ledger_audit ON ledger;
CREATE TRIGGER trg_ledger_audit
    AFTER UPDATE ON ledger
    FOR EACH ROW EXECUTE PROCEDURE record_ledger_audit();
