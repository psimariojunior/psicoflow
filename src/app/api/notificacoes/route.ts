import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendReminderNow } from "@/lib/notifications"
import { sanitizeHtml } from "@/lib/security"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

const notificationSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200),
  message: z.string().min(1, "Mensagem é obrigatória").max(2000),
  channel: z.enum(["email", "whatsapp", "both"]),
  patientId: z.string().optional(),
  appointmentDate: z.string().max(50).optional(),
  appointmentTime: z.string().max(50).optional(),
  patientEmail: z.string().email().max(255).optional().or(z.literal("")),
  patientPhone: z.string().max(20).optional().or(z.literal("")),
  patientName: z.string().max(120).optional().or(z.literal("")),
  sendLater: z.boolean().optional(),
  sendAt: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const psychologistId = await requireAuth()
    const { searchParams } = new URL(req.url)
    const channel = searchParams.get("channel")
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200)

    const where: Record<string, unknown> = { psychologistId }
    if (channel) where.channel = channel

    const notifications = await prisma.notification.findMany({
      where: where as any,
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    const patientIds = Array.from(new Set(notifications.map((n) => n.patientId).filter(Boolean))) as string[]
    const patients = patientIds.length > 0
      ? await prisma.patient.findMany({ where: { id: { in: patientIds } }, select: { id: true, name: true } })
      : []
    const patientMap = Object.fromEntries(patients.map((p) => [p.id, p.name]))

    const enriched = notifications.map((n) => ({
      ...n,
      patientName: n.patientId ? patientMap[n.patientId] || null : null,
    }))

    return apiSuccess(enriched)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error fetching notifications", { error: String(error) })
    return apiError("Erro ao buscar notificações")
  }
}

export async function PATCH(request: Request) {
  try {
    const psychologistId = await requireAuth()

    // Check if body has a notification id (individual mark-as-read)
    let body: Record<string, unknown> = {}
    try {
      body = await request.json()
    } catch {
      // No body — mark all
    }

    if (body.id && typeof body.id === "string") {
      // Mark individual notification as read
      await prisma.notification.updateMany({
        where: { id: body.id, psychologistId, readAt: null },
        data: { readAt: new Date() },
      })
      return apiSuccess({ ok: true })
    }

    // Mark all as read
    await prisma.notification.updateMany({
      where: { psychologistId, readAt: null },
      data: { readAt: new Date() },
    })
    return apiSuccess({ ok: true })
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error marking notifications as read", { error: String(error) })
    return apiError("Erro ao marcar notificações como lidas")
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return apiError("Não autorizado", 401)
    }

    const raw = await request.json()
    const parse = notificationSchema.safeParse(raw)
    if (!parse.success) {
      return NextResponse.json({
        error: "Dados inválidos",
        details: parse.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      }, { status: 400 })
    }

    const { title, message, channel, patientId, appointmentDate, appointmentTime, patientEmail, patientPhone, patientName, sendLater, sendAt } = parse.data
    const psychologistId = (session.user as { id: string }).id
    const psychologistName = (session.user as { name?: string }).name || "Psicólogo"

    const sanitizedTitle = sanitizeHtml(title.trim())
    const sanitizedMessage = sanitizeHtml(message.trim())

    if (sendLater && sendAt) {
      const notification = await prisma.notification.create({
        data: {
          title: sanitizedTitle,
          message: sanitizedMessage,
          channel,
          patientId: patientId || null,
          recipientId: patientId || null,
          psychologistId,
          status: "PENDING",
          scheduledAt: new Date(sendAt),
        },
      })
      return apiSuccess(notification, 201)
    }

    const notification = await prisma.notification.create({
      data: {
        title: sanitizedTitle,
        message: sanitizedMessage,
        channel,
        patientId: patientId || null,
        recipientId: patientId || null,
        psychologistId,
        status: "PENDING",
      },
    })

    const pid = patientId || ""
    const ch = channel as string
    const pn = psychologistName || ""
    const ad = appointmentDate || ""
    const at = appointmentTime || ""
    const result = await sendReminderNow(pid, ch, pn, ad, at, {
      email: patientEmail,
      phone: patientPhone,
      name: patientName,
    })

    const errorMessage = result.ok ? null : (result.error || "Falha no envio")

    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: result.ok ? "SENT" : "FAILED",
        sentAt: result.ok ? new Date() : null,
        errorMessage,
      },
    })

    if (!result.ok) {
      logger.error("[POST /api/notificacoes] send failed", { channel, patientId, error: result.error })
      return apiError(errorMessage || "Falha no envio", 500)
    }

    return apiSuccess({ ...notification, status: "SENT" }, 201)
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error creating notification", { error: String(error) })
    return apiError("Erro ao criar notificação")
  }
}
