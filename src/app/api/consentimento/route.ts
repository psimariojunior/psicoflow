import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { verifyPatientToken } from "@/lib/patient-auth"
import { apiError, apiSuccess } from "@/lib/api-helpers"
import { z } from "zod"

const consentSchema = z.object({
  type: z.string().min(1, "Tipo é obrigatório").max(100),
  content: z.string().max(5000).optional().or(z.literal("")),
})

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  return verifyPatientToken(authHeader.slice(7))
}

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request)
    if (!payload) return apiError("Não autorizado", 401)

    const patient = await prisma.patient.findUnique({
      where: { id: payload.patientId },
      select: { psychologistId: true },
    })
    if (!patient) return apiError("Paciente não encontrado", 404)

    const consents = await prisma.consentLog.findMany({
      where: { patientId: payload.patientId, psychologistId: patient.psychologistId },
      orderBy: { createdAt: "desc" },
    })

    return apiSuccess(consents)
  } catch (error) {
    logger.error("Error fetching consents", { error: String(error) })
    return apiError("Erro ao buscar consentimentos")
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request)
    if (!payload) return apiError("Não autorizado", 401)

    const patient = await prisma.patient.findUnique({
      where: { id: payload.patientId },
      select: { psychologistId: true },
    })
    if (!patient) return apiError("Paciente não encontrado", 404)

    const body = await request.json()
    const result = consentSchema.safeParse(body)
    if (!result.success) {
      return apiError("Dados inválidos: " + result.error.issues.map(i => i.message).join(", "), 400)
    }

    const { type, content } = result.data

    const consent = await prisma.consentLog.create({
      data: {
        type: sanitizeHtml(type),
        consent: true,
        content: content ? sanitizeHtml(content) : null,
        signedAt: new Date(),
        ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
        userAgent: request.headers.get("user-agent") || null,
        patientId: payload.patientId,
        psychologistId: patient.psychologistId,
      },
    })

    return apiSuccess(consent, 201)
  } catch (error) {
    logger.error("Error signing consent", { error: String(error) })
    return apiError("Erro ao registrar consentimento")
  }
}
