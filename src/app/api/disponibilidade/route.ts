import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { z } from "zod"

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

    const slotSchema = z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string().min(1, "Horário início é obrigatório"),
      endTime: z.string().min(1, "Horário fim é obrigatório"),
      isActive: z.boolean().optional(),
    })

    const bodySchema = z.object({
      slots: z.array(slotSchema).min(0),
    })

    const raw = await request.json()
    const parsed = bodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }
    const { slots } = parsed.data

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
