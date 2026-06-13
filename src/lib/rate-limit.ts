import { NextResponse } from "next/server"

const store = new Map<string, { count: number; resetAt: number }>()

let kv: { get: (key: string) => Promise<unknown>; set: (key: string, value: unknown, opts?: { ex?: number }) => Promise<unknown> } | null = null
try {
  if (process.env.KV_URL || process.env.KV_REST_API_URL) {
    const { kv: kvClient } = require("@vercel/kv")
    kv = kvClient
  }
} catch {}

export function rateLimit(limit = 30, windowMs = 60000) {
  const getMemoryKey = (ip: string) => `rl:${ip}`
  
  return async (ip: string): Promise<{ allowed: boolean; remaining: number }> => {
    const now = Date.now()
    
    if (kv) {
      try {
        const key = `rate_limit:${ip}`
        const data = await kv.get(key) as { count: number; resetAt: number } | null
        
        if (!data || now > data.resetAt) {
          await kv.set(key, { count: 1, resetAt: now + windowMs }, { ex: Math.ceil(windowMs / 1000) })
          return { allowed: true, remaining: limit - 1 }
        }
        
        if (data.count >= limit) {
          return { allowed: false, remaining: 0 }
        }
        
        await kv.set(key, { count: data.count + 1, resetAt: data.resetAt }, { ex: Math.ceil((data.resetAt - now) / 1000) })
        return { allowed: true, remaining: limit - (data.count + 1) }
      } catch {}
    }
    
    const key = getMemoryKey(ip)
    const record = store.get(key)

    if (!record || now > record.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs })
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
