import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { verifyPatientToken } from "@/lib/patient-auth"

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  return verifyPatientToken(authHeader.slice(7))
}

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request)
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: payload.patientId },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const { password: _, ...patientSafe } = patient

    return NextResponse.json({
      ...patientSafe,
      dateOfBirth: patient.dateOfBirth?.toISOString() ?? null,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
    })
  } catch (error) {
    logger.error("Error fetching patient", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = await authenticate(request)
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { name, cpf, rg, dateOfBirth, gender, maritalStatus, profession, company, address, neighborhood, city, state, zipCode, phone, emergencyContact, emergencyPhone, healthInsurance, insuranceNumber, observations } = body

    const patient = await prisma.patient.update({
      where: { id: payload.patientId },
      data: {
        name: name?.trim(),
        cpf: cpf?.trim() || null,
        rg: rg?.trim() || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : dateOfBirth === null ? null : undefined,
        gender: gender || null,
        maritalStatus: maritalStatus || null,
        profession: profession?.trim() || null,
        company: company?.trim() || null,
        address: address?.trim() || null,
        neighborhood: neighborhood?.trim() || null,
        city: city?.trim() || null,
        state: state || null,
        zipCode: zipCode?.trim() || null,
        phone: phone?.trim() || null,
        emergencyContact: emergencyContact?.trim() || null,
        emergencyPhone: emergencyPhone?.trim() || null,
        healthInsurance: healthInsurance?.trim() || null,
        insuranceNumber: insuranceNumber?.trim() || null,
        observations: observations?.trim() || null,
      },
    })

    const { password: _, ...patientSafe } = patient

    return NextResponse.json({
      ...patientSafe,
      dateOfBirth: patient.dateOfBirth?.toISOString() ?? null,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
    })
  } catch (error) {
    logger.error("Error updating patient", { error: String(error) })
    return NextResponse.json({ error: "Erro ao atualizar dados" }, { status: 500 })
  }
}
