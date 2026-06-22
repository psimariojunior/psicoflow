import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

const createAttachmentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(255),
  type: z.string().min(1, "Tipo é obrigatório").max(100),
  url: z.string().url("URL inválida").max(2048),
  size: z.number().int().positive().optional(),
  patientId: z.string().optional(),
  recordId: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

    const data = await request.json()
    const result = createAttachmentSchema.safeParse(data)
    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.issues.map((i) => i.message) },
        { status: 400 }
      )
    }

    const { name, type, url, size, patientId, recordId } = result.data

    if (patientId) {
      const patient = await prisma.patient.findFirst({
        where: { id: patientId, psychologistId },
        select: { id: true },
      })
      if (!patient) {
        return apiError("Paciente não encontrado", 404)
      }
    }

    if (recordId) {
      const record = await prisma.medicalRecord.findFirst({
        where: { id: recordId, psychologistId },
        select: { id: true },
      })
      if (!record) {
        return apiError("Prontuário não encontrado", 404)
      }
    }

    const attachment = await prisma.attachment.create({
      data: { name: sanitizeHtml(name), type: sanitizeHtml(type), url, size: size || null, patientId: patientId || null, recordId: recordId || null },
    })

    return apiSuccess(attachment, 201)
  } catch (error) {
    logger.error("Error uploading attachment", { error: String(error) })
    return apiError("Erro ao fazer upload")
  }
}
