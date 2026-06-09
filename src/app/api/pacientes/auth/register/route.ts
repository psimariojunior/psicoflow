import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import bcrypt from "bcryptjs"
import { signPatientToken } from "@/lib/patient-auth"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json()

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    const psychologist = await prisma.user.findFirst({
      where: { role: "PSYCHOLOGIST", active: true },
      orderBy: { createdAt: "asc" },
    })

    if (!psychologist) {
      return NextResponse.json({ error: "Nenhum psicólogo disponível" }, { status: 404 })
    }

    const existing = await prisma.patient.findFirst({
      where: { email: email.trim(), psychologistId: psychologist.id },
    })

    if (existing) {
      return NextResponse.json({ error: "Já existe uma conta com este email" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const patient = await prisma.patient.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        password: hashedPassword,
        psychologistId: psychologist.id,
      },
    })

    const token = await signPatientToken({ patientId: patient.id, email: patient.email })

    return NextResponse.json({
      token,
      patient: { id: patient.id, name: patient.name, email: patient.email, phone: patient.phone },
    })
  } catch (error) {
    logger.error("Error registering patient", { error: String(error) })
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 })
  }
}
