import { NextResponse } from "next/server"

const store = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(limit = 30, windowMs = 60000) {
  return (ip: string): { allowed: boolean; remaining: number } => {
    const now = Date.now()
    const key = ip
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

  return (request: Request) => {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
    const result = check(ip)

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em alguns segundos." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) } }
      )
    }

    return null
  }
}
