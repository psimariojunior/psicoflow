import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { requireAuth, apiSuccess, apiError } from "@/lib/api-helpers"
import { z } from "zod"

const createSessionSchema = z.object({
  patientId: z.string(),
  date: z.string().optional(),
  type: z.string().optional(),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
  notes: z.string().optional(),
  moodBefore: z.number().int().min(0).max(10).optional(),
  moodAfter: z.number().int().min(0).max(10).optional(),
  tags: z.string().optional(),
  isRemote: z.boolean().optional(),
  appointmentId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const cursor = searchParams.get("cursor")
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100)

    const where: Record<string, unknown> = { psychologistId }
    if (patientId) where.patientId = patientId

    const sessions = await prisma.therapySession.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true } },
        appointment: { select: { id: true, startTime: true } },
      },
      orderBy: { date: "desc" },
      take: patientId ? 200 : limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const hasMore = !patientId && sessions.length > limit
    const items = hasMore ? sessions.slice(0, limit) : sessions
    const nextCursor = hasMore ? items[items.length - 1]?.id : null

    return apiSuccess({ data: items, nextCursor, hasMore: !!nextCursor })
  } catch (error) {
    logger.error("Error listing sessions", { error: String(error) })
    return apiError("Erro ao listar sessões")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

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
      where: { id: data.patientId, psychologistId },
      select: { id: true },
    })
    if (!patientExists) {
      return apiError("Paciente não encontrado", 404)
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
        psychologistId,
      },
      include: {
        patient: { select: { id: true, name: true, cpf: true, phone: true, email: true } },
      },
    })

    return apiSuccess(therapySession, 201)
  } catch (error) {
    logger.error("Error creating session", { error: String(error) })
    return apiError("Erro ao criar sessão")
  }
}
