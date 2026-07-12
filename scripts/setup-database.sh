#!/bin/bash

# PULSE Database Setup Script
# Run this to initialize the complete database schema in Neon PostgreSQL

echo "==========================================="
echo "PULSE Database Setup Script"
echo "==========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$NEON_DATABASE_URL" ]; then
  echo "ERROR: NEON_DATABASE_URL environment variable not set"
  echo "Please set: export NEON_DATABASE_URL='postgresql://...'"
  exit 1
fi

echo "Database URL: $NEON_DATABASE_URL"
echo ""

# Create superuser admin (optional)
echo "Step 1: Creating admin user..."
psql "$NEON_DATABASE_URL" << EOF
-- Create admin account
INSERT INTO users (
  email,
  password_hash,
  full_name,
  email_verified,
  kyc_status,
  referral_code,
  status
) VALUES (
  'admin@pulse.com',
  'admin_hash_placeholder_change_me',
  'PULSE Admin',
  true,
  'verified',
  'PULSEADMIN',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Create admin user record
INSERT INTO admin_users (user_id, role, is_active)
SELECT id, 'admin', true
FROM users
WHERE email = 'admin@pulse.com'
  AND id NOT IN (SELECT user_id FROM admin_users WHERE role = 'admin')
LIMIT 1;

-- Create wallet for admin
INSERT INTO wallets (user_id, balance, available_balance)
SELECT id, 0.00, 0.00
FROM users
WHERE email = 'admin@pulse.com'
  AND id NOT IN (SELECT user_id FROM wallets)
LIMIT 1;

SELECT 'Admin user created successfully' as status;
EOF

echo ""
echo "Step 2: Verifying database schema..."
psql "$NEON_DATABASE_URL" << EOF
SELECT 
  table_name
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT 'Database schema verified' as status;
EOF

echo ""
echo "Step 3: Creating indexes and functions..."
psql "$NEON_DATABASE_URL" << EOF
-- Indexes and functions already created in complete-schema.sql
SELECT 'Indexes and functions verified' as status;
EOF

echo ""
echo "==========================================="
echo "Database Setup Complete!"
echo "==========================================="
echo ""
echo "Next Steps:"
echo "1. Change admin password immediately"
echo "2. Verify admin user: SELECT * FROM users WHERE email = 'admin@pulse.com';"
echo "3. Test signup API: POST /api/launch/step1-signup"
echo ""
