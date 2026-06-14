import { NextRequest } from "next/server"
import { verifyPatientToken, signPatientToken } from "@/lib/patient-auth"
import { logger } from "@/lib/logger"
import { apiError, apiSuccess } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return apiError("Token não fornecido", 401)
    }

    const payload = await verifyPatientToken(auth.slice(7))
    if (!payload) {
      return apiError("Token inválido ou expirado", 401)
    }

    const newToken = await signPatientToken({ patientId: payload.patientId, email: payload.email })

    return apiSuccess({ token: newToken })
  } catch (error) {
    logger.error("Error refreshing patient token", { error: String(error) })
    return apiError("Erro ao renovar token")
  }
}
