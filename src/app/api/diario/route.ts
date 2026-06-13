import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { validate, createDiaryEntrySchema } from "@/lib/validation"
import { sanitizeHtml } from "@/lib/security"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export async function GET() {
  try {
    const psychologistId = await requireAuth()

    const entries = await prisma.emotionDiary.findMany({
      where: { psychologistId },
      include: {
        patient: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      take: 50,
    })

    return apiSuccess(entries)
  } catch (error) {
    logger.error("Error fetching diary entries", { error: String(error) })
    return apiError("Erro ao buscar registros")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

    const data = await request.json()
    const { error } = validate(createDiaryEntrySchema, data)
    if (error) return error

    const diary = await prisma.emotionDiary.create({
      data: {
        mood: data.mood,
        date: data.date ? new Date(data.date) : new Date(),
        emotions: data.emotions ? sanitizeHtml(data.emotions) : null,
        activities: data.activities ? sanitizeHtml(data.activities) : null,
        notes: data.notes ? sanitizeHtml(data.notes) : null,
        sleepHours: data.sleepHours ? data.sleepHours : null,
        sleepQuality: data.sleepQuality ?? null,
        anxietyLevel: data.anxietyLevel || null,
        patientId: data.patientId,
        psychologistId,
      },
    })

    return apiSuccess(diary, 201)
  } catch (error) {
    logger.error("Error creating diary entry", { error: String(error) })
    return apiError("Erro ao salvar registro")
  }
}
