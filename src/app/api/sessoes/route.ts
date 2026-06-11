import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

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

    const data = await request.json()

    const therapySession = await prisma.therapySession.create({
      data: {
        status: "SCHEDULED",
        date: data.date ? new Date(data.date) : new Date(),
        type: data.type || null,
        subjective: data.subjective || null,
        objective: data.objective || null,
        assessment: data.assessment || null,
        plan: data.plan || null,
        notes: data.notes || null,
        moodBefore: data.moodBefore ? parseInt(data.moodBefore) : null,
        moodAfter: data.moodAfter ? parseInt(data.moodAfter) : null,
        tags: data.tags || null,
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
