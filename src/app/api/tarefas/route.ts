import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get("patientId")
    const status = searchParams.get("status")

    const where: Record<string, unknown> = { psychologistId }
    if (patientId) where.patientId = patientId
    if (status) where.status = status

    const tasks = await prisma.therapyTask.findMany({
      where,
      include: {
        resource: {
          select: { id: true, name: true, type: true, category: true },
        },
        patient: {
          select: { id: true, name: true },
        },
      },
      orderBy: { assignedAt: "desc" },
    })

    return apiSuccess(tasks)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error fetching tasks", { error: String(error) })
    return apiError("Erro ao buscar tarefas")
  }
}
