import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"
import { z } from "zod"

const assignTaskSchema = z.object({
  resourceId: z.string().min(1, "ResourceId é obrigatório"),
  notes: z.string().max(2000).optional().or(z.literal("")),
})

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

    const tasks = await prisma.therapyTask.findMany({
      where: { patientId: id, psychologistId },
      include: {
        resource: {
          select: { id: true, name: true, type: true, category: true },
        },
      },
      orderBy: { assignedAt: "desc" },
    })

    return apiSuccess(tasks)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error fetching tasks", { error: String(error) })
    return apiError("Erro ao buscar tarefas")
  }
}

export async function POST(
  request: Request,
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

    const body = await request.json()
    const result = assignTaskSchema.safeParse(body)
    if (!result.success) {
      return apiError("Dados inválidos: " + result.error.issues.map(i => i.message).join(", "), 400)
    }

    const { resourceId, notes } = result.data

    const resource = await prisma.therapyResource.findFirst({
      where: { id: resourceId, psychologistId },
      select: { id: true },
    })
    if (!resource) return apiError("Recurso não encontrado", 404)

    const task = await prisma.therapyTask.create({
      data: {
        status: "PENDING",
        notes: notes ? sanitizeHtml(notes) : null,
        resourceId,
        patientId: id,
        psychologistId,
      },
      include: {
        resource: {
          select: { id: true, name: true, type: true, category: true },
        },
      },
    })

    await prisma.notification.create({
      data: {
        title: "Novo recurso terapêutico",
        message: `Você recebeu um novo recurso: ${task.resource.name}`,
        channel: "IN_APP",
        status: "PENDING",
        psychologistId,
        patientId: id,
      },
    })

    return apiSuccess(task, 201)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error assigning task", { error: String(error) })
    return apiError("Erro ao atribuir tarefa")
  }
}
