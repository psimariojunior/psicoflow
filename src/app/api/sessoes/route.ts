import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { z } from "zod"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

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

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")

    const sessions = await prisma.therapySession.findMany({
      where: {
        psychologistId,
        ...(patientId ? { patientId } : {}),
      },
      include: {
        patient: { select: { id: true, name: true } },
        appointment: { select: { id: true, startTime: true } },
      },
      orderBy: { date: "desc" },
      take: patientId ? 200 : 50,
    })

    return apiSuccess(sessions)
  } catch (error) {
    logger.error("Error fetching sessions", { error: String(error) })
    return apiError("Erro ao buscar sessões")
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
