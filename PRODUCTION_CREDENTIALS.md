# PULSE PRODUCTION CREDENTIALS & REFERENCE

## Production Domain
```
https://pulseinvestme.com
```

## Admin Login

### Credentials
```
Email: admin@pulse-invest.app
Password: [Generate a secure 32-character password]
```

### How to Generate Secure Password
```bash
openssl rand -base64 32
# Example output: a7K9mN2xQ8vL5pR3tW1bS4cF6jH9dG2E
```

**Add to Vercel Environment Variables:**
```
PULSE_ADMIN_EMAIL=admin@pulse-invest.app
PULSE_ADMIN_PASSWORD=a7K9mN2xQ8vL5pR3tW1bS4cF6jH9dG2E
```

### Admin Portal Access
- URL: `https://pulseinvestme.com/admin/login`
- Functions:
  - Approve/reject new user signups
  - View all user profiles
  - Monitor deposit/withdrawal requests
  - Set user limits
  - View audit logs
  - Generate reports

---

## API Key for Backend Services

### ADMIN_API_KEY
```bash
openssl rand -base64 32
# Example: X9mK3pL7vQ2wR5tY8nB1cF4dG6hJ9sP0
```

**Add to Vercel Environment Variables:**
```
ADMIN_API_KEY=X9mK3pL7vQ2wR5tY8nB1cF4dG6hJ9sP0
```

**Used for:**
- Server-to-server requests
- Webhook signatures
- Internal API calls

---

## Supabase Configuration

### Public Keys (Frontend Safe)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Private Keys (Server Only - KEEP SECRET)
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=your_jwt_secret_here
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Webhook Secret
```
SUPABASE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```
**Get from:** Supabase → Authentication → Hooks → Copy Webhook Secret

---

## Cloudflare Turnstile CAPTCHA

### Site ID (Frontend)
```
NEXT_PUBLIC_TURNSTILE_SITE_ID=0xyour_site_id_here
```

**Get from:** Cloudflare Dashboard → Turnstile → Your Site

### How It Works
- Shows on signup form: `/auth/sign-up`
- Users complete CAPTCHA challenge
- Token passed to Supabase: `options.captchaToken`
- Prevents spam signups + rate limiting

---

## Test Accounts

### Create Test Accounts
1. Go to `https://pulseinvestme.com/auth/sign-up`
2. Complete signup with test email
3. Verify email from inbox
4. Account created automatically

### Example Test Account
```
Email: testuser@example.com
Password: TestPassword123!@#
```

---

## OAuth & Social Login (Optional Future)

If you add OAuth providers later:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
```

---

## Email Service Configuration

### For Resend (Recommended)
```
RESEND_API_KEY=re_xxxxxxxxxxxx
```

### For SendGrid
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
```

### For SMTP
```
EMAIL_USER=your@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

## Database Backup Credentials

### Supabase Backup
- **Automatic:** Supabase backs up daily (free plan: 7 days retention)
- **Manual:** Export from Supabase Dashboard → Database → Backups

### Connection String (if needed)
```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

---

## SSL/TLS Certificate

### Auto-Issued by Vercel
```
Domain: pulseinvestme.com
Provider: Cloudflare
Status: Auto-renewed (no manual action needed)
```

### Manual Check
```bash
# Verify SSL certificate
openssl s_client -connect pulseinvestme.com:443

# Check expiration
curl -I https://pulseinvestme.com | grep -i "date"
```

---

## Monitoring & Alerts

### Vercel Monitoring
- URL: https://vercel.com/dashboard
- Check: Deployment logs, error tracking, analytics
- Alerts: Set up email alerts for failed deployments

### Supabase Monitoring
- URL: https://app.supabase.com
- Check: Auth events, database logs, real-time activity
- Alerts: Set up for quota warnings

### Cloudflare Monitoring
- URL: https://dash.cloudflare.com
- Check: DDoS attacks blocked, SSL status, analytics
- Alerts: Set up for security events

---

## Disaster Recovery

### If Website Goes Down
1. Check Vercel deployment logs
2. Check Supabase service status
3. Check Cloudflare DNS resolution
4. Roll back to previous deployment if needed

### If Database is Compromised
1. Go to Supabase → Database → Backups
2. Restore from latest clean backup
3. Review audit logs for suspicious activity

### If CAPTCHA Stops Working
1. Verify Turnstile Site ID matches env var
2. Check Cloudflare Turnstile site is still active
3. Regenerate if needed: Cloudflare → Turnstile → Settings

---

## Security Best Practices

1. **Never commit secrets to GitHub**
   - Use .env.local for local development
   - Use Vercel Environment Variables for production

2. **Rotate credentials regularly**
   - Admin passwords: every 90 days
   - API keys: every 6 months
   - Supabase service role key: when staff changes

3. **Monitor access logs**
   - Supabase: Check auth events
   - Vercel: Check deployment activity
   - Cloudflare: Check security events

4. **Enable 2FA**
   - Vercel account
   - Supabase account
   - Cloudflare account
   - Email account

---

## Support & Help

### Vercel Support
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Status: https://www.vercel-status.com

### Supabase Support
- Dashboard: https://app.supabase.com
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com

### Cloudflare Support
- Dashboard: https://dash.cloudflare.com
- Docs: https://developers.cloudflare.com
- Status: https://www.cloudflarestatus.com

---

**All credentials are sensitive. Store securely and never share in public repositories.**
