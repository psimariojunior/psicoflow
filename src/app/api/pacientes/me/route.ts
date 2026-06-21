import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { verifyPatientToken } from "@/lib/patient-auth"
import { validate, updatePatientSelfSchema } from "@/lib/validation"
import { sanitizeHtml } from "@/lib/security"

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

    const raw = await request.json()
    const result = validate(updatePatientSelfSchema, raw)
    if (result.error) return result.error

    const data = result.data! as Record<string, unknown>
    const textFields = ["name", "gender", "maritalStatus", "profession", "address", "neighborhood", "city", "state", "emergencyContact", "healthInsurance", "insuranceNumber", "referredBy", "observations", "company"] as const
    for (const field of textFields) {
      if (typeof data[field] === "string") {
        data[field] = sanitizeHtml(data[field] as string)
      }
    }

    const patient = await prisma.patient.update({
      where: { id: payload.patientId },
      data,
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
