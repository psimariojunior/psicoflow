import { NextResponse } from "next/server"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"
import { checkPlanAccess } from "@/lib/check-plan"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const userId = await requireAuth()
    const result = await checkPlanAccess(userId)
    return apiSuccess(result)
  } catch (error) {
    console.error("Error checking plan access:", error)
    return apiError("Erro ao verificar acesso do plano")
  }
}
