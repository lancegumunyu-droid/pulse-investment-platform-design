export type TierId = 'starter' | 'growth' | 'builder' | 'leader' | 'ambassador'

export interface Tier {
  id: TierId
  name: string
  minInvest: number
  yieldLabel: string
  yieldLow: number
  yieldHigh: number
  perks: string[]
  highlight?: boolean
}

// Tiers are unlocked purely by the amount an investor allocates.
// They are NOT tied to recruiting other people.
export const TIERS: Tier[] = [
  {
    id: 'starter',
    name: 'Starter',
    minInvest: 75,
    yieldLabel: '11–13% target',
    yieldLow: 11,
    yieldHigh: 13,
    perks: ['Access to entry-level project shares', 'Monthly performance reports', 'Standard support'],
  },
  {
    id: 'growth',
    name: 'Growth',
    minInvest: 150,
    yieldLabel: '13–16% target',
    yieldLow: 13,
    yieldHigh: 16,
    perks: ['All Starter benefits', 'Diversified project basket', 'Quarterly strategy briefings'],
  },
  {
    id: 'builder',
    name: 'Builder',
    minInvest: 300,
    yieldLabel: '15–18% target',
    yieldLow: 15,
    yieldHigh: 18,
    perks: ['All Growth benefits', 'Early access to new projects', 'Priority support'],
    highlight: true,
  },
  {
    id: 'leader',
    name: 'Leader',
    minInvest: 750,
    yieldLabel: '17–20% target',
    yieldLow: 17,
    yieldHigh: 20,
    perks: ['All Builder benefits', 'Dedicated portfolio review', 'Reduced platform fees'],
  },
  {
    id: 'ambassador',
    name: 'Ambassador',
    minInvest: 1500,
    yieldLabel: '19–22% target',
    yieldLow: 19,
    yieldHigh: 22,
    perks: ['All Leader benefits', 'Governance weighting', 'Invitations to project site visits'],
  },
]

export function tierForAmount(totalInvested: number): Tier {
  let current = TIERS[0]
  for (const t of TIERS) {
    if (totalInvested >= t.minInvest) current = t
  }
  return current
}

export function nextTier(current: TierId): Tier | null {
  const idx = TIERS.findIndex((t) => t.id === current)
  return idx >= 0 && idx < TIERS.length - 1 ? TIERS[idx + 1] : null
}

export type ProjectSector = 'Renewable Energy' | 'Mining Royalties' | 'Agriculture' | 'Infrastructure'

export interface Project {
  id: string
  name: string
  country: string
  sector: ProjectSector
  targetYield: string
  funded: number
  goal: number
  risk: 'Lower' | 'Moderate' | 'Higher'
  summary: string
}

export const PROJECTS: Project[] = [
  {
    id: 'kalahari-solar',
    name: 'Kalahari Solar Field',
    country: 'Botswana',
    sector: 'Renewable Energy',
    targetYield: '12–15%',
    funded: 742_000,
    goal: 1_000_000,
    risk: 'Lower',
    summary: '85 MW solar installation with a 20-year power purchase agreement with the national utility.',
  },
  {
    id: 'copperbelt-royalty',
    name: 'Copperbelt Royalty Note',
    country: 'Zambia',
    sector: 'Mining Royalties',
    targetYield: '16–20%',
    funded: 410_000,
    goal: 750_000,
    risk: 'Higher',
    summary: 'Revenue royalty on an operating copper concession. Returns track commodity prices and output.',
  },
  {
    id: 'zambezi-agri',
    name: 'Zambezi Valley Agri',
    country: 'Zimbabwe',
    sector: 'Agriculture',
    targetYield: '10–14%',
    funded: 288_000,
    goal: 500_000,
    risk: 'Moderate',
    summary: 'Irrigated macadamia and citrus estate with offtake contracts to EU distributors.',
  },
  {
    id: 'maputo-logistics',
    name: 'Maputo Logistics Hub',
    country: 'Mozambique',
    sector: 'Infrastructure',
    targetYield: '13–16%',
    funded: 560_000,
    goal: 900_000,
    risk: 'Moderate',
    summary: 'Warehousing and cold-chain facility serving the Maputo port corridor.',
  },
]

export interface Signal {
  id: string
  projectId: string
  title: string
  window: string
  detail: string
  targetYield: string
  urgency: 'New' | 'Closing soon' | 'Open'
}

export const SIGNALS: Signal[] = [
  {
    id: 'sig-1',
    projectId: 'kalahari-solar',
    title: 'Kalahari Solar — Phase 2 allocation',
    window: 'Closes in 6 days',
    detail: 'Utility signed an expanded PPA. Phase 2 shares are opening at the same entry terms as Phase 1.',
    targetYield: '12–15%',
    urgency: 'New',
  },
  {
    id: 'sig-2',
    projectId: 'copperbelt-royalty',
    title: 'Copperbelt Royalty — higher output quarter',
    window: 'Closes in 2 days',
    detail: 'Mine reported a production uplift. Royalty note has limited remaining allocation this quarter.',
    targetYield: '16–20%',
    urgency: 'Closing soon',
  },
  {
    id: 'sig-3',
    projectId: 'maputo-logistics',
    title: 'Maputo Hub — cold-chain expansion',
    window: 'Open',
    detail: 'New anchor tenant signed a 7-year lease, improving the projected occupancy profile.',
    targetYield: '13–16%',
    urgency: 'Open',
  },
]

