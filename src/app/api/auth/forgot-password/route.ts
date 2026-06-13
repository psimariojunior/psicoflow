import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sendPasswordResetEmail } from "@/lib/email"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import { validate, forgotPasswordSchema } from "@/lib/validation"
import crypto from "crypto"

export async function POST(request: Request) {
  const limit = rateLimitMiddleware(5, 60000)
  const blocked = await limit(request)
  if (blocked) return blocked

  try {
    const raw = await request.json()
    const result = validate(forgotPasswordSchema, raw)
    if (result.error) return result.error
    const { email } = result.data!

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: "Se o email estiver cadastrado, você receberá um link de recuperação." })
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expires = new Date(Date.now() + 3600000)

    await prisma.sessionToken.create({
      data: { token, expires, userId: user.id },
    })

    const err = await sendPasswordResetEmail(email, token, "/reset-password")

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
