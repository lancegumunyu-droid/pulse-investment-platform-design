'use client'
import { Check, Layers, Lock } from 'lucide-react'
import { money, usePulse } from '../store'
import { Glass, Pill, RiskNote, SectionTitle } from '../ui-bits'
import { TIERS } from '@/lib/pulse-data'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
export function InvestView() {
  const { totalInvested, currentTier, openModal } = usePulse()
  return (
    <div className="space-y-5">
      <SectionTitle
        title="Progressive share tiers"
        subtitle="Tiers unlock automatically as your total investment grows — no recruitment required."
        icon={<Layers className="size-5" />}
      />
      <Glass className="animate-rise">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Your total invested</span>
          <span className="font-mono font-semibold">${money(totalInvested)}</span>
        </div>
      </Glass>
      <div className="space-y-3">
        {TIERS.map((tier, i) => {
          const unlocked = totalInvested >= tier.minInvest
          const isCurrent = currentTier.id === tier.id
          return (
            <Glass
              key={tier.id}
              gold={isCurrent}
              className={cn('animate-rise', !unlocked && 'opacity-95')}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'flex size-10 items-center justify-center rounded-xl font-mono text-sm font-semibold',
                      unlocked ? 'bg-gold-soft text-gold' : 'bg-white/[0.04] text-muted-foreground',
                    )}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold leading-tight">{tier.name}</p>
                    <p className="text-xs text-muted-foreground">From ${money(tier.minInvest, 0)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Pill tone="green">{tier.yieldLabel}</Pill>
                  {isCurrent ? <p className="mt-1 text-[10px] font-medium text-gold">CURRENT TIER</p> : null}
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
              <Button
                size="lg"
                variant={unlocked ? 'default' : 'outline'}
                className={cn(
                  'mt-4 h-11 w-full font-semibold',
                  unlocked
                    ? 'bg-gold text-primary-foreground hover:bg-gold/90'
                    : 'border-white/12 bg-white/[0.03]',
                )}
                onClick={() => openModal('invest', { amount: tier.minInvest })}
              >
                {unlocked ? (
                  'Add to this tier'
                ) : (
                  <>
                    <Lock className="size-4" /> Unlock with ${money(tier.minInvest, 0)}
                  </>
                )}
              </Button>
            </Glass>
          )
        })}
      </div>
      <RiskNote />
    </div>
  )
}
