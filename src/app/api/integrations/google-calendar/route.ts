import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: psychologistId },
      select: { googleRefreshToken: true, googleCalendarId: true },
    })

    const configMissing = !process.env.GOOGLE_CALENDAR_CLIENT_ID || !process.env.GOOGLE_CALENDAR_CLIENT_SECRET

    return apiSuccess({
      connected: !!user?.googleRefreshToken,
      calendarId: user?.googleCalendarId || null,
      configMissing,
    })
  } catch (error) {
    logger.error("Google Calendar status error", { error: String(error) })
    return apiError("Erro ao verificar status do Google Calendar")
  }
}

export async function POST() {
  try {
    const psychologistId = await requireAuth()
    const user = await prisma.user.findUnique({
      where: { id: psychologistId },
      select: { googleRefreshToken: true },
    })

    if (!user?.googleRefreshToken) {
      return apiError("Google Calendar não está conectado", 400)
    }

    await prisma.user.update({
      where: { id: psychologistId },
      data: { googleRefreshToken: null, googleCalendarId: null },
    })

    return apiSuccess({ disconnected: true })
  } catch (error) {
    logger.error("Google Calendar disconnect error", { error: String(error) })
    return apiError("Erro ao desconectar Google Calendar")
  }
}
