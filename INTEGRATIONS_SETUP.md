## PULSE Integrations Setup Guide

**Custom Prefix:** `PULSE_`
**Date Created:** July 12, 2026
**Version:** 2.3 - Full Integration Mode

---

## Integrated Services

### 1. Database: Neon PostgreSQL

**Status:** Active
**Prefix:** `NEON_`
**URLs Created:**
- `NEON_DATABASE_URL` (primary - pooled connections)
- `NEON_DATABASE_URL_UNPOOLED` (edge functions)
- `NEON_POSTGRES_PRISMA_URL` (Prisma ORM)

**Configuration Files:**
- `/lib/db/neon-client.ts` - Database connection manager
- Uses pooled connections for Vercel Edge Runtime

**Key Variables:**
```
NEON_POSTGRES_HOST=ep-dark-forest-ahe2wcme-pooler.c-3.us-east-1.aws.neon.tech
NEON_DATABASE_URL=postgresql://...
NEON_POSTGRES_URL=postgresql://...
NEON_PGHOST=ep-dark-forest-ahe2wcme-pooler.c-3.us-east-1.aws.neon.tech
```

**Usage in Code:**
```typescript
import { sql } from '@/lib/db/neon-client'

// Execute queries
const result = await sql`SELECT * FROM users WHERE id = ${userId}`
```

---

### 2. Authentication: Clerk (Primary)

**Status:** Active
**Prefix:** `CLERK_`
**Configuration:**

**Public (Safe for Frontend):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (use in frontend)

**Secret (Backend Only):**
- `CLERK_SECRET_KEY` (never expose)

**Configuration Files:**
- `/lib/auth/auth-integrations.ts` - Auth provider manager

**Usage:**
```typescript
import { getClerkConfig, getAuthProvider } from '@/lib/auth/auth-integrations'

const provider = getAuthProvider() // returns 'clerk'
const config = getClerkConfig()
```

---

### 3. Authentication: Auth0 (Fallback)

**Status:** Configured but Secondary
**Prefix:** `AUTH0_`
**Variables:**
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_DOMAIN`
- `AUTH0_SECRET`

**When Used:** If Clerk is unavailable

---

### 4. Email Service: AgentMail

**Status:** Active
**Prefix:** `AGENTMAIL_`
**API Key:** `AGENTMAIL_API_KEY`

**Configuration Files:**
- `/lib/email/email-client.ts` - Email service integration

**Features:**
- KYC verification emails
- Welcome bonus notifications
- Referral invitations
- Deposit/Withdrawal confirmations

**Usage:**
```typescript
import { getEmailClient } from '@/lib/email/email-client'

const emailClient = getEmailClient()
await emailClient.sendVerificationEmail(email, verificationLink)
await emailClient.sendWelcomeBonusEmail(email, 35)
await emailClient.sendReferralEmail(email, referralLink, referrerName)
```

---

### 5. AI Gateway

**Status:** Active
**API Key:** `AI_GATEWAY_API_KEY`
**Used For:** AI features (optional)

---

## Environment Variable Reference

### Database (NEON_)

| Variable | Type | Required | Example |
|----------|------|----------|---------|
| `NEON_DATABASE_URL` | URL | ✓ | `postgresql://user:pass@host/db` |
| `NEON_DATABASE_URL_UNPOOLED` | URL | ✓ | `postgresql://user:pass@host/db` |
| `NEON_POSTGRES_PRISMA_URL` | URL | Optional | `postgresql://...` |
| `NEON_PGHOST` | String | ✓ | `ep-dark-forest...pooler.c-3.us-east-1.aws.neon.tech` |
| `NEON_PGUSER` | String | ✓ | `neondb_owner` |
| `NEON_PGPASSWORD` | String | ✓ | `npg_...` |
| `NEON_PGDATABASE` | String | ✓ | `neondb` |

### Authentication (CLERK_)

| Variable | Type | Required | Use |
|----------|------|----------|-----|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | String | ✓ | Frontend - safe to expose |
| `CLERK_SECRET_KEY` | String | ✓ | Backend only - keep secret |

### Email (AGENTMAIL_)

| Variable | Type | Required | Use |
|----------|------|----------|-----|
| `AGENTMAIL_API_KEY` | String | ✓ | Send emails via AgentMail |

---

## Integration Status Check

**Endpoint:** `GET /api/integrations/status`
**Auth:** Bearer token required

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-07-12T10:30:00Z",
  "validation": {
    "allConfigured": true,
    "errors": []
  },
  "services": {
    "database": {
      "service": "Neon PostgreSQL",
      "status": "healthy",
      "connected": true
    },
    "authentication": {
      "provider": "clerk",
      "configured": true
    },
    "email": {
      "service": "AgentMail",
      "configured": true
    }
  }
}
```

---

## How to Set Up Environment Variables

### Step 1: In Vercel Dashboard

1. Go to **Project Settings** → **Environment Variables**
2. Add each variable with the correct value
3. Ensure variables are available in:
   - `Production` environment
   - `Preview` environment
   - `Development` environment

### Step 2: Verify Integration

Run integration status check:
```bash
curl -X GET https://your-app.com/api/integrations/status \
  -H "Authorization: Bearer YOUR_ADMIN_KEY"
```

### Step 3: Test Each Service

**Test Database:**
```bash
curl -X GET https://your-app.com/api/health
```

**Test Authentication:**
Check that Clerk is working in login flow

**Test Email:**
Sign up and verify email is received

---

## Custom Prefix: PULSE_

The custom prefix `PULSE_` is used to namespace PULSE-specific configuration.

**In Code:**
```typescript
import { INTEGRATION_CONFIG } from '@/lib/pulse/integrations-config'

// Access any integration
const dbUrl = INTEGRATION_CONFIG.database.urls.pooled
const authProvider = INTEGRATION_CONFIG.auth.keys.publishableKey
const emailKey = INTEGRATION_CONFIG.email.keys.apiKey
```

---

## Validation & Error Handling

All integrations are validated on startup:

```typescript
import { validateIntegrations } from '@/lib/pulse/integrations-config'

const { valid, errors } = validateIntegrations()
if (!valid) {
  console.error('Integration errors:', errors)
}
```

**Common Errors:**
- `Database not configured` - Missing NEON_DATABASE_URL
- `Authentication not configured` - Missing Clerk keys
- `Email service not configured` - Missing AGENTMAIL_API_KEY

---

## Production Deployment Checklist

Before deploying to production:

- [ ] All NEON_ variables set in Vercel
- [ ] CLERK_ variables set in Vercel
- [ ] AGENTMAIL_API_KEY set in Vercel
- [ ] Database connection tested
- [ ] Email service tested
- [ ] Authentication flow tested
- [ ] Integration status check passes
- [ ] No error logs on startup

---

## Local Development

Copy environment variables to `.env.development.local`:

```bash
NEON_DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
AGENTMAIL_API_KEY=am_us_...
```

Then restart dev server:
```bash
npm run dev
```

---

## Support

For integration issues:

1. Check `/api/integrations/status` endpoint
2. Review error messages in logs
3. Verify all ENV variables are set
4. Test connection to each service independently
5. Check Vercel environment variables page

---

## File Reference

| File | Purpose |
|------|---------|
| `lib/pulse/integrations-config.ts` | Central integration config |
| `lib/db/neon-client.ts` | Database connection manager |
| `lib/auth/auth-integrations.ts` | Auth provider manager |
| `lib/email/email-client.ts` | Email service client |
| `app/api/integrations/status/route.ts` | Status check endpoint |

---

**Last Updated:** July 12, 2026
**Status:** Production Ready
**Integration Level:** Complete
