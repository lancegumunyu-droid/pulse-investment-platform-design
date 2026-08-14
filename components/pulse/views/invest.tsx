'use client'

import { motion } from 'framer-motion'
import { Check, Layers, Lock } from 'lucide-react'
import { money, usePulse } from '../store'
import { Glass, Pill, RiskNote, SectionTitle } from '../ui-bits'
import { TIERS } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function InvestView() {
  const { totalInvested, currentTier, openModal } = usePulse()

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <motion.div variants={itemVariants}>
        <SectionTitle
          title="Progressive share tiers"
          subtitle="Tiers unlock automatically as your total investment grows — no recruitment required."
          icon={<Layers className="size-5" />}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Glass gold className="glow-edge border border-gold/20 bg-black/40 backdrop-blur-xl p-5 relative overflow-hidden shadow-2xl">
          <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-gold/10 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">Your total invested</p>
          <p className="mt-1.5 font-mono text-3xl font-semibold tracking-tight text-white">${money(totalInvested)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            <span className="text-white font-medium">{currentTier.name}</span> tier · <span className="text-green font-medium">{currentTier.yieldLabel}</span> target
          </p>
        </Glass>
      </motion.div>

      <div className="space-y-3">
        {TIERS.map((tier, i) => {
          const unlocked = totalInvested >= tier.minInvest
          const isCurrent = currentTier.id === tier.id

          return (
            <motion.div key={tier.id} variants={itemVariants}>
              <Glass
                gold={isCurrent}
                className={cn(
                  'border bg-black/40 backdrop-blur-xl p-5 transition-all',
                  isCurrent ? 'glow-edge shimmer-sweep border-gold/30 shadow-lg shadow-gold/5' : 'border-white/10',
                  !unlocked && 'opacity-90'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex size-10 items-center justify-center rounded-xl font-mono text-sm font-semibold border',
                        unlocked 
                          ? 'bg-gold/15 text-gold border-gold/30' 
                          : 'bg-white/[0.04] text-muted-foreground border-white/10',
                      )}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-semibold leading-tight text-white">{tier.name}</p>
                      <p className="text-xs text-muted-foreground">From ${money(tier.minInvest, 0)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Pill tone="green">{tier.yieldLabel}</Pill>
                    {isCurrent ? <p className="mt-1 text-[10px] font-semibold text-gold tracking-wider">CURRENT TIER</p> : null}
                  </div>
                </div>

                <ul className="mt-4 space-y-2">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-green" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    size="lg"
                    variant={unlocked ? 'default' : 'outline'}
                    className={cn(
                      'mt-4 h-11 w-full font-semibold transition-all shadow-md',
                      unlocked
                        ? 'bg-gold text-primary-foreground hover:bg-gold/90 shadow-gold/15'
                        : 'border-white/12 bg-white/[0.03] text-white hover:bg-white/[0.08]',
                    )}
                    onClick={() => openModal('invest', { amount: tier.minInvest })}
                  >
                    {unlocked ? (
                      'Add to this tier'
                    ) : (
                      <>
                        <Lock className="size-4 mr-1.5" /> Unlock with ${money(tier.minInvest, 0)}
                      </>
                    )}
                  </Button>
                </motion.div>
              </Glass>
            </motion.div>
          )
        })}
      </div>

      <motion.div variants={itemVariants}>
        <RiskNote />
      </motion.div>
    </motion.div>
  )
}
