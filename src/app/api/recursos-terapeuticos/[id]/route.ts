import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"
import { z } from "zod"

export const dynamic = "force-dynamic"

const updateResourceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional().or(z.literal("")),
  type: z.string().min(1).max(100).optional(),
  content: z.string().optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  tags: z.string().max(500).optional().or(z.literal("")),
  isPublic: z.boolean().optional(),
})

async function getResourceOrFail(id: string, psychologistId: string) {
  const resource = await prisma.therapyResource.findFirst({
    where: { id, psychologistId },
  })
  if (!resource) return null
  return resource
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const psychologistId = await requireAuth()
    const { id } = await params

    const resource = await getResourceOrFail(id, psychologistId)
    if (!resource) return apiError("Recurso não encontrado", 404)

    return apiSuccess(resource)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error fetching resource", { error: String(error) })
    return apiError("Erro ao buscar recurso")
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const psychologistId = await requireAuth()
    const { id } = await params

    const existing = await getResourceOrFail(id, psychologistId)
    if (!existing) return apiError("Recurso não encontrado", 404)

    const body = await request.json()
    const result = updateResourceSchema.safeParse(body)
    if (!result.success) {
      return apiError("Dados inválidos: " + result.error.issues.map(i => i.message).join(", "), 400)
    }

    const data = result.data
    const updateData: Record<string, unknown> = {}

    if (data.name !== undefined) updateData.name = sanitizeHtml(data.name)
    if (data.description !== undefined) updateData.description = data.description ? sanitizeHtml(data.description) : null
    if (data.type !== undefined) updateData.type = sanitizeHtml(data.type)
    if (data.content !== undefined) updateData.content = data.content ? sanitizeHtml(data.content) : null
    if (data.category !== undefined) updateData.category = data.category ? sanitizeHtml(data.category) : null
    if (data.tags !== undefined) updateData.tags = data.tags ? sanitizeHtml(data.tags) : null
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic

    const updated = await prisma.therapyResource.update({
      where: { id },
      data: updateData,
    })

    return apiSuccess(updated)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error updating resource", { error: String(error) })
    return apiError("Erro ao atualizar recurso")
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const psychologistId = await requireAuth()
    const { id } = await params

    const existing = await getResourceOrFail(id, psychologistId)
    if (!existing) return apiError("Recurso não encontrado", 404)

    await prisma.therapyResource.delete({ where: { id } })

    return apiSuccess({ message: "Recurso removido com sucesso" })
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error deleting resource", { error: String(error) })
    return apiError("Erro ao remover recurso")
  }
}
