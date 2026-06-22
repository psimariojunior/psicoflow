import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const psychologistId = await requireAuth()

    const entries = await prisma.waitingList.findMany({
      where: { psychologistId },
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return apiSuccess(entries)
  } catch (error) {
    logger.error("Error fetching waiting list", { error: String(error) })
    return apiError("Erro ao buscar lista de espera")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

    const body = await request.json()
    const { patientName, patientEmail, patientPhone, preferredDay, preferredTime, notes } = body

    if (!patientName || !patientName.trim()) {
      return apiError("Nome do paciente é obrigatório", 400)
    }

    const entry = await prisma.waitingList.create({
      data: {
        patientName: patientName.trim(),
        patientEmail: patientEmail || null,
        patientPhone: patientPhone || null,
        preferredDay: preferredDay || null,
        preferredTime: preferredTime || null,
        notes: notes || null,
        psychologistId,
      },
    })

    return apiSuccess(entry, 201)
  } catch (error) {
    logger.error("Error adding to waiting list", { error: String(error) })
    return apiError("Erro ao adicionar à lista de espera")
  }
}
