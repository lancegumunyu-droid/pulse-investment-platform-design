'use client'

import { House, Layers, Radio, Sparkles, User, Wallet, Zap, ShieldCheck } from 'lucide-react'
import { usePulse, type View } from './store'
import { cn } from '@/lib/utils'

const ITEMS: { view: View; label: string; icon: typeof House }[] = [
  { view: 'home', label: 'Welcome', icon: House },
  { view: 'dashboard', label: 'Dashboard', icon: Layers },
  { view: 'invest', label: 'Invest', icon: Sparkles },
  { view: 'signals', label: 'Signals', icon: Radio },
  { view: 'wallet', label: 'Wallet', icon: Wallet },
  { view: 'profile', label: 'Profile', icon: User },
  { view: 'admin', label: 'Admin', icon: ShieldCheck },
]

export function BottomNav() {
  const { view, setView } = usePulse()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/8 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5">
        {ITEMS.map(({ view: v, label, icon: Icon }) => {
          const active = view === v
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition-colors',
                active ? 'text-gold' : 'text-muted-foreground hover:text-foreground',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-xl transition-colors',
                  active && 'bg-gold-soft',
                )}
              >
                <Icon className="size-[18px]" />
              </span>
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
