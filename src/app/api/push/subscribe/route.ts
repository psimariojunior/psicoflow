import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

function getRedis() {
  const { Redis } = require("@upstash/redis") as typeof import("@upstash/redis")
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  })
}

const subKey = (userId: string) => `push:subscriptions:${userId}`

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const { endpoint, keys } = body

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Subscription inválida" }, { status: 400 })
    }

    const redis = getRedis()
    const existing = await redis.get<string[]>(subKey(userId))
    const subs = existing || []

    const exists = subs.some((s: string) => {
      try {
        return JSON.parse(s).endpoint === endpoint
      } catch { return false }
    })

    if (!exists) {
      subs.push(JSON.stringify({ endpoint, keys }))
      await redis.set(subKey(userId), subs)
    }

    return NextResponse.json({ subscribed: true, total: subs.length })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()
    const endpoint = body.endpoint

    if (!endpoint) {
      return NextResponse.json({ error: "endpoint obrigatório" }, { status: 400 })
    }

    const redis = getRedis()
    const existing = await redis.get<string[]>(subKey(userId))
    if (!existing) return NextResponse.json({ unsubscribed: true, total: 0 })

    const filtered = existing.filter((s: string) => {
      try {
        return JSON.parse(s).endpoint !== endpoint
      } catch { return false }
    })

    await redis.set(subKey(userId), filtered)
    return NextResponse.json({ unsubscribed: true, total: filtered.length })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
