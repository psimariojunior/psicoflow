import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const psychologistId = await requireAuth()
    const { id } = await params

    const task = await prisma.therapyTask.findFirst({
      where: { id, psychologistId },
    })
    if (!task) return apiError("Tarefa não encontrada", 404)

    const updated = await prisma.therapyTask.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completedAt: new Date(),
      },
      include: {
        resource: {
          select: { id: true, name: true, type: true, category: true },
        },
      },
    })

    return apiSuccess(updated)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error completing task", { error: String(error) })
    return apiError("Erro ao concluir tarefa")
  }
}
