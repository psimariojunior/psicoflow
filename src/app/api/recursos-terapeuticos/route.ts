import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"
import { z } from "zod"

export const dynamic = "force-dynamic"

const createResourceSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255),
  description: z.string().max(2000).optional().or(z.literal("")),
  type: z.string().min(1, "Tipo é obrigatório").max(100),
  content: z.string().optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  tags: z.string().max(500).optional().or(z.literal("")),
  isPublic: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const category = searchParams.get("category")
    const search = searchParams.get("search")

    const where: Record<string, unknown> = { psychologistId }
    if (type) where.type = type
    if (category) where.category = category
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
      ]
    }

    const resources = await prisma.therapyResource.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    return apiSuccess(resources)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error fetching resources", { error: String(error) })
    return apiError("Erro ao buscar recursos terapêuticos")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

    const body = await request.json()
    const result = z.object({
      name: z.string().min(1).max(255),
      description: z.string().max(2000).optional().or(z.literal("")),
      type: z.string().min(1).max(100),
      content: z.string().optional().or(z.literal("")),
      category: z.string().max(100).optional().or(z.literal("")),
      tags: z.string().max(500).optional().or(z.literal("")),
      isPublic: z.boolean().optional(),
    }).safeParse(body)

    if (!result.success) {
      return apiError("Dados inválidos: " + result.error.issues.map(i => i.message).join(", "), 400)
    }

    const data = result.data

    const resource = await prisma.therapyResource.create({
      data: {
        name: sanitizeHtml(data.name),
        description: data.description ? sanitizeHtml(data.description) : null,
        type: sanitizeHtml(data.type),
        content: data.content ? sanitizeHtml(data.content) : null,
        category: data.category ? sanitizeHtml(data.category) : null,
        tags: data.tags ? sanitizeHtml(data.tags) : null,
        isPublic: data.isPublic ?? false,
        psychologistId,
      },
    })

    return apiSuccess(resource, 201)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error creating resource", { error: String(error) })
    return apiError("Erro ao criar recurso terapêutico")
  }
}