// $PULSE is the platform's ecosystem token used for staking and governance.
export const TOKEN = {
  symbol: 'PULSE',
  salePrice: 0.08,
  bonusPct: 35,
  stakingApy: 24.8,
}

export const RISK_DISCLAIMER =
  "Disclaimer: Investing involves substantial risk and is not suitable for every investor. The information provided on this platform is for educational and informational purposes only. There are no guarantees of profit nor of avoiding losses when investing. Each individual's results depend on their unique circumstances and numerous other factors. Any past performance, hypothetical or otherwise, is not indicative of future results. You should fully understand the risks and seek advice from a qualified financial advisor before investing."

On Thu, 23 Jul 2026 at 11:48, Samkelisiwe Chiliza <samkelisiwechiliza2@gmail.com> wrote:
Settled via NOWPayments in production · simulated here

Past performance is not indicative of future results. Yields are variable and depend on real project performance — investments carry risk of loss. This is a product demonstration and does not process real funds.


On Thu, 23 Jul 2026 at 11:30 AM, Lance Gumunyu <lancegumunyu@gmail.com> wrote:
10:55:57.428 Running build in Washington, D.C., USA (East) – iad1
10:55:57.428 Build machine configuration: 2 cores, 8 GB
10:55:57.532 Cloning github.com/lancegumunyu-droid/pulse-investment-platform-design (Branch: main, Commit: 76e8279)
10:55:58.245 Cloning completed: 712.000ms
10:55:58.557 Restored build cache from previous deployment (B6vp6ztTTWEtFXyG9RTLbuCa6e9R)
10:55:58.837 Running "vercel build"
10:55:58.854 Vercel CLI 56.5.0
10:55:59.081 Detected `pnpm-lock.yaml` 9 which may be generated by pnpm@9.x or pnpm@10.x
10:55:59.082 Using pnpm@10.x based on project creation date
10:55:59.082 To use pnpm@9.x, manually opt in using corepack (https://vercel.com/docs/deployments/configure-a-build#corepack)
10:55:59.109 Installing dependencies...
10:55:59.645 Lockfile is up to date, resolution step is skipped
10:55:59.782 Already up to date
10:55:59.956 
10:55:59.968 ╭ Warning ─────────────────────────────────────────────────────────────────────╮
10:55:59.969 │ │
10:55:59.969 │ Ignored build scripts: msw@2.14.6, sharp@0.34.5. │
10:55:59.969 │ Run "pnpm approve-builds" to pick which dependencies should be allowed │
10:55:59.969 │ to run scripts. │
10:55:59.969 │ │
10:55:59.969 ╰──────────────────────────────────────────────────────────────────────────────╯
10:55:59.973 Done in 833ms using pnpm v10.28.0
10:55:59.985 Detected Next.js version: 16.2.6
10:56:00.000 Running "pnpm run build"
10:56:00.284 
10:56:00.285 > my-project@0.1.0 build /vercel/path0
10:56:00.285 > next build
10:56:00.286 
10:56:00.902 Applying modifyConfig from Vercel
10:56:00.969 ▲ Next.js 16.2.6 (Turbopack)
10:56:00.970 
10:56:00.979 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
10:56:01.002 Creating an optimized production build ...
10:56:11.953 
10:56:11.954 > Build error occurred
10:56:11.958 Error: Turbopack build failed with 2 errors:
10:56:11.959 ./components/pulse/views/admin.tsx:22:1
10:56:11.959 Export reviewP2PTransfer doesn't exist in target module
10:56:11.959 20 | import { Button } from '@/components/ui/button'
10:56:11.959 21 | import { cn } from '@/lib/utils'
10:56:11.960 > 22 | import {
10:56:11.960 | ^^^^^^^
10:56:11.960 > 23 | getAdminSnapshot,
10:56:11.960 | ^^^^^^^^^^^^^^^^^^^
10:56:11.960 > 24 | reviewKyc,
10:56:11.960 | ^^^^^^^^^^^^
10:56:11.960 > 25 | reviewWithdrawal,
10:56:11.960 | ^^^^^^^^^^^^^^^^^^^
10:56:11.960 > 26 | reviewDeposit,
10:56:11.960 | ^^^^^^^^^^^^^^^^
10:56:11.960 > 27 | reviewP2PTransfer,
10:56:11.960 | ^^^^^^^^^^^^^^^^^^^^
10:56:11.960 > 28 | disburseYield,
10:56:11.960 | ^^^^^^^^^^^^^^^^
10:56:11.960 > 29 | addAdminByEmail,
10:56:11.961 | ^^^^^^^^^^^^^^^^^^
10:56:11.961 > 30 | appointAdminScope,
10:56:11.961 | ^^^^^^^^^^^^^^^^^^^^
10:56:11.961 > 31 | resetKyc,
10:56:11.961 | ^^^^^^^^^^^
10:56:11.961 > 32 | deleteUser,
10:56:11.961 | ^^^^^^^^^^^^^
10:56:11.961 > 33 | } from '@/app/actions/admin'
10:56:11.961 | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
10:56:11.961 34 | import type { AdminSnapshot } from '@/lib/pulse/types'
10:56:11.961 35 |
10:56:11.963 36 | type Tab = 'overview' | 'kyc' | 'deposits' | 'withdrawals' | 'transfers' | 'users' | 'sett...
10:56:11.963 
10:56:11.963 The export reviewP2PTransfer was not found in module [project]/app/actions/admin.ts [app-client] (ecmascript).
10:56:11.963 Did you mean to import reviewKyc?
10:56:11.963 All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.
10:56:11.963 
10:56:11.963 Import traces:
10:56:11.963 Client Component Browser:
10:56:11.963 ./components/pulse/views/admin.tsx [Client Component Browser]
10:56:11.963 ./components/pulse/app.tsx [Client Component Browser]
10:56:11.964 ./app/(investor)/app/page.tsx [Client Component Browser]
10:56:11.968 ./app/(investor)/app/page.tsx [Server Component]
10:56:11.968 
10:56:11.968 Client Component SSR:
10:56:11.968 ./components/pulse/views/admin.tsx [Client Component SSR]
10:56:11.968 ./components/pulse/app.tsx [Client Component SSR]
10:56:11.969 ./app/(investor)/app/page.tsx [Client Component SSR]
10:56:11.969 ./app/(investor)/app/page.tsx [Server Component]
10:56:11.969 
10:56:11.969 
10:56:11.969 ./components/pulse/views/admin.tsx:22:1
10:56:11.969 Export reviewP2PTransfer doesn't exist in target module
10:56:11.969 20 | import { Button } from '@/components/ui/button'
10:56:11.969 21 | import { cn } from '@/lib/utils'
10:56:11.969 > 22 | import {
10:56:11.969 | ^^^^^^^
10:56:11.969 > 23 | getAdminSnapshot,
10:56:11.969 | ^^^^^^^^^^^^^^^^^^^
10:56:11.969 > 24 | reviewKyc,
10:56:11.969 | ^^^^^^^^^^^^
10:56:11.969 > 25 | reviewWithdrawal,
10:56:11.969 | ^^^^^^^^^^^^^^^^^^^
10:56:11.969 > 26 | reviewDeposit,
10:56:11.969 | ^^^^^^^^^^^^^^^^
10:56:11.969 > 27 | reviewP2PTransfer,
10:56:11.969 | ^^^^^^^^^^^^^^^^^^^^
10:56:11.969 > 28 | disburseYield,
10:56:11.969 | ^^^^^^^^^^^^^^^^
10:56:11.969 > 29 | addAdminByEmail,
10:56:11.969 | ^^^^^^^^^^^^^^^^^^
10:56:11.969 > 30 | appointAdminScope,
10:56:11.970 | ^^^^^^^^^^^^^^^^^^^^
10:56:11.970 > 31 | resetKyc,
10:56:11.970 | ^^^^^^^^^^^
10:56:11.970 > 32 | deleteUser,
10:56:11.970 | ^^^^^^^^^^^^^
10:56:11.970 > 33 | } from '@/app/actions/admin'
10:56:11.970 | ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
10:56:11.970 34 | import type { AdminSnapshot } from '@/lib/pulse/types'
10:56:11.970 35 |
10:56:11.970 36 | type Tab = 'overview' | 'kyc' | 'deposits' | 'withdrawals' | 'transfers' | 'users' | 'sett...
10:56:11.970 
10:56:11.970 The export reviewP2PTransfer was not found in module [project]/app/actions/admin.ts [app-ssr] (ecmascript).
10:56:11.970 Did you mean to import reviewKyc?
10:56:11.970 All exports of the module are statically known (It doesn't have dynamic exports). So it's known statically that the requested export doesn't exist.
10:56:11.970 
10:56:11.970 Import traces:
10:56:11.970 Client Component Browser:
10:56:11.970 ./components/pulse/views/admin.tsx [Client Component Browser]
10:56:11.970 ./components/pulse/app.tsx [Client Component Browser]
10:56:11.972 ./app/(investor)/app/page.tsx [Client Component Browser]
10:56:11.976 ./app/(investor)/app/page.tsx [Server Component]
10:56:11.976 
10:56:11.976 Client Component SSR:
10:56:11.977 ./components/pulse/views/admin.tsx [Client Component SSR]
10:56:11.977 ./components/pulse/app.tsx [Client Component SSR]
10:56:11.977 ./app/(investor)/app/page.tsx [Client Component SSR]
10:56:11.977 ./app/(investor)/app/page.tsx [Server Component]
10:56:11.977 
10:56:11.977 
10:56:11.977 at <unknown> (./components/pulse/views/admin.tsx:22:1)
10:56:11.977 at <unknown> (./components/pulse/views/admin.tsx:22:1)
10:56:12.033  ELIFECYCLE  Command failed with exit code 1.
10:56:12.063 Error: Command "pnpm run build" exited with 1
