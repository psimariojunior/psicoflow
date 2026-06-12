import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { validate, createRecordSchema } from "@/lib/validation"
import { sanitizeHtml } from "@/lib/security"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const records = await prisma.medicalRecord.findMany({
      where: { psychologistId: (session.user as { id: string }).id },
      include: {
        patient: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(records)
  } catch (error) {
    logger.error("Error fetching records", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar prontuários" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const { error } = validate(createRecordSchema, data)
    if (error) return error

    const psychologistId = (session.user as { id: string }).id

    const patient = await prisma.patient.findFirst({
      where: { id: data.patientId, psychologistId },
    })
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const record = await prisma.medicalRecord.create({
      data: {
        type: data.type || "SESSION_NOTE",
        title: sanitizeHtml(data.title),
        content: data.content ? sanitizeHtml(data.content) : "",
        isConfidential: data.isConfidential || false,
        patientId: data.patientId,
        psychologistId,
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    logger.error("Error creating record", { error: String(error) })
    return NextResponse.json({ error: "Erro ao criar prontuário" }, { status: 500 })
  }
}
