import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import bcrypt from "bcryptjs"
import { signPatientToken } from "@/lib/patient-auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 })
    }

    const psychologist = await prisma.user.findFirst({
      where: { role: "PSYCHOLOGIST", active: true },
      orderBy: { createdAt: "asc" },
    })

    if (!psychologist) {
      return NextResponse.json({ error: "Nenhum psicólogo disponível" }, { status: 404 })
    }

    const patient = await prisma.patient.findFirst({
      where: { email: email.trim(), psychologistId: psychologist.id },
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
