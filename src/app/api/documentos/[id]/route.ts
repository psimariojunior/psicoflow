import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { logAudit, sanitizeHtml } from "@/lib/security"
import { validate, updateDocumentTemplateSchema } from "@/lib/validation"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const template = await prisma.documentTemplate.findFirst({
      where: { id: params.id, psychologistId },
    })

    if (!template) return apiError("Modelo não encontrado", 404)

    return apiSuccess(template)
  } catch (error) {
    logger.error("Error fetching document template", { error: String(error) })
    return apiError("Erro ao buscar modelo de documento")
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const existing = await prisma.documentTemplate.findFirst({
      where: { id: params.id, psychologistId },
    })
    if (!existing) return apiError("Modelo não encontrado", 404)

    const data = await request.json()
    const { error, data: parsed } = validate(updateDocumentTemplateSchema, data)
    if (error) return error

    const updated = await prisma.documentTemplate.update({
      where: { id: params.id },
      data: {
        ...(parsed!.name !== undefined ? { name: sanitizeHtml(parsed!.name) } : {}),
        ...(parsed!.category !== undefined ? { category: sanitizeHtml(parsed!.category || "geral") } : {}),
        ...(parsed!.content !== undefined ? { content: parsed!.content } : {}),
      },
    })

    await logAudit(
      psychologistId,
      "UPDATE",
      "DocumentTemplate",
      updated.id,
      `Modelo de documento "${updated.name}" atualizado`
    )

    return apiSuccess(updated)
  } catch (error) {
    logger.error("Error updating document template", { error: String(error) })
    return apiError("Erro ao atualizar modelo de documento")
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const existing = await prisma.documentTemplate.findFirst({
      where: { id: params.id, psychologistId },
    })
    if (!existing) return apiError("Modelo não encontrado", 404)

    await prisma.documentTemplate.delete({ where: { id: params.id } })

    await logAudit(
      psychologistId,
      "DELETE",
      "DocumentTemplate",
      params.id,
      `Modelo de documento "${existing.name}" removido`
    )

    return apiSuccess({ message: "Modelo removido" })
  } catch (error) {
    logger.error("Error deleting document template", { error: String(error) })
    return apiError("Erro ao remover modelo de documento")
  }
}
