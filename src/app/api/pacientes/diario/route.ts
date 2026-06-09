import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import * as jose from "jose"

async function verifyPatient(request: Request) {
  const auth = request.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) return null
  const secret = new TextEncoder().encode(process.env.ENCRYPTION_KEY || "fallback-dev-key-change-in-production")
  try {
    const { payload } = await jose.jwtVerify(auth.slice(7), secret)
    return payload as { patientId: string }
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const token = await verifyPatient(request)
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
    const token = await verifyPatient(request)
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

    const data = await request.json()
    const mood = parseInt(data.mood)
    if (isNaN(mood) || mood < 1 || mood > 5) {
      return NextResponse.json({ error: "Humor deve ser entre 1 e 5" }, { status: 400 })
    }

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
          mood,
          emotions: data.emotions || existing.emotions,
          activities: data.activities || existing.activities,
          notes: data.notes !== undefined ? data.notes : existing.notes,
          sleepHours: data.sleepHours !== undefined ? data.sleepHours : existing.sleepHours,
          sleepQuality: data.sleepQuality || existing.sleepQuality,
          anxietyLevel: data.anxietyLevel || existing.anxietyLevel,
        },
      })
      return NextResponse.json(updated)
    }

    const entry = await prisma.emotionDiary.create({
      data: {
        mood,
        date: new Date(),
        emotions: data.emotions || null,
        activities: data.activities || null,
        notes: data.notes || null,
        sleepHours: data.sleepHours || null,
        sleepQuality: data.sleepQuality || null,
        anxietyLevel: data.anxietyLevel || null,
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
