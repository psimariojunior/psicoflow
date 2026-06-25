import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const checks: Record<string, string> = {}
  let healthy = true

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = "ok"
  } catch {
    checks.database = "fail"
    healthy = false
  }

  try {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    checks.push = vapidKey ? "ok" : "not configured"
  } catch {
    checks.push = "fail"
  }

  try {
    checks.sentry = process.env.NEXT_PUBLIC_SENTRY_DSN ? "ok" : "not configured"
  } catch {
    checks.sentry = "fail"
  }

  try {
    checks.stripe = process.env.STRIPE_SECRET_KEY ? "ok" : "not configured"
  } catch {
    checks.stripe = "fail"
  }

  const services = await prisma.$queryRaw<{ total: bigint }[]>`SELECT COUNT(*) as total FROM "User"`
  const totalUsers = Number(services[0]?.total || 0)

  return NextResponse.json({
    status: healthy ? "healthy" : "unhealthy",
    version: "1.0.0",
    uptime: process.uptime(),
    environment: process.env.VERCEL_ENV || "development",
    totalUsers,
    checks,
    timestamp: new Date().toISOString(),
  })
}
