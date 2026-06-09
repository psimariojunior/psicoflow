import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { validate, createDiaryEntrySchema } from "@/lib/validation"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const entries = await prisma.emotionDiary.findMany({
      where: { psychologistId: (session.user as { id: string }).id },
      include: {
        patient: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      take: 50,
    })

    return NextResponse.json(entries)
  } catch (error) {
    logger.error("Error fetching diary entries", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar registros" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const { error } = validate(createDiaryEntrySchema, data)
    if (error) return error

    const diary = await prisma.emotionDiary.create({
      data: {
        mood: data.mood,
        date: data.date ? new Date(data.date) : new Date(),
        emotions: data.emotions || null,
        activities: data.activities || null,
        notes: data.notes || null,
        sleepHours: data.sleepHours ? data.sleepHours : null,
        sleepQuality: data.sleepQuality || null,
        anxietyLevel: data.anxietyLevel || null,
        patientId: data.patientId,
        psychologistId: (session.user as { id: string }).id,
      },
    })

    return NextResponse.json(diary, { status: 201 })
  } catch (error) {
    logger.error("Error creating diary entry", { error: String(error) })
    return NextResponse.json({ error: "Erro ao salvar registro" }, { status: 500 })
  }
}
