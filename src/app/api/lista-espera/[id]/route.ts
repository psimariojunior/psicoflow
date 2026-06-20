import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const entry = await prisma.waitingList.findFirst({
      where: { id: params.id, psychologistId },
    })

    if (!entry) return apiError("Registro não encontrado", 404)

    const body = await request.json()
    const { status } = body

    if (!["NOTIFIED", "REMOVED", "BOOKED"].includes(status)) {
      return apiError("Status inválido", 400)
    }

    const updated = await prisma.waitingList.update({
      where: { id: params.id },
      data: {
        status,
        notifiedAt: status === "NOTIFIED" ? new Date() : entry.notifiedAt,
      },
    })

    return apiSuccess(updated)
  } catch (error) {
    logger.error("Error updating waiting list entry", { error: String(error) })
    return apiError("Erro ao atualizar registro")
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const entry = await prisma.waitingList.findFirst({
      where: { id: params.id, psychologistId },
    })

    if (!entry) return apiError("Registro não encontrado", 404)

    await prisma.waitingList.delete({ where: { id: params.id } })

    return apiSuccess({ message: "Registro removido" })
  } catch (error) {
    logger.error("Error deleting waiting list entry", { error: String(error) })
    return apiError("Erro ao remover registro")
  }
}
