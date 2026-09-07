export type TierId = 'tier_1' | 'tier_2' | 'tier_3' | 'tier_institutional'

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
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1600&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=1600&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop',
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
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=1600&auto=format&fit=crop',
    description: 'Exclusive off-grid solar safari lodges operating under elite, high-margin government ecotourism concessions.',
    metrics: { irr: '16.0%', duration: '48 Months', riskProfile: 'Conservative' }
  }
]
