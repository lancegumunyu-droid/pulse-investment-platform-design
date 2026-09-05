import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { z } from 'zod'

const redis = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Redis({ url: process.env.KV_REST_API_URL, token: process.env.KV_REST_API_TOKEN })
  : null

const publicLimiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(100, '15 m'), prefix: 'pulse:public' }) : null
const financialLimiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 m'), prefix: 'pulse:financial' }) : null

export const financialRequestSchema = z.object({
  amount: z.number().finite().positive().max(1_000_000),
  currency: z.enum(['USD', 'USDT', 'BTC', 'PI', 'PULSE']),
  reference: z.string().trim().max(160).optional(),
}).strict()

export const feeBreakdown = (gross: number) => ({
  gross: Number(gross.toFixed(2)),
  fee: Number((gross * 0.1).toFixed(2)),
  net: Number((gross * 0.9).toFixed(2)),
})

export const withdrawalBreakdown = (gross: number) => ({
  requested: Number(gross.toFixed(2)),
  processingFee: Number((gross * 0.05).toFixed(2)),
  net: Number((gross * 0.95).toFixed(2)),
  payout: Number((gross * 0.95 * 0.7).toFixed(2)),
  retained: Number((gross * 0.95 * 0.3).toFixed(2)),
})

export function requestIdentity(request: Request, userId?: string) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = request.headers.get('x-real-ip')?.trim()
  const ip = forwarded || realIp || 'unknown'
  return `${userId ? `user:${userId}` : 'anonymous'}:ip:${ip}`
}

export async function enforceRateLimit(key: string, financial = true) {
  const limiter = financial ? financialLimiter : publicLimiter
  if (!limiter) return { success: false, configured: false, reason: 'rate_limiter_unavailable' }
  return { ...(await limiter.limit(key)), configured: true }
}

export function idempotencyKey(request: Request) {
  const key = request.headers.get('x-idempotency-key')?.trim() ?? ''
  return /^[A-Za-z0-9_-]{32,128}$/.test(key) ? key : null
}

export async function claimIdempotency(key: string, subject: string) {
  if (!redis) return { claimed: false, configured: false }
  const claimed = await redis.set(`pulse:idempotency:${subject}:${key}`, 'locked', { nx: true, ex: 86400 })
  return { claimed: claimed === 'OK', configured: true }
}
