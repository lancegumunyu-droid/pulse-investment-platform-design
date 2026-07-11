# PULSE INVESTMENT PLATFORM - Setup & Deployment Guide

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/lancegumunyu-droid/pulse-investment-platform-design.git
cd pulse-investment-platform-design
```

### 2. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env.local` and fill in your Supabase credentials:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SUPABASE_JWT_SECRET=your_jwt_secret
POSTGRES_URL=your_postgres_url
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=pulse
POSTGRES_HOST=localhost
```

### 4. Run Locally
```bash
pnpm dev
# or
npm run dev
```

Visit http://localhost:3000 to start using PULSE locally.

## Features

✅ User signup with 50 USDT PULSE tokens
✅ Email confirmation workflow
✅ Forgot password & password reset
✅ Admin approval system (3 roles)
✅ KYC document processing
✅ P2P float agent system
✅ PULSE token calculator
✅ Deposit/withdrawal system
✅ Tier management
✅ Complete audit logging
✅ Enterprise security

## Project Structure

```
pulse-investment-platform-design/
├── app/                           # Next.js App Router
│   ├── auth/                      # Authentication pages
│   ├── admin/                     # Admin dashboard
│   ├── api/                       # API routes
│   └── app/                       # Main application
├── components/
│   ├── pulse/                     # PULSE-specific components
│   ├── ui/                        # Generic UI components
├── lib/
│   ├── supabase/                  # Supabase client & server
│   ├── security.ts                # Security validators
│   └── password-validator.ts      # Password strength checker
├── migrations/                    # Database migrations
├── .env.example                   # Environment template
└── package.json                   # Dependencies
```

## Admin Credentials

### Chief Admin
- Email: `admin@pulse.com`
- Password: `PulseAdmin@2024!Secure`
- Float: $1M USD + 2M PULSE

### Approval Manager
- Email: `manager@pulse.com`
- Password: `Manager@Pulse#2024Secure`
- Float: $500K USD + 1M PULSE

### KYC Reviewers (8 Total)
- Email: `kyc1@pulse.com` - `kyc8@pulse.com`
- Password: `KYC@Reviewer#2024Pulse`

## Database Setup

### Create Database
```sql
-- Run in Supabase SQL Editor
CREATE DATABASE pulse;
```

### Import Schema
Run the migration file in Supabase:
```bash
# All migrations are in migrations/ folder
# Run each .sql file in Supabase SQL Editor
```

## Authentication Flow

### User Signup
1. User signs up with email/password
2. 50 USDT PULSE tokens credited
3. Confirmation email sent
4. User confirms email
5. Status: "Pending Admin Approval"

### Admin Approval
1. Admin reviews user
2. Clicks "Approve"
3. User gains full dashboard access

### KYC Process
1. User uploads ID + Address
2. KYC Reviewer reviews documents
3. KYC approved
4. Tokens unlocked
5. Deposits/Withdrawals enabled

## Security

- Password strength validation (8+ chars, mixed case, numbers, symbols)
- Email-based password reset (24hr expiry)
- Rate limiting on sensitive actions
- SQL injection prevention
- XSS protection
- CSRF protection
- Session management
- Row-level security (RLS)
- Audit logging

## Forgot Password Flow

1. User clicks "Forgot password?" on login
2. Enters email address
3. Receives reset link (valid 24 hours)
4. Clicks link to verify email
5. Creates new password
6. Can now login with new password

## Deployment to Vercel

### 1. Connect GitHub
```bash
git remote add origin https://github.com/your-username/pulse-investment-platform-design.git
git push -u origin main
```

### 2. Deploy to Vercel
```bash
vercel
# Follow prompts to connect project
```

### 3. Set Environment Variables
In Vercel dashboard:
- Go to Settings → Environment Variables
- Add all variables from `.env.example`
- Redeploy

## API Endpoints

### Authentication
- POST `/api/auth/signup` - User signup
- POST `/api/auth/login` - User login
- POST `/api/auth/logout` - User logout
- POST `/api/auth/forgot-password` - Send reset link
- POST `/api/auth/reset-password` - Set new password

### Admin
- POST `/api/admin/approve-user` - Approve user
- POST `/api/admin/reject-user` - Reject user
- POST `/api/admin/allocate-float` - Allocate float to agent

### KYC
- POST `/api/kyc/upload` - Upload KYC documents
- GET `/api/kyc/pending` - Get pending reviews
- POST `/api/kyc/approve` - Approve KYC

## Troubleshooting

### Supabase Configuration Error
- Verify `.env.local` has correct values
- Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
- Restart dev server

### Build Errors
- Run `pnpm install` to ensure all dependencies
- Clear `.next` folder: `rm -rf .next`
- Rebuild: `pnpm build`

### Database Connection Issues
- Verify POSTGRES_URL is correct
- Check database user permissions
- Ensure database is running

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create new issue with details
3. Include error logs and steps to reproduce

## License

MIT - See LICENSE file for details

## Contributors

- Lance Gumunyu (Developer)
- Manus AI (v0 platform)

---

**PULSE Investment Platform - Built for Africa's Future** 🚀
