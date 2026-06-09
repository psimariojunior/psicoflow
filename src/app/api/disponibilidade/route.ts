import { NextRequest, NextResponse } from "next/server"
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

    const psychologistId = (session.user as { id: string }).id
    const slots = await prisma.availabilitySlot.findMany({
      where: { psychologistId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })

    return NextResponse.json(slots)
  } catch (error) {
    logger.error("Error fetching availability", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar disponibilidade" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const psychologistId = (session.user as { id: string }).id
    const { slots } = await request.json()

    if (!Array.isArray(slots)) {
      return NextResponse.json({ error: "Formato inválido" }, { status: 400 })
    }

    for (const slot of slots) {
      if (
        typeof slot.dayOfWeek !== "number" ||
        slot.dayOfWeek < 0 ||
        slot.dayOfWeek > 6 ||
        !slot.startTime ||
        !slot.endTime
      ) {
        return NextResponse.json({ error: "Dados inválidos em um dos horários" }, { status: 400 })
      }
    }

    await prisma.$transaction([
      prisma.availabilitySlot.deleteMany({ where: { psychologistId } }),
      ...slots
        .filter((s) => s.isActive)
        .map((slot) =>
          prisma.availabilitySlot.create({
            data: {
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isActive: true,
              psychologistId,
            },
          })
        ),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error saving availability", { error: String(error) })
    return NextResponse.json({ error: "Erro ao salvar disponibilidade" }, { status: 500 })
  }
}
