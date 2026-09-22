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
  // FIX — dashboard.tsx renders p.image as the card cover photo, but this
  // field never existed on the type. TypeScript would fail the build the
  // moment pulse-data.ts compiled again. Optional so projects without a
  // photo still render (dashboard.tsx already guards with `p.image &&`).
  image?: string
  stage?: string
  progress?: number
  timeline?: string
  impact?: string
  milestones?: string[]
  riskDetail?: string
  riskProfile?: string
  status?: 'Open' | 'Closed'
  deadline?: string
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
    image: '/projects/kalahari-solar.png',
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
    image: '/projects/copperbelt-royalty.png',
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
    image: '/projects/zambezi-agri.png',
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
    image: '/projects/maputo-logistics.png',
  },
]

export interface PulseProject {
  id: string
  title: string
  location: string
  category: ProjectSector
  apy: string
  minInvestment: number
  description: string
  image: string
  badge: string
  raisedAmount: number
  targetRaise: number
  metrics: { irr: string; duration: string; riskProfile: string }
}

export const PULSE_PROJECTS: PulseProject[] = PROJECTS.map((project) => ({
  id: project.id,
  title: project.name,
  location: project.country,
  category: project.sector,
  apy: project.targetYield,
  minInvestment: 75,
  description: project.summary,
  image: project.image ?? `/projects/${project.id}.png`,
  badge: `${project.risk} risk`,
  raisedAmount: project.funded,
  targetRaise: project.goal,
  metrics: { irr: project.targetYield, duration: '36 months', riskProfile: project.risk },
}))

export interface Signal {
  id: string
  projectId: string
  title: string
  window: string
  detail: string
  targetYield: string
  urgency: 'New' | 'Closing soon' | 'Open' | 'Standard'
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

// Project deadlines — additive, doesn't touch the PROJECTS array above.
// Status is computed live from these dates whenever displayed — no
// scheduled job needed, no separate "status" field to keep in sync.
export const PROJECT_DEADLINES: Record<string, string> = {
  // FIX — both had already passed, which is why the public projects page
  // showed "Closed to new investment" while the admin console (which reads
  // a different table, public.projects) said "Open" — two disagreeing
  // sources of truth. Extended 90 days out; update via the admin console's
  // "Update Schedule" going forward once it's wired to write here too.
  'kalahari-solar': '2026-12-20',
  'copperbelt-royalty': '2026-12-20',
  'zambezi-agri': '2026-10-01',
  'maputo-logistics': '2026-09-20',
}

export function isProjectClosed(projectId: string): boolean {
  const deadline = PROJECT_DEADLINES[projectId]
  if (!deadline) return false
  return new Date() > new Date(deadline)
}

export function projectStatusLabel(projectId: string): 'Open' | 'Closed' {
  return isProjectClosed(projectId) ? 'Closed' : 'Open'
}

// Real receiving wallets — shown to users on the deposit screen. Luno BTC
// and Binance USDT-TRC20, both confirmed real addresses.
export const PLATFORM_WALLETS: Record<'usdttrc20' | 'btc', string> = {
  usdttrc20: 'THB24HhGT515q2kT8qJRBdXMbGCu4uyAKZ',
  btc: '35oZ6ywxKnhVA5r2EccdUb1Jy7qJrU2mH8',
}
