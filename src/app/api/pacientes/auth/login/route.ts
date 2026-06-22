import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import bcrypt from "bcryptjs"
import { signPatientToken } from "@/lib/patient-auth"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import { validateOrigin } from "@/lib/csrf"
import { z } from "zod"

export const dynamic = "force-dynamic"

const loginSchema = z.object({
  email: z.string().email("Email inválido").max(255),
  password: z.string().min(1, "Senha é obrigatória").max(128),
})

export async function POST(request: NextRequest) {
  const rateLimit = rateLimitMiddleware(10, 60000)
  const blocked = await rateLimit(request)
  if (blocked) return blocked

  const originCheck = validateOrigin(request)
  if (!originCheck.allowed) return originCheck.error

  try {
    const raw = await request.json()
    const parsed = loginSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }
    const { email, password } = parsed.data

    const patient = await prisma.patient.findFirst({
      where: { email: email.trim() },
      include: { psychologist: true },
    })

    if (!patient || !patient.password) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, patient.password)
    if (!valid) {
      return NextResponse.json({ error: "Email ou senha inválidos" }, { status: 401 })
    }

    await prisma.patient.update({
      where: { id: patient.id },
      data: { lastLoginAt: new Date() },
    })

    const token = await signPatientToken({ patientId: patient.id, email: patient.email })

    return NextResponse.json({
      token,
      patient: { id: patient.id, name: patient.name, email: patient.email, phone: patient.phone },
    })
  } catch (error) {
    logger.error("Error logging in patient", { error: String(error) })
    return NextResponse.json({ error: "Erro ao fazer login" }, { status: 500 })
  }
}
