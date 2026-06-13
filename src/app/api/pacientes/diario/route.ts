import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { verifyPatientToken } from "@/lib/patient-auth"
import { sanitizeHtml } from "@/lib/security"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import { z } from "zod"

const rateLimit = rateLimitMiddleware(10, 60000)

const diarySchema = z.object({
  mood: z.number().int().min(1).max(5),
  emotions: z.string().max(500).optional(),
  activities: z.string().max(1000).optional(),
  notes: z.string().max(2000).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().int().min(1).max(10).optional(),
  anxietyLevel: z.number().int().min(1).max(10).optional(),
})

export async function GET(request: Request) {
  try {
    const rateLimitResponse = await rateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    const auth = request.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const token = await verifyPatientToken(auth.slice(7))
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: token.patientId },
      select: { psychologistId: true },
    })
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const entries = await prisma.emotionDiary.findMany({
      where: { patientId: token.patientId, psychologistId: patient.psychologistId },
      orderBy: { date: "desc" },
      take: 100,
    })

    return NextResponse.json(entries)
  } catch (error) {
    logger.error("Error fetching patient diary", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar diário" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await rateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    const auth = request.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const token = await verifyPatientToken(auth.slice(7))
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: token.patientId },
      select: { psychologistId: true },
    })
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const body = await request.json()
    const parsed = diarySchema.safeParse(body)
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      return NextResponse.json({ error: "Dados inválidos", details: errors }, { status: 400 })
    }

    const data = parsed.data
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const existing = await prisma.emotionDiary.findFirst({
      where: {
        patientId: token.patientId,
        date: { gte: today, lt: tomorrow },
      },
    })

    if (existing) {
      const updated = await prisma.emotionDiary.update({
        where: { id: existing.id },
        data: {
          mood: data.mood,
          emotions: data.emotions ? sanitizeHtml(data.emotions) : existing.emotions,
          activities: data.activities ? sanitizeHtml(data.activities) : existing.activities,
          notes: data.notes !== undefined ? sanitizeHtml(data.notes) : existing.notes,
          sleepHours: data.sleepHours !== undefined ? data.sleepHours : existing.sleepHours,
          sleepQuality: data.sleepQuality !== undefined ? data.sleepQuality : existing.sleepQuality,
          anxietyLevel: data.anxietyLevel !== undefined ? data.anxietyLevel : existing.anxietyLevel,
        },
      })
      return NextResponse.json(updated)
    }

    const entry = await prisma.emotionDiary.create({
      data: {
        mood: data.mood,
        date: new Date(),
        emotions: data.emotions ? sanitizeHtml(data.emotions) : null,
        activities: data.activities ? sanitizeHtml(data.activities) : null,
        notes: data.notes ? sanitizeHtml(data.notes) : null,
        sleepHours: data.sleepHours ?? null,
        sleepQuality: data.sleepQuality ?? null,
        anxietyLevel: data.anxietyLevel ?? null,
        patientId: token.patientId,
        psychologistId: patient.psychologistId,
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    logger.error("Error creating diary entry", { error: String(error) })
    return NextResponse.json({ error: "Erro ao salvar diário" }, { status: 500 })
  }
}
