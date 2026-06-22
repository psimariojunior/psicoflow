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
    const secret = process.env.NEXTAUTH_SECRET
    checks.auth = secret && secret.length >= 32 && secret !== "seu-secret-aqui-mude-em-producao" ? "ok" : "weak"
    if (checks.auth !== "ok") healthy = false
  } catch {
    checks.auth = "fail"
    healthy = false
  }

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  )
}
