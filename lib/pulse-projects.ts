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

export const PULSE_PROJECTS: PulseProject[] = [
  {
    id: 'green-hydrogen-namibia',
    title: 'Kalahari Green Hydrogen & Clean Energy Syndicate',
    location: 'Namibia',
    category: 'Renewable Infrastructure',
    targetRaise: 5_000_000,
    raisedAmount: 3_850_000,
    apy: '18.5%',
    minInvestment: 500,
    tierId: 'tier_1',
    badge: 'Sovereign Backed • Tier 1',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1920&q=85&auto=format&fit=crop',
    description: 'Scaling multi-gigawatt green ammonia production facilities across the Erongo corridor for sovereign European supply chains.',
    metrics: { irr: '21.2%', duration: '36 Months', riskProfile: 'Moderate-High' }
  },
  {
    id: 'copperbelt-zambia',
    title: 'Zambian Critical Minerals & Copper Recovery',
    location: 'Zambia',
    category: 'Mining & Logistics',
    targetRaise: 12_500_000,
    raisedAmount: 9_120_000,
    apy: '24.0%',
    minInvestment: 1_000,
    tierId: 'tier_2',
    badge: 'Strategic Asset • Secured',
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=1920&q=85&auto=format&fit=crop',
    description: 'Advanced tailings reprocessing facility utilizing proprietary hydrometallurgy to extract high-purity copper cathodes for global EV markets.',
    metrics: { irr: '28.5%', duration: '24 Months', riskProfile: 'Growth' }
  },
  {
    id: 'silicon-cape-sa',
    title: 'Silicon Cape Fintech & Data Hub',
    location: 'South Africa',
    category: 'Digital Infrastructure',
    targetRaise: 8_000_000,
    raisedAmount: 6_450_000,
    apy: '16.8%',
    minInvestment: 500,
    tierId: 'tier_1',
    badge: 'Venture Growth • Tier 1',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=85&auto=format&fit=crop',
    description: 'Pan-African institutional settlement rails and hyper-secure Tier-4 data center infrastructure scaling across key SADC capitals.',
    metrics: { irr: '19.4%', duration: '18 Months', riskProfile: 'Venture' }
  },
  {
    id: 'zambezi-hospitality-botswana',
    title: 'Okavango Luxury Eco-Resort Syndicate',
    location: 'Botswana',
    category: 'Eco-Tourism & Real Estate',
    targetRaise: 4_500_000,
    raisedAmount: 3_900_000,
    apy: '14.2%',
    minInvestment: 500,
    tierId: 'tier_1',
    badge: 'Tangible Real Estate • Yield',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=85&auto=format&fit=crop',
    description: 'Exclusive off-grid solar safari lodges operating under elite, high-margin government ecotourism concessions.',
    metrics: { irr: '16.0%', duration: '48 Months', riskProfile: 'Conservative' }
  }
]

// Backward compatibility alias for any existing code imports referencing PROJECTS
export const PROJECTS = PULSE_PROJECTS

export const PLATFORM_WALLETS: Record<'usdttrc20' | 'btc', string> = {
  usdttrc20: 'THB24HhGT515q2kT8qJRBdXMbGCu4uyAKZ',
  btc: '35oZ6ywxKnhVA5r2EccdUb1Jy7qJrU2mH8',
}

export const RISK_DISCLAIMER =
  'Risk Warning: Alternative investments, private equity syndicates, and digital assets carry a high level of risk and may not be suitable for all investors. Capital is at risk. Before deciding to participate, carefully consider your financial objectives and risk tolerance.'
