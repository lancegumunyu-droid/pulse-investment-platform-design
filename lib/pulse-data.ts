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

export function nextTier(current: TierId | string): Tier | null {
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
  image?: string
  status?: 'Open' | 'Closed'
  deadline?: string | null
}

// Fallback seed projects if DB is empty or during cold-starts
export const FALLBACK_PROJECTS: Project[] = [
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
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1000&auto=format&fit=crop',
    status: 'Open',
    deadline: '2026-09-15',
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
    image: 'https://images.unsplash.com/photo-1610375461369-d613b564f4c4?q=80&w=1000&auto=format&fit=crop',
    status: 'Open',
    deadline: '2026-08-30',
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
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1000&auto=format&fit=crop',
    status: 'Open',
    deadline: '2026-10-01',
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
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop',
    status: 'Open',
    deadline: '2026-09-20',
  },
]

// Backward compatibility export
export const PROJECTS = FALLBACK_PROJECTS

// Export required record mapping for deadlines
export const PROJECT_DEADLINES: Record<string, string> = PROJECTS.reduce(
  (acc, p) => {
    if (p.deadline) acc[p.id] = p.deadline
    return acc
  },
  {} as Record<string, string>
)

export interface Signal {
  id: string
  projectId: string
  title: string
  window: string
  detail: string
  targetYield: string
  urgency: 'New' | 'Closing soon' | 'Open'
}

// Fallback seed signals
export const FALLBACK_SIGNALS: Signal[] = [
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

// Backward compatibility export
export const SIGNALS = FALLBACK_SIGNALS

export const TOKEN = {
  symbol: 'PULSE',
  salePrice: 0.08,
  bonusPct: 35,
  stakingApy: 24.8,
}

export const RISK_DISCLAIMER =
  'Risk Warning: Trading stocks, options, futures, and forex carries a high level of risk and may not be suitable for all investors. Leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose.'

export function isProjectClosed(p: Project): boolean {
  if (p.status === 'Closed') return true
  if (!p.deadline) return false
  return new Date() > new Date(p.deadline)
}

export function projectStatusLabel(p: Project): 'Open' | 'Closed' {
  return isProjectClosed(p) ? 'Closed' : 'Open'
}

export const PLATFORM_WALLETS: Record<'usdttrc20' | 'btc', string> = {
  usdttrc20: 'THB24HhGT515q2kT8qJRBdXMbGCu4uyAKZ',
  btc: '35oZ6ywxKnhVA5r2EccdUb1Jy7qJrU2mH8',
}
