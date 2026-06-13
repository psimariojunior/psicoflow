import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { z } from "zod"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export async function GET() {
  try {
    const psychologistId = await requireAuth()
    const slots = await prisma.availabilitySlot.findMany({
      where: { psychologistId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    })

    return apiSuccess(slots)
  } catch (error) {
    logger.error("Error fetching availability", { error: String(error) })
    return apiError("Erro ao buscar disponibilidade")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

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
      return apiError("Dados inválidos", 400)
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

    return apiSuccess({ success: true })
  } catch (error) {
    logger.error("Error saving availability", { error: String(error) })
    return apiError("Erro ao salvar disponibilidade")
  }
}
