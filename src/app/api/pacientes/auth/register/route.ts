import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import bcrypt from "bcryptjs"
import { signPatientToken } from "@/lib/patient-auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password, cpf, rg, dateOfBirth, gender, maritalStatus, profession, company, address, neighborhood, city, state, zipCode, emergencyContact, emergencyPhone, healthInsurance, insuranceNumber, referredBy, howFound, observations } = body

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
        cpf: cpf?.trim() || null,
        rg: rg?.trim() || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        maritalStatus: maritalStatus || null,
        profession: profession?.trim() || null,
        company: company?.trim() || null,
        address: address?.trim() || null,
        neighborhood: neighborhood?.trim() || null,
        city: city?.trim() || null,
        state: state || null,
        zipCode: zipCode?.trim() || null,
        emergencyContact: emergencyContact?.trim() || null,
        emergencyPhone: emergencyPhone?.trim() || null,
        healthInsurance: healthInsurance?.trim() || null,
        insuranceNumber: insuranceNumber?.trim() || null,
        referredBy: referredBy?.trim() || null,
        howFound: howFound?.trim() || null,
        observations: observations?.trim() || null,
        psychologistId: psychologist.id,
      },
    })

    const token = await signPatientToken({ patientId: patient.id, email: patient.email })

    const { password: _, ...patientSafe } = patient

    return NextResponse.json({
      token,
      patient: {
        ...patientSafe,
        dateOfBirth: patient.dateOfBirth?.toISOString() ?? null,
        createdAt: patient.createdAt.toISOString(),
        updatedAt: patient.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    logger.error("Error registering patient", { error: String(error) })
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 })
  }
}
