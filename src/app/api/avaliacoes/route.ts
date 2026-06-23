import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { validate, createReviewSchema } from "@/lib/validation"
import { apiError, apiSuccess } from "@/lib/api-helpers"
import { rateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const reviewLimiter = rateLimit(5, 3600000)

export async function GET(request: NextRequest) {
  try {
    const psychologistId = request.nextUrl.searchParams.get("psychologistId")
    const where: Record<string, unknown> = { approved: true }
    if (psychologistId) where.psychologistId = psychologistId

    const [reviews, aggregate] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ])

    return apiSuccess({
      reviews,
      average: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : 0,
      total: aggregate._count.rating,
    })
  } catch (error) {
    logger.error("Error fetching reviews", { error: String(error) })
    return apiError("Erro ao buscar avaliações")
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "anon"
    const limit = await reviewLimiter(rawIp)
    if (!limit.allowed) {
      return apiError("Muitas avaliações enviadas. Tente novamente mais tarde.", 429)
    }

    const data = await request.json()
    const { error, data: parsed } = validate(createReviewSchema, data)
    if (error) return error

    const psychologist = await prisma.user.findFirst({
      where: { id: parsed!.psychologistId, role: "PSYCHOLOGIST", active: true },
      select: { id: true },
    })
    if (!psychologist) return apiError("Psicólogo não encontrado", 404)

    const review = await prisma.review.create({
      data: {
        psychologistId: parsed!.psychologistId,
        patientName: sanitizeHtml(parsed!.patientName),
        rating: parsed!.rating,
        comment: sanitizeHtml(parsed!.comment),
        approved: false,
      },
    })

    return apiSuccess(
      { id: review.id, message: "Avaliação enviada com sucesso. Será exibida após aprovação." },
      201
    )
  } catch (error) {
    logger.error("Error creating review", { error: String(error) })
    return apiError("Erro ao enviar avaliação")
  }
}
