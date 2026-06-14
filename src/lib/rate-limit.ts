import { NextResponse } from "next/server"

const store = new Map<string, { count: number; resetAt: number }>()
const CLEANUP_INTERVAL = 60_000
let lastCleanup = Date.now()
function cleanupStore() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, value] of store) {
    if (now > value.resetAt) store.delete(key)
  }
}

let redis: { get: (key: string) => Promise<unknown>; set: (key: string, value: unknown, opts?: { ex?: number }) => Promise<unknown> } | null = null
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const { Redis } = require("@upstash/redis")
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
} catch {}

export function rateLimit(limit = 30, windowMs = 60000) {
  const getMemoryKey = (ip: string) => `rl:${ip}`
  
  return async (ip: string): Promise<{ allowed: boolean; remaining: number }> => {
    const now = Date.now()
    
    if (redis) {
      try {
        const key = `rate_limit:${ip}`
        const data = await redis.get(key) as { count: number; resetAt: number } | null
        
        if (!data || now > data.resetAt) {
          await redis.set(key, { count: 1, resetAt: now + windowMs }, { ex: Math.ceil(windowMs / 1000) })
          return { allowed: true, remaining: limit - 1 }
        }
        
        if (data.count >= limit) {
          return { allowed: false, remaining: 0 }
        }
        
        await redis.set(key, { count: data.count + 1, resetAt: data.resetAt }, { ex: Math.ceil((data.resetAt - now) / 1000) })
        return { allowed: true, remaining: limit - (data.count + 1) }
      } catch {}
    }
    
    const memoryKey = getMemoryKey(ip)
    cleanupStore()
    const record = store.get(memoryKey)

    if (!record || now > record.resetAt) {
      store.set(memoryKey, { count: 1, resetAt: now + windowMs })
      return { allowed: true, remaining: limit - 1 }
    }

    if (record.count >= limit) {
      return { allowed: false, remaining: 0 }
    }

    record.count++
    return { allowed: true, remaining: limit - record.count }
  }
}

export function rateLimitMiddleware(limit = 30, windowMs = 60000) {
  const check = rateLimit(limit, windowMs)

  return async (request: Request) => {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const result = await check(ip)

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em alguns segundos." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) } }
      )
    }

    return null
  }
}
