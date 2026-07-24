export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-6">
      <div className="relative flex size-16 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-2xl bg-gold/15" />
        <span className="glass-gold relative flex size-16 items-center justify-center rounded-2xl">
          <svg
            viewBox="0 0 48 24"
            className="h-6 w-10 text-gold"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              d="M0 12h9l3-9 6 18 5-13 3 4h22"
              pathLength="1"
              className="animate-[pulse-draw_1.4s_ease-in-out_infinite]"
            />
          </svg>
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <p className="text-sm font-semibold tracking-tight text-foreground">Pulse</p>
        <p className="text-xs text-muted-foreground">Grow responsibly</p>
      </div>

      <style>{`
        @keyframes pulse-draw {
          0% { stroke-dasharray: 0 1; opacity: 0.35; }
          50% { stroke-dasharray: 1 0; opacity: 1; }
          100% { stroke-dasharray: 1 0; opacity: 0.35; }
        }
      `}</style>
    </div>
  )
}
