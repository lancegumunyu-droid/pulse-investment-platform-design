-- PULSE v2.4 - Admin-Only Restrictions Update
-- Restrict all deposits and withdrawals to require admin approval
-- No money can leave the system without admin authorization

-- ============================================================================
-- ALTER DEPOSITS TABLE - Add admin approval fields
-- ============================================================================

ALTER TABLE deposits ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE deposits ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE deposits ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE deposits ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES users(id);
ALTER TABLE deposits ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
ALTER TABLE deposits ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ============================================================================
-- ALTER WITHDRAWALS TABLE - Add admin approval fields
-- ============================================================================

ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES users(id);
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP;
ALTER TABLE withdrawals ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_deposits_approval_status ON deposits(approval_status);
CREATE INDEX IF NOT EXISTS idx_deposits_user_id ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_created_at ON deposits(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_withdrawals_approval_status ON withdrawals(approval_status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);

-- ============================================================================
-- CREATE AUDIT TRIGGER FOR DEPOSITS
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_deposit_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.approval_status = 'approved' AND OLD.approval_status = 'pending' THEN
    INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, created_at)
    VALUES (
      NEW.approved_by,
      'approve_deposit',
      'deposit',
      NEW.id,
      'Deposit of $' || NEW.amount || ' approved',
      NOW()
    );
  ELSIF NEW.approval_status = 'rejected' AND OLD.approval_status = 'pending' THEN
    INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, created_at)
    VALUES (
      NEW.rejected_by,
      'reject_deposit',
      'deposit',
      NEW.id,
      'Deposit of $' || NEW.amount || ' rejected: ' || COALESCE(NEW.rejection_reason, 'No reason'),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF NOT EXISTS trigger_audit_deposit_approval ON deposits;
CREATE TRIGGER trigger_audit_deposit_approval
AFTER UPDATE ON deposits
FOR EACH ROW
EXECUTE FUNCTION audit_deposit_approval();

-- ============================================================================
-- CREATE AUDIT TRIGGER FOR WITHDRAWALS
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_withdrawal_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.approval_status = 'approved' AND OLD.approval_status = 'pending' THEN
    INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, created_at)
    VALUES (
      NEW.approved_by,
      'approve_withdrawal',
      'withdrawal',
      NEW.id,
      'Withdrawal of $' || NEW.amount || ' approved',
      NOW()
    );
  ELSIF NEW.approval_status = 'rejected' AND OLD.approval_status = 'pending' THEN
    INSERT INTO audit_logs (admin_id, action, entity_type, entity_id, details, created_at)
    VALUES (
      NEW.rejected_by,
      'reject_withdrawal',
      'withdrawal',
      NEW.id,
      'Withdrawal of $' || NEW.amount || ' rejected: ' || COALESCE(NEW.rejection_reason, 'No reason'),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF NOT EXISTS trigger_audit_withdrawal_approval ON withdrawals;
CREATE TRIGGER trigger_audit_withdrawal_approval
AFTER UPDATE ON withdrawals
FOR EACH ROW
EXECUTE FUNCTION audit_withdrawal_approval();

-- ============================================================================
-- SET ALL EXISTING DEPOSITS/WITHDRAWALS TO PENDING APPROVAL
-- ============================================================================

UPDATE deposits SET approval_status = 'pending' WHERE approval_status IS NULL;
UPDATE withdrawals SET approval_status = 'pending' WHERE approval_status IS NULL;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify admin-only restrictions are in place:
SELECT 'Deposits pending admin approval' as status, COUNT(*) as count FROM deposits WHERE approval_status = 'pending';
SELECT 'Approved deposits' as status, COUNT(*) as count FROM deposits WHERE approval_status = 'approved';
SELECT 'Rejected deposits' as status, COUNT(*) as count FROM deposits WHERE approval_status = 'rejected';

SELECT 'Withdrawals pending admin approval' as status, COUNT(*) as count FROM withdrawals WHERE approval_status = 'pending';
SELECT 'Approved withdrawals' as status, COUNT(*) as count FROM withdrawals WHERE approval_status = 'approved';
SELECT 'Rejected withdrawals' as status, COUNT(*) as count FROM withdrawals WHERE approval_status = 'rejected';
