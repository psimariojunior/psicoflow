import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logAudit, sanitizeHtml } from "@/lib/security"
import { validate, updatePatientSchema } from "@/lib/validation"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const patient = await prisma.patient.findFirst({
      where: {
        id: params.id,
        psychologistId: (session.user as { id: string }).id,
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
      return NextResponse.json(
        { error: "Paciente não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(patient)
  } catch (error) {
    console.error("Error fetching patient:", error)
    return NextResponse.json(
      { error: "Erro ao buscar paciente" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

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
        psychologistId: (session.user as { id: string }).id,
      },
      data,
    })

    await logAudit(
      (session.user as { id: string }).id,
      "UPDATE",
      "Patient",
      patient.id,
      `Paciente ${patient.name} atualizado`
    )

    return NextResponse.json(patient)
  } catch (error) {
    console.error("Error updating patient:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar paciente" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const psychologistId = (session.user as { id: string }).id

    const patient = await prisma.patient.findFirst({
      where: { id: params.id, psychologistId },
    })
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
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

    return NextResponse.json({ message: "Paciente removido com sucesso" })
  } catch (error) {
    console.error("Error deleting patient:", error)
    return NextResponse.json(
      { error: "Erro ao remover paciente" },
      { status: 500 }
    )
  }
}
