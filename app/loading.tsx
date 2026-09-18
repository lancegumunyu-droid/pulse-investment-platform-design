import Image from 'next/image'

export default function Loading() {
  return (
    <main className="pulse-loading-screen" aria-busy="true" aria-label="Loading Pulse">
      <div className="pulse-loading-orb" aria-hidden="true" />
      <div className="pulse-loading-content">
        <Image
          src="/icon.svg"
          alt="Pulse"
          width={64}
          height={64}
          priority
          className="pulse-loading-logo"
        />
        <p className="pulse-label">Loading Pulse</p>
      </div>
    </main>
  )
}
