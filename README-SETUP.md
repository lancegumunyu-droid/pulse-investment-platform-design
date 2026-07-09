# Pulse Investment Platform - Setup Guide

## Integration Overview
This project is now configured with:
- ✅ **Supabase** - Backend database and MCP server
- ✅ **Vercel** - Deployment and branch preview environments
- ✅ **GitHub** - Version control and PR automation

---

## 1. Configure MCP Server

### Option A: Command Line
```bash
copilot mcp add --transport http supabase "https://mcp.supabase.com/mcp?project_ref=hcuzmgdijdwvbozelwce&read_only=true&features=branching%2Cdevelopment%2Cdebugging%2Cdatabase%2Caccount%2Cdocs%2Cfunctions"
```

### Option B: Manual Configuration
The MCP config is already in `.copilot/mcp-config.json`

### Authenticate MCP
```bash
copilot -i /mcp
```

---

## 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Then add:
```
NEXT_PUBLIC_SUPABASE_URL=https://hcuzmgdijdwvbozelwce.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 3. Vercel Branch Deployment Setup

### Branch Strategy
- **`main`** → Production deployment
- **`staging`** → Staging preview
- **`v0/*`** → Development previews (auto-cleaned on merge)

### Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect `vercel.json` configuration
4. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`

### Preview on Pull Requests
Each PR to `main` will automatically get a preview deployment URL.

---

## 4. Database Integration

The project uses `lib/supabase.ts` for database operations:

```typescript
import { supabase } from '@/lib/supabase'

// Example: Fetch data
const { data, error } = await supabase
  .from('your_table')
  .select('*')
  .limit(10)
```

---

## 5. Development Workflow

### Local Development
```bash
npm install
npm run dev
```

### Create a Feature Branch
```bash
git checkout -b v0/your-feature-name
```

This automatically creates a preview on Vercel.

### Push and Create PR
```bash
git push origin v0/your-feature-name
```

Then create a PR to `main` via GitHub.

---

## 6. Install Agent Skills (Optional)

For better AI-assisted development with Supabase:

```bash
npx skills add supabase/agent-skills
```

---

## 7. Troubleshooting

### Database Connection Issues
Check the connection with:
```typescript
import { checkDatabaseConnection } from '@/lib/supabase'

const status = await checkDatabaseConnection()
console.log(status)
```

### Vercel Deployment Failed
1. Check build logs in Vercel dashboard
2. Ensure all environment variables are set
3. Verify `vercel.json` is in the repo root

### MCP Server Connection
- Ensure you've run `copilot -i /mcp`
- Check MCP config in `.copilot/mcp-config.json`
- Verify your Supabase project reference is correct

---

## Support
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Copilot Docs](https://docs.github.com/en/copilot)
