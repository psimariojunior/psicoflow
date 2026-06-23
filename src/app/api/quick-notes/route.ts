import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"
import { sanitizeHtml } from "@/lib/security"

export const dynamic = "force-dynamic"

const createSchema = z.object({
  content: z.string().min(1, "Conteúdo é obrigatório").max(2000),
  patientId: z.string().max(120).optional().or(z.literal("")),
})

export async function GET(req: Request) {
  try {
    const psychologistId = await requireAuth()
    const { searchParams } = new URL(req.url)
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200)

    const notes = await prisma.quickNote.findMany({
      where: { psychologistId },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return apiSuccess(notes)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error fetching quick notes", { error: String(error) })
    return apiError("Erro ao buscar anotações")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()
    const raw = await request.json()
    const parse = createSchema.safeParse(raw)
    if (!parse.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: parse.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
        },
        { status: 400 }
      )
    }

    const content = sanitizeHtml(parse.data.content.trim())
    const patientId = parse.data.patientId || null

    const note = await prisma.quickNote.create({
      data: {
        content,
        psychologistId,
        patientId,
      },
    })

    return apiSuccess(note, 201)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error creating quick note", { error: String(error) })
    return apiError("Erro ao criar anotação")
  }
}

export async function DELETE(req: Request) {
  try {
    const psychologistId = await requireAuth()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) return apiError("ID é obrigatório", 400)

    const existing = await prisma.quickNote.findFirst({ where: { id, psychologistId } })
    if (!existing) return apiError("Anotação não encontrada", 404)

    await prisma.quickNote.delete({ where: { id } })
    return apiSuccess({ ok: true })
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error deleting quick note", { error: String(error) })
    return apiError("Erro ao excluir anotação")
  }
}
