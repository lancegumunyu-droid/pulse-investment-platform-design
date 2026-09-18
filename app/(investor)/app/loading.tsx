export default function InvestorAppLoading() {
  return (
    <main className="pulse-loading-screen" aria-live="polite" aria-busy="true">
      <div className="pulse-loading-orb" aria-hidden="true" />
      <div className="pulse-loading-content">
        <div className="pulse-loading-mark" aria-hidden="true">P</div>
        <p className="pulse-label">Loading your secure portfolio</p>
        <span className="sr-only">Please wait while your live account data loads.</span>
      </div>
    </main>
  )
}
