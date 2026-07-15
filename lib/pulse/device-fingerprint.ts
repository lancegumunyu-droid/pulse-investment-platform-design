/**
 * Client-side device fingerprint
 * Collects stable, non-sensitive browser signals and SHA-256 hashes them.
 * No canvas fingerprinting, no audio, no aggressive tracking — just
 * a best-effort duplicate signup deterrent.
 *
 * Signals used:
 *   - Platform / OS token
 *   - Hardware concurrency bucket
 *   - Screen resolution (rounded to nearest 50px)
 *   - Timezone identifier
 *   - Language preference
 *   - A random salt stored in localStorage (survives browser restarts,
 *     is wiped on private-mode close — intentional)
 *
 * The resulting hash is stored server-side keyed to the account.
 * It is NOT a PII identifier and cannot be reversed to find the user.
 */

const SALT_KEY = '_pdev'

function getOrCreateSalt(): string {
  try {
    let salt = localStorage.getItem(SALT_KEY)
    if (!salt) {
      const bytes = new Uint8Array(16)
      crypto.getRandomValues(bytes)
      salt = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      localStorage.setItem(SALT_KEY, salt)
    }
    return salt
  } catch {
    return 'fallback-salt'
  }
}

function roundTo(n: number, nearest: number): number {
  return Math.round(n / nearest) * nearest
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  )
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function getDeviceFingerprint(): Promise<string> {
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string }
    deviceMemory?: number
  }

  const platform =
    nav.userAgentData?.platform ??
    nav.platform ??
    'unknown'

  const hwConcurrency = Math.min(nav.hardwareConcurrency ?? 4, 16)
  const screenW = roundTo(screen.width, 50)
  const screenH = roundTo(screen.height, 50)
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'
  const lang = nav.language ?? 'en'
  const salt = getOrCreateSalt()

  const raw = [platform, hwConcurrency, screenW, screenH, tz, lang, salt].join('|')
  return sha256(raw)
}
