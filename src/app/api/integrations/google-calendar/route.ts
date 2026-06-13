import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { getOAuth2Client } from "@/lib/google-calendar"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (code && state) {
      const oauth2Client = getOAuth2Client()
      const { tokens } = await oauth2Client.getToken(code)

      if (!tokens.refresh_token) {
        return apiError("refresh_token não recebido. Revogue e tente novamente.", 400)
      }

      await prisma.user.update({
        where: { id: state },
        data: {
          googleRefreshToken: tokens.refresh_token,
          googleCalendarId: "primary",
        },
      })

      return Response.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/configuracoes?tab=google-calendar&success=conectado`
      )
    }
    const psychologistId = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: psychologistId },
      select: { googleRefreshToken: true, googleCalendarId: true },
    })

    return apiSuccess({
      connected: !!user?.googleRefreshToken,
      calendarId: user?.googleCalendarId || null,
    })
  } catch (error) {
    logger.error("Google Calendar OAuth error", { error: String(error) })
    return apiError("Erro na integração com Google Calendar")
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
