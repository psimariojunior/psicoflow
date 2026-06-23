import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { logAudit, sanitizeHtml } from "@/lib/security"
import { validate, createDocumentTemplateSchema } from "@/lib/validation"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()

    const search = request.nextUrl.searchParams.get("search") || ""
    const category = request.nextUrl.searchParams.get("category")

    const where: Record<string, unknown> = { psychologistId }
    if (category) where.category = category
    if (search) where.name = { contains: search }

    const templates = await prisma.documentTemplate.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    })

    return apiSuccess({ templates })
  } catch (error) {
    logger.error("Error fetching document templates", { error: String(error) })
    return apiError("Erro ao buscar modelos de documentos")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

    const data = await request.json()
    const { error, data: parsed } = validate(createDocumentTemplateSchema, data)
    if (error) return error

    const template = await prisma.documentTemplate.create({
      data: {
        name: sanitizeHtml(parsed!.name),
        category: sanitizeHtml(parsed!.category || "geral"),
        content: parsed!.content,
        psychologistId,
      },
    })

    await logAudit(
      psychologistId,
      "CREATE",
      "DocumentTemplate",
      template.id,
      `Modelo de documento "${template.name}" criado`
    )

    return apiSuccess(template, 201)
  } catch (error) {
    logger.error("Error creating document template", { error: String(error) })
    return apiError("Erro ao criar modelo de documento")
  }
}
