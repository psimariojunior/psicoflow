import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { z } from "zod"

const createSessionSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  date: z.string().optional(),
  type: z.string().max(100).optional(),
  subjective: z.string().max(5000).optional(),
  objective: z.string().max(5000).optional(),
  assessment: z.string().max(5000).optional(),
  plan: z.string().max(5000).optional(),
  notes: z.string().max(5000).optional(),
  moodBefore: z.union([z.number().int().min(0).max(10), z.string()]).optional(),
  moodAfter: z.union([z.number().int().min(0).max(10), z.string()]).optional(),
  tags: z.string().max(500).optional(),
  isRemote: z.boolean().optional(),
  appointmentId: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const sessions = await prisma.therapySession.findMany({
      where: { psychologistId: (session.user as { id: string }).id },
      include: {
        patient: { select: { id: true, name: true } },
        appointment: { select: { id: true, startTime: true } },
      },
      orderBy: { date: "desc" },
      take: 50,
    })

    return NextResponse.json(sessions)
  } catch (error) {
    logger.error("Error fetching sessions", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar sessões" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const result = createSessionSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.issues.map((i) => i.message) },
        { status: 400 }
      )
    }

    const data = result.data

    const patientExists = await prisma.patient.findFirst({
      where: { id: data.patientId, psychologistId: (session.user as { id: string }).id },
      select: { id: true },
    })
    if (!patientExists) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const therapySession = await prisma.therapySession.create({
      data: {
        status: "SCHEDULED",
        date: data.date ? new Date(data.date) : new Date(),
        type: data.type ? sanitizeHtml(data.type) : null,
        subjective: data.subjective ? sanitizeHtml(data.subjective) : null,
        objective: data.objective ? sanitizeHtml(data.objective) : null,
        assessment: data.assessment ? sanitizeHtml(data.assessment) : null,
        plan: data.plan ? sanitizeHtml(data.plan) : null,
        notes: data.notes ? sanitizeHtml(data.notes) : null,
        moodBefore: data.moodBefore != null ? Number(data.moodBefore) : null,
        moodAfter: data.moodAfter != null ? Number(data.moodAfter) : null,
        tags: data.tags ? sanitizeHtml(data.tags) : null,
        isRemote: data.isRemote || false,
        appointmentId: data.appointmentId || null,
        patientId: data.patientId,
        psychologistId: (session.user as { id: string }).id,
      },
      include: {
        patient: { select: { id: true, name: true, cpf: true, phone: true, email: true } },
      },
    })

    return NextResponse.json(therapySession, { status: 201 })
  } catch (error) {
    logger.error("Error creating session", { error: String(error) })
    return NextResponse.json({ error: "Erro ao criar sessão" }, { status: 500 })
  }
}
