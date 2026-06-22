import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { rateLimitMiddleware } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const resetSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(128, "Senha muito longa"),
})

const rateLimit = rateLimitMiddleware(5, 60000)

const encKey = process.env.ENCRYPTION_KEY
if (!encKey) throw new Error("ENCRYPTION_KEY não configurada")
const secret = new TextEncoder().encode(encKey)

export async function POST(request: NextRequest) {
  const blocked = await rateLimit(request)
  if (blocked) return blocked

  try {
    const raw = await request.json()
    const parse = resetSchema.safeParse(raw)
    if (!parse.success) {
      return NextResponse.json({
        error: "Dados inválidos",
        details: parse.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      }, { status: 400 })
    }

    const { token, password } = parse.data

    let payload: { patientId: string; email: string; purpose: string }
    try {
      const { payload: verified } = await jwtVerify(token, secret)
      payload = verified as unknown as { patientId: string; email: string; purpose: string }
      if (payload.purpose !== "reset-password") throw new Error("Invalid purpose")
    } catch {
      return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 })
    }

    const patient = await prisma.patient.findUnique({ where: { id: payload.patientId } })
    if (!patient || patient.email !== payload.email) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password.trim(), 12)
    await prisma.patient.update({
      where: { id: patient.id },
      data: { password: hashed },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error("Error in reset-password", { error: String(error) })
    return NextResponse.json({ error: "Erro ao redefinir senha" }, { status: 500 })
  }
}
