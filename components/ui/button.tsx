'use client'

import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding font-sans text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-out outline-none select-none focus-visible:border-amber-400 focus-visible:ring-3 focus-visible:ring-amber-400/50 active:scale-[0.98] transform-gpu disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-rose-500 aria-invalid:ring-3 aria-invalid:ring-rose-500/25 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'bg-white text-zinc-950 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:bg-zinc-200 hover:shadow-[0_4px_25px_rgba(255,255,255,0.25)] hover:-translate-y-0.5',
        gold: 
          'border border-amber-400/50 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:brightness-110 hover:shadow-[0_0_30px_rgba(245,158,11,0.55),0_0_15px_rgba(16,185,129,0.25)] hover:-translate-y-0.5',
        glass: 
          'border border-white/16 bg-zinc-900/60 text-white backdrop-blur-2xl hover:border-amber-400/40 hover:bg-white/[0.1] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]',
        outline:
          'border border-white/12 bg-zinc-950/40 text-white hover:bg-white/[0.08] hover:border-white/25 aria-expanded:bg-zinc-900 aria-expanded:text-white hover:-translate-y-0.5',
        secondary:
          'bg-zinc-900 text-white border border-white/10 hover:bg-zinc-800 hover:border-white/20 aria-expanded:bg-zinc-800',
        ghost:
          'hover:bg-white/[0.08] hover:text-white aria-expanded:bg-white/10 text-zinc-300',
        destructive:
          'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 focus-visible:border-rose-500/50 focus-visible:ring-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]',
        link: 'text-amber-400 underline-offset-4 hover:underline hover:text-amber-300',
      },
      size: {
        default:
          'h-10 gap-2 px-4 text-sm has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        xs: "h-7 gap-1 rounded-lg px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-xl px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-11 gap-2 px-6 text-base font-bold has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
        icon: 'size-9 rounded-xl',
        'icon-xs': "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': 'size-8 rounded-xl',
        'icon-lg': 'size-11 rounded-2xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
