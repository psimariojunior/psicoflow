import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logAudit, sanitizeHtml } from "@/lib/security"
import { validate, updatePatientSchema } from "@/lib/validation"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const patient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        psychologistId,
      },
      include: {
        appointments: {
          orderBy: { startTime: "desc" },
          take: 10,
        },
        medicalRecords: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        therapySessions: {
          orderBy: { date: "desc" },
          take: 20,
        },
      },
    })

    if (!patient) {
      return apiError("Paciente não encontrado", 404)
    }

    return apiSuccess(patient)
  } catch (error) {
    console.error("Error fetching patient:", error)
    return apiError("Erro ao buscar paciente")
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const raw = await request.json()
    const result = validate(updatePatientSchema, raw)
    if (result.error) return result.error

    const data = result.data! as Record<string, unknown>
    const textFields = ["name", "gender", "maritalStatus", "profession", "address", "neighborhood", "city", "state", "emergencyContact", "healthInsurance", "insuranceNumber", "referredBy", "observations", "company"] as const
    for (const field of textFields) {
      if (typeof data[field] === "string") {
        data[field] = sanitizeHtml(data[field] as string)
      }
    }

    const patient = await prisma.patient.update({
      where: {
        id: params.id,
        psychologistId,
      },
      data,
    })

    await logAudit(
      psychologistId,
      "UPDATE",
      "Patient",
      patient.id,
      `Paciente ${patient.name} atualizado`
    )

    return apiSuccess(patient)
  } catch (error) {
    console.error("Error updating patient:", error)
    return apiError("Erro ao atualizar paciente")
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const patient = await prisma.patient.findFirst({
      where: { id: params.id, psychologistId },
    })
    if (!patient) {
      return apiError("Paciente não encontrado", 404)
    }

    await prisma.$transaction([
      prisma.medicalRecord.deleteMany({ where: { patientId: params.id, psychologistId } }),
      prisma.therapySession.deleteMany({ where: { patientId: params.id, psychologistId } }),
      prisma.appointment.deleteMany({ where: { patientId: params.id, psychologistId } }),
      prisma.invoice.deleteMany({ where: { patientId: params.id, psychologistId } }),
      prisma.emotionDiary.deleteMany({ where: { patientId: params.id, psychologistId } }),
      prisma.consentLog.deleteMany({ where: { patientId: params.id, psychologistId } }),
      prisma.financialTransaction.deleteMany({ where: { patientId: params.id, psychologistId } }),
      prisma.attachment.deleteMany({ where: { patientId: params.id } }),
      prisma.notification.deleteMany({ where: { patientId: params.id } }),
      prisma.patient.delete({ where: { id: params.id } }),
    ])

    await logAudit(
      psychologistId,
      "DELETE",
      "Patient",
      params.id,
      "Paciente removido"
    )

    return apiSuccess({ message: "Paciente removido com sucesso" })
  } catch (error) {
    console.error("Error deleting patient:", error)
    return apiError("Erro ao remover paciente")
  }
}
