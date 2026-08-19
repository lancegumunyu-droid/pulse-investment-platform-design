'use client'

import { ArrowRight, TrendingUp, Shield, Zap, Globe, Users, BarChart3 } from 'lucide-react'
import { usePulse } from '../store'
import { Glass, Pill } from '../ui-bits'
import { Button } from '@/components/ui/button'
import { motion } from 'motion/react'
import dynamic from 'next/dynamic'

const HeroScene = dynamic(() => import('../hero-scene').then((module) => module.HeroScene), { ssr: false })

export function HomeView() {
  const { setView } = usePulse()

  return (
    <div className="relative space-y-8 pb-20">
      <HeroScene />
      {/* Hero Section */}
      <motion.div
        className="space-y-6 pt-4"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
      >
        <div className="space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold/80">SADC project intelligence</p>
          <h1 className="text-4xl font-bold leading-tight text-balance">
            Build wealth through <span className="text-gold">smart investing</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Access curated investment opportunities across emerging markets. Target yields of 10–22% with transparent, expert-managed portfolios.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1 h-12 bg-gold font-semibold text-primary-foreground hover:bg-gold/90"
            onClick={() => setView('signals')}
          >
            Explore Opportunities
            <ArrowRight className="ml-2 size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 h-12 border-white/10 hover:bg-white/5"
            onClick={() => setView('dashboard')}
          >
            Your Dashboard
          </Button>
        </div>

        {/* Quick Stats */}
        <Glass className="grid grid-cols-3 gap-4 p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gold">$12.4B</p>
            <p className="text-xs text-muted-foreground mt-1">Assets managed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gold">47K+</p>
            <p className="text-xs text-muted-foreground mt-1">Active investors</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gold">18%</p>
            <p className="text-xs text-muted-foreground mt-1">Avg. annual yield</p>
          </div>
        </Glass>
      </motion.div>

      {/* How It Works */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">How PULSE Works</h2>
        <div className="space-y-3">
          {[
            {
              step: '1',
              title: 'Verify Your Identity',
              desc: 'Complete KYC in minutes. We verify documents securely.',
              icon: Shield,
            },
            {
              step: '2',
              title: 'Fund Your Account',
              desc: 'Deposit via bank transfer, card, or wallet. Minimum $75.',
              icon: Zap,
            },
            {
              step: '3',
              title: 'Browse Opportunities',
              desc: 'Research our curated projects across sectors & regions.',
              icon: Globe,
            },
            {
              step: '4',
              title: 'Invest & Earn',
              desc: 'Allocate to projects you believe in. Receive yields quarterly.',
              icon: TrendingUp,
            },
          ].map(({ step, title, desc, icon: Icon }) => (
            <Glass key={step} className="flex gap-4 p-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gold/20 text-gold font-bold text-sm flex-shrink-0">
                {step}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground mt-1">{desc}</p>
              </div>
              <Icon className="size-5 text-gold/50 flex-shrink-0" />
            </Glass>
          ))}
        </div>
      </div>

      {/* Why PULSE */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Why Choose PULSE?</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Expert Curation', desc: 'Every project vetted by our team' },
            { label: 'Transparent Fees', desc: 'No hidden charges, all-in pricing' },
            { label: 'Portfolio Diversity', desc: 'Spread risk across sectors' },
            { label: '24/7 Support', desc: 'Real experts, real answers' },
            { label: 'Bank-Grade Security', desc: 'Encryption & compliance ready' },
            { label: 'Real Returns', desc: 'Based on actual project yields' },
          ].map(({ label, desc }, i) => (
            <Glass key={i} className="p-4">
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </Glass>
          ))}
        </div>
      </div>

      {/* Investment Tiers */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Unlock Higher Yields</h2>
        <p className="text-muted-foreground">Invest more, earn more. Our tier system rewards commitment:</p>
        
        <div className="space-y-2">
          {[
            { name: 'Starter', min: '$75+', yield: '11–13%', perks: 'Standard access & support' },
            { name: 'Growth', min: '$150+', yield: '13–16%', perks: 'Diversified basket & briefings' },
            { name: 'Builder', min: '$300+', yield: '15–18%', perks: 'Early access & priority support', highlight: true },
            { name: 'Leader', min: '$750+', yield: '17–20%', perks: 'Dedicated review & lower fees' },
            { name: 'Ambassador', min: '$1,500+', yield: '19–22%', perks: 'Governance & site visits' },
          ].map(({ name, min, yield: y, perks, highlight }, i) => (
            <Glass key={i} className={`p-4 ${highlight ? 'ring-2 ring-gold' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold">{name}</p>
                  <p className="text-sm text-gold mt-1">{min}</p>
                  <p className="text-xs text-muted-foreground mt-2">{perks}</p>
                </div>
                <Pill tone="gold">{y}</Pill>
              </div>
            </Glass>
          ))}
        </div>
      </div>

      {/* Risk Disclosure */}
      <Glass className="p-4 border-l-4 border-amber-500/50 bg-amber-500/5">
        <p className="text-xs font-semibold text-amber-700/80 uppercase tracking-wider">Disclaimer</p>
        <p className="text-xs leading-relaxed text-muted-foreground mt-2">
          Past performance does not guarantee future results. All investments carry risk, including potential loss of capital. PULSE facilitates access to underlying investments which may be illiquid and subject to regulatory changes. Carefully review each project&apos;s offering documents before investing.
        </p>
      </Glass>

      {/* Final CTA */}
      <Glass className="p-6 text-center space-y-4">
        <h3 className="text-xl font-bold">Ready to Start Investing?</h3>
        <p className="text-sm text-muted-foreground">
          Join thousands of investors building wealth with PULSE. Our team is here to help.
        </p>
        <Button
          size="lg"
          className="w-full h-12 bg-gold font-semibold text-primary-foreground hover:bg-gold/90"
          onClick={() => setView('dashboard')}
        >
          Create Your Account
        </Button>
        <p className="text-xs text-muted-foreground">
          Questions? Email us at <span className="text-gold font-semibold">support@pulse-invest.app</span>
        </p>
      </Glass>
    </div>
  )
}
