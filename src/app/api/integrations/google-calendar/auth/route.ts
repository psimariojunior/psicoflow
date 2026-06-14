import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { getAuthUrl } from "@/lib/google-calendar"
import { requireAuth } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const psychologistId = await requireAuth()
    const authUrl = getAuthUrl(psychologistId)
    return NextResponse.redirect(authUrl)
  } catch (error) {
    logger.error("Google Calendar auth error", { error: String(error) })
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/configuracoes?error=auth_failed`
    )
  }
}
