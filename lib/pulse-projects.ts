export type TierId = 'tier_1' | 'tier_2' | 'tier_3' | 'tier_institutional'

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

export const TIERS: Tier[] = [
  {
    id: 'tier_1',
    name: 'Tier 1 Starter',
    minInvest: 500,
    yieldLabel: '14–18% target',
    yieldLow: 14,
    yieldHigh: 18,
    perks: ['Access to Tier 1 syndicated assets', 'Monthly performance reports', 'Standard support'],
  },
  {
    id: 'tier_2',
    name: 'Tier 2 Growth',
    minInvest: 1000,
    yieldLabel: '18–24% target',
    yieldLow: 18,
    yieldHigh: 24,
    perks: ['All Tier 1 benefits', 'Secured critical mineral exposure', 'Quarterly strategy briefings'],
    highlight: true,
  },
  {
    id: 'tier_3',
    name: 'Tier 3 Advanced',
    minInvest: 5000,
    yieldLabel: '22–26% target',
    yieldLow: 22,
    yieldHigh: 26,
    perks: ['All Tier 2 benefits', 'Early access to institutional syndicates', 'Priority governance voting'],
  },
  {
    id: 'tier_institutional',
    name: 'Institutional Syndicate',
    minInvest: 25000,
    yieldLabel: '25% + target',
    yieldLow: 25,
    yieldHigh: 30,
    perks: ['Dedicated portfolio manager', 'Direct asset site-visit invitations', 'Custom legal SPV structuring'],
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

export interface PulseProject {
  id: string
  title: string
  location: string
  category: string
  targetRaise: number
  raisedAmount: number
  apy: string
  minInvestment: number
  tierId: TierId
  badge: string
  image: string
  description: string
  metrics: {
    irr: string
    duration: string
    riskProfile: string
  }
}

/**
 * MD Section 2 Compliant Project Data Specifications
 * Kalahari: $9,650 / $1,000,000 (0.965%)
 * Copperbelt: $2,100 / $750,000 (0.28%)
 * Maputo: $375 / $900,000 (0.0417%)
 * Zambezi: $288,000 / $500,000 (57.6%)
 */
export const PULSE_PROJECTS: PulseProject[] = [
  {
    id: 'kalahari-solar',
    title: 'Kalahari Green Hydrogen & Solar Infrastructure',
    location: 'Namibia',
    category: 'Renewable Infrastructure',
    targetRaise: 1_000_000,
    raisedAmount: 9_650,
    apy: '18.5%',
    minInvestment: 500,
    tierId: 'tier_1',
    badge: 'Sovereign Backed • Tier 1',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1920&q=85&auto=format&fit=crop',
    description: 'Multi-gigawatt solar-to-ammonia production infrastructure supplying European and green shipping trade corridors.',
    metrics: { irr: '21.2%', duration: '36 Months', riskProfile: 'Moderate' }
  },
  {
    id: 'copperbelt-royalty',
    title: 'Copperbelt Critical Minerals Royalty Note',
    location: 'Zambia',
    category: 'Mining & Logistics',
    targetRaise: 750_000,
    raisedAmount: 2_100,
    apy: '24.8%',
    minInvestment: 1_000,
    tierId: 'tier_2',
    badge: 'Strategic Asset • Secured',
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=1920&q=85&auto=format&fit=crop',
    description: 'High-purity tailings recovery facility extracting battery-grade copper cathodes for electric transport networks.',
    metrics: { irr: '28.5%', duration: '24 Months', riskProfile: 'Growth' }
  },
  {
    id: 'maputo-logistics',
    title: 'Maputo Logistics Hub',
    location: 'Mozambique',
    category: 'Trade Infrastructure',
    targetRaise: 900_000,
    raisedAmount: 375,
    apy: '21.5%',
    minInvestment: 500,
    tierId: 'tier_1',
    badge: 'SADC Logistics Hub • Tier 1',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=85&auto=format&fit=crop',
    description: 'Deepwater port terminal expansion and automated container storage facility serving cross-border trade corridors.',
    metrics: { irr: '22.0%', duration: '30 Months', riskProfile: 'Moderate' }
  },
  {
    id: 'zambezi-agri',
    title: 'Zambezi Commercial Agribusiness Syndicate',
    location: 'Zambia',
    category: 'Agribusiness',
    targetRaise: 500_000,
    raisedAmount: 288_000,
    apy: '19.2%',
    minInvestment: 500,
    tierId: 'tier_1',
    badge: 'High Yield • Asset-Backed',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&q=85&auto=format&fit=crop',
    description: 'Precision-irrigated commercial grain production and automated regional storage grain silos.',
    metrics: { irr: '20.4%', duration: '18 Months', riskProfile: 'Conservative' }
  }
]

// Backward compatibility alias
export const PROJECTS = PULSE_PROJECTS

export const PLATFORM_WALLETS: Record<'usdttrc20' | 'btc', string> = {
  usdttrc20: 'THB24HhGT515q2kT8qJRBdXMbGCu4uyAKZ',
  btc: '35oZ6ywxKnhVA5r2EccdUb1Jy7qJrU2mH8',
}

export const RISK_DISCLAIMER =
  'Risk Warning: Alternative investments, private equity syndicates, and digital assets carry a high level of risk and may not be suitable for all investors. Capital is at risk. Before deciding to participate, carefully consider your financial objectives and risk tolerance.'
