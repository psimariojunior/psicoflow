import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { SignJWT } from "jose"
import { sendPasswordResetEmail } from "@/lib/email"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import { validate, forgotPasswordSchema } from "@/lib/validation"

export const dynamic = "force-dynamic"

function getSecret(): Uint8Array {
  const key = process.env.ENCRYPTION_KEY
  if (!key) throw new Error("ENCRYPTION_KEY não configurada")
  return new TextEncoder().encode(key)
}

export async function POST(request: NextRequest) {
  const rateLimit = rateLimitMiddleware(5, 120000)
  const blocked = await rateLimit(request)
  if (blocked) return blocked

  try {
    const raw = await request.json()
    const result = validate(forgotPasswordSchema, raw)
    if (result.error) return result.error
    const { email } = result.data!

    const patient = await prisma.patient.findFirst({
      where: { email: email.trim(), password: { not: null } },
    })
    if (!patient) {
      return NextResponse.json({ ok: true })
    }

    const resetToken = await new SignJWT({ patientId: patient.id, email: patient.email, purpose: "reset-password" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(getSecret())

    const emailErr = await sendPasswordResetEmail(email.trim(), resetToken)
    if (emailErr) {
      logger.error("Error sending reset email", { error: emailErr, email: email.trim() })
      return NextResponse.json({ error: "Erro ao enviar email de recuperação" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error("Error in forgot-password", { error: String(error) })
    return NextResponse.json({ error: "Erro ao processar solicitação" }, { status: 500 })
  }
}
