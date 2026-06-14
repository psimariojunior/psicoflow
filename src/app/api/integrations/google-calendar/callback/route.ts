import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { getOAuth2Client, verifyOAuthState } from "@/lib/google-calendar"
import { apiError } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    if (!code || !state) {
      return apiError("Parâmetros ausentes", 400)
    }

    const { id: userId, valid } = verifyOAuthState(state)
    if (!valid) {
      return apiError("Estado inválido. Inicie a autenticação novamente.", 400)
    }

    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.refresh_token) {
      return apiError("refresh_token não recebido. Revogue e tente novamente.", 400)
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        googleRefreshToken: tokens.refresh_token,
        googleCalendarId: "primary",
      },
    })

    return Response.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/configuracoes?tab=google-calendar&success=conectado`
    )
  } catch (error) {
    logger.error("Google Calendar OAuth callback error", { error: String(error) })
    return apiError("Erro na autenticação com Google Calendar")
  }
}
