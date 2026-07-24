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
  "Risk Warning: Trading stocks, options, futures, and forex carries a high level of risk and may not be suitable for all investors. Leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose."

On Thu, 23 Jul 2026 at 18:04, Lance Gumunyu <lancegumunyu@gmail.com> wrote:

22:46:53.881 Running build in Washington, D.C., USA (East) – iad1
22:46:53.888 Build machine configuration: 2 cores, 8 GB
22:46:54.080 Cloning github.com/lancegumunyu-droid/pulse-investment-platform-design (Branch: main, Commit: 16fe1a2)
22:46:55.993 Cloning completed: 1.913s
22:46:56.208 Restored build cache from previous deployment (7zdThLGVCAEq7e1i9mQBzBHvpQrs)
22:46:56.553 Running "vercel build"
22:46:56.599 Vercel CLI 56.5.0
22:46:56.940 Detected `pnpm-lock.yaml` 9 which may be generated by pnpm@9.x or pnpm@10.x
22:46:56.941 Using pnpm@10.x based on project creation date
22:46:56.941 To use pnpm@9.x, manually opt in using corepack (https://vercel.com/docs/deployments/configure-a-build#corepack)
22:46:56.973 Installing dependencies...
22:46:57.582 Lockfile is up to date, resolution step is skipped
22:46:57.729 Already up to date
22:46:57.891 
22:46:57.904 ╭ Warning ─────────────────────────────────────────────────────────────────────╮
22:46:57.904 │ │
22:46:57.904 │ Ignored build scripts: msw@2.14.6, sharp@0.34.5. │
22:46:57.905 │ Run "pnpm approve-builds" to pick which dependencies should be allowed │
22:46:57.905 │ to run scripts. │
22:46:57.905 │ │
22:46:57.905 ╰──────────────────────────────────────────────────────────────────────────────╯
22:46:57.909 Done in 879ms using pnpm v10.28.0
22:46:57.921 Detected Next.js version: 16.2.6
22:46:57.933 Running "pnpm run build"
22:46:58.198 
22:46:58.199 > my-project@0.1.0 build /vercel/path0
22:46:58.199 > next build
22:46:58.199 
22:46:58.960 Applying modifyConfig from Vercel
22:46:59.039 ▲ Next.js 16.2.6 (Turbopack)
22:46:59.039 
22:46:59.047 ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
22:46:59.069 Creating an optimized production build ...
22:47:08.741 
22:47:08.742 > Build error occurred
22:47:08.745 Error: Turbopack build failed with 1 errors:
22:47:08.745 ./components/pulse/modals.tsx:517:1
22:47:08.745 Expected '</', got '<eof>'
22:47:08.746 515 | <div className="flex items-center justify-between">
22:47:08.746 516 | <span className="text-muted-foreground">{label}<
22:47:08.746 > 517 |
22:47:08.746 | ^
22:47:08.746 
22:47:08.746 Parsing ecmascript source code failed
22:47:08.746 
22:47:08.746 Import traces:
22:47:08.747 Client Component Browser:
22:47:08.747 ./components/pulse/modals.tsx [Client Component Browser]
22:47:08.747 ./components/pulse/app.tsx [Client Component Browser]
22:47:08.747 ./app/(investor)/app/page.tsx [Client Component Browser]
22:47:08.747 ./app/(investor)/app/page.tsx [Server Component]
22:47:08.747 
22:47:08.747 Client Component SSR:
22:47:08.748 ./components/pulse/modals.tsx [Client Component SSR]
22:47:08.748 ./components/pulse/app.tsx [Client Component SSR]
22:47:08.748 ./app/(investor)/app/page.tsx [Client Component SSR]
22:47:08.748 ./app/(investor)/app/page.tsx [Server Component]
22:47:08.748 
22:47:08.748 
22:47:08.748 at <unknown> (./components/pulse/modals.tsx:517:1)
22:47:08.794  ELIFECYCLE  Command failed with exit code 1.
22:47:08.816 Error: Command "pnpm run build" exited with 1



Error didn't deploy...

Please finish
