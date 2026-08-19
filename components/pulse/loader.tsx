'use client'

import { Lottie } from 'lottie-react'

export function PulseLoader({ animationData }: { animationData?: object }) {
  return (
    <div className="flex items-center justify-center" role="status" aria-label="Loading">
      {animationData ? <Lottie src={animationData} loop autoplay className="size-16" /> : <span className="size-8 animate-spin rounded-full border-2 border-gold/20 border-t-gold" />}
      <span className="sr-only">Loading</span>
    </div>
  )
}
