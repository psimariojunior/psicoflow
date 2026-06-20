import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const receipt = await prisma.receipt.findFirst({
      where: { id: params.id, psychologistId },
      include: { patient: { select: { id: true, name: true, email: true } } },
    })

    if (!receipt) return apiError("Recibo não encontrado", 404)

    return apiSuccess(receipt)
  } catch (error) {
    logger.error("Error fetching receipt", { error: String(error) })
    return apiError("Erro ao buscar recibo")
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const receipt = await prisma.receipt.findFirst({
      where: { id: params.id, psychologistId },
    })

    if (!receipt) return apiError("Recibo não encontrado", 404)
    if (receipt.status === "CANCELLED") return apiError("Recibo já cancelado", 400)

    const updated = await prisma.receipt.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    })

    return apiSuccess(updated)
  } catch (error) {
    logger.error("Error cancelling receipt", { error: String(error) })
    return apiError("Erro ao cancelar recibo")
  }
}
