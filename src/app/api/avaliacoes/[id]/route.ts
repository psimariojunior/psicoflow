import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { validate, updateReviewSchema } from "@/lib/validation"
import {
  requireAuth,
  isAuthError,
  apiError,
  apiSuccess,
} from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const existing = await prisma.review.findFirst({
      where: { id: params.id, psychologistId },
    })
    if (!existing) return apiError("Avaliação não encontrada", 404)

    const body = await request.json()
    const { error, data: parsed } = validate(updateReviewSchema, body)
    if (error) return error

    const updated = await prisma.review.update({
      where: { id: params.id },
      data: {
        ...(parsed!.approved !== undefined ? { approved: parsed!.approved } : {}),
      },
    })

    return apiSuccess(updated)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error updating review", { error: String(error) })
    return apiError("Erro ao atualizar avaliação")
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const existing = await prisma.review.findFirst({
      where: { id: params.id, psychologistId },
    })
    if (!existing) return apiError("Avaliação não encontrada", 404)

    await prisma.review.delete({ where: { id: params.id } })

    return apiSuccess({ message: "Avaliação removida" })
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error deleting review", { error: String(error) })
    return apiError("Erro ao remover avaliação")
  }
}
