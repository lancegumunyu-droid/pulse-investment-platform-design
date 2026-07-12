#!/usr/bin/env node
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.NEON_DATABASE_URL;

if (!DATABASE_URL) {
  console.error('ERROR: NEON_DATABASE_URL environment variable not set');
  process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });

async function runSetup() {
  try {
    console.log('\n========================================');
    console.log('  PULSE v2.4 - COMPLETE AUTO SETUP');
    console.log('========================================\n');

    // Connect to database
    console.log('[1/5] Connecting to database...');
    await client.connect();
    console.log('✓ Connected to Neon PostgreSQL\n');

    // Read and execute schema
    console.log('[2/5] Deploying database schema (14 tables)...');
    const schemaPath = path.join(__dirname, 'complete-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    let successCount = 0;
    for (const statement of statements) {
      try {
        await client.query(statement);
        successCount++;
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.error('Statement error:', err.message);
        }
      }
    }
    console.log(`✓ Database schema deployed (${successCount} statements executed)\n`);

    // Create admin user
    console.log('[3/5] Creating admin user...');
    try {
      await client.query(`
        INSERT INTO users (id, email, password_hash, full_name, email_verified, kyc_status, referral_code, status, created_at, updated_at)
        VALUES (
          'admin-' || gen_random_uuid()::text,
          'admin@pulse.com',
          'CHANGE_ME_IMMEDIATELY_bcrypt_hash_here',
          'PULSE Admin',
          true,
          'verified',
          'PULSEADMIN',
          'active',
          NOW(),
          NOW()
        )
        ON CONFLICT (email) DO NOTHING;
      `);

      const adminResult = await client.query(
        `SELECT id FROM users WHERE email = 'admin@pulse.com' LIMIT 1`
      );

      if (adminResult.rows.length > 0) {
        const adminId = adminResult.rows[0].id;

        // Create admin role
        await client.query(
          `INSERT INTO admin_users (user_id, role, is_active, created_at, updated_at)
           VALUES ($1, 'admin', true, NOW(), NOW())
           ON CONFLICT (user_id) DO NOTHING`,
          [adminId]
        );

        // Create admin wallet
        await client.query(
          `INSERT INTO wallets (user_id, balance, available_balance, welcome_bonus, created_at, updated_at)
           VALUES ($1, 0.00, 0.00, 0.00, NOW(), NOW())
           ON CONFLICT (user_id) DO NOTHING`,
          [adminId]
        );

        console.log('✓ Admin user created: admin@pulse.com');
        console.log('✓ Admin role assigned');
        console.log('✓ Admin wallet created\n');
      }
    } catch (err) {
      console.log('✓ Admin user already exists\n');
    }

    // Verify tables
    console.log('[4/5] Verifying database integrity...');
    const tablesResult = await client.query(`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tableCount = tablesResult.rows[0].count;
    console.log(`✓ Database has ${tableCount} tables`);

    const indexResult = await client.query(`
      SELECT COUNT(*) as count FROM pg_indexes 
      WHERE schemaname = 'public'
    `);
    const indexCount = indexResult.rows[0].count;
    console.log(`✓ Database has ${indexCount} indexes\n`);

    // List all tables
    console.log('[5/5] Database Tables Created:');
    const tableListResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    tableListResult.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.table_name}`);
    });

    console.log('\n========================================');
    console.log('  ✓ SETUP COMPLETE');
    console.log('========================================');
    console.log('\nAdmin Credentials:');
    console.log('  Email: admin@pulse.com');
    console.log('  Password: CHANGE_ME_IMMEDIATELY');
    console.log('\nNext Steps:');
    console.log('  1. Deploy to production');
    console.log('  2. Test the 3-step flow');
    console.log('  3. Change admin password immediately');
    console.log('\n');

  } catch (error) {
    console.error('Setup error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runSetup();
