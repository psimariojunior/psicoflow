import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const psychologistId = await requireAuth()
    const { id } = await params

    const patient = await prisma.patient.findFirst({
      where: { id, psychologistId },
      select: { id: true },
    })
    if (!patient) return apiError("Paciente não encontrado", 404)

    const consents = await prisma.consentLog.findMany({
      where: { patientId: id, psychologistId },
      orderBy: { createdAt: "desc" },
    })

    return apiSuccess(consents)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error fetching patient consents", { error: String(error) })
    return apiError("Erro ao buscar consentimentos do paciente")
  }
}
