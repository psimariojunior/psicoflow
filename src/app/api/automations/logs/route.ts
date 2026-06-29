import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"))
    const status = searchParams.get("status") || undefined
    const triggerType = searchParams.get("triggerType") || undefined
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { psychologistId }
    if (status) where.status = status
    if (triggerType) where.triggerType = triggerType

    const [logs, total] = await Promise.all([
      prisma.automationLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          automation: { select: { id: true, name: true } },
        },
      }),
      prisma.automationLog.count({ where }),
    ])

    return apiSuccess({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    return apiError("Erro ao buscar logs")
  }
}
