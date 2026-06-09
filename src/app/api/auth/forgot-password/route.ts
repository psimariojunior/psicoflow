import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sendPasswordResetEmail } from "@/lib/email"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import crypto from "crypto"

export async function POST(request: Request) {
  const limit = rateLimitMiddleware(5, 60000)
  const blocked = limit(request)
  if (blocked) return blocked

  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Email não encontrado" }, { status: 404 })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000)

    await prisma.sessionToken.create({
      data: { token, expires, userId: user.id },
    })

    const err = await sendPasswordResetEmail(email, token)

    if (err) {
      logger.warn("Password reset token generated but email not sent", { email, error: err })
    }

    return NextResponse.json({
      message: err
        ? "Link gerado. Configure o envio de emails para enviar."
        : "Email de recuperação enviado",
    })
  } catch (error) {
    logger.error("Forgot password error", { error: String(error) })
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
