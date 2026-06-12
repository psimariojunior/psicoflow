import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { cancelPendingReminders } from "@/lib/notifications"
import { sendCancellationNotification } from "@/lib/email"
import { verifyPatientToken } from "@/lib/patient-auth"
import { sanitizeHtml } from "@/lib/security"
import { z } from "zod"
import { rateLimitMiddleware } from "@/lib/rate-limit"

const rateLimit = rateLimitMiddleware(10, 60000)

const cancelSchema = z.object({
  cancelReason: z.string().max(500).optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rateLimitResponse = rateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    const auth = request.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const token = await verifyPatientToken(auth.slice(7))
    if (!token) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id: params.id, patientId: token.patientId },
      include: { patient: { select: { name: true } }, psychologist: { select: { email: true, name: true } } },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 })
    }

    if (appointment.status === "CANCELLED") {
      return NextResponse.json({ error: "Consulta já cancelada" }, { status: 400 })
    }

    if (new Date(appointment.startTime) <= new Date()) {
      return NextResponse.json({ error: "Não é possível cancelar uma consulta que já passou" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = cancelSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const cancelReason = parsed.data.cancelReason ? sanitizeHtml(parsed.data.cancelReason) : null

    await prisma.appointment.update({
      where: { id: params.id },
      data: { status: "CANCELLED", cancelReason },
    })

    cancelPendingReminders(params.id).catch(
      (e) => logger.error("cancelPendingReminders failed", { error: String(e) })
    )

    const tz = "America/Sao_Paulo"
    const d = new Date(appointment.startTime)
    const dateStr = d.toLocaleDateString("pt-BR", { timeZone: tz, day: "numeric", month: "long", year: "numeric" })
    const timeStr = d.toLocaleTimeString("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit" })
    sendCancellationNotification(
      appointment.psychologist.email,
      appointment.patient.name,
      dateStr,
      timeStr,
      cancelReason
    ).catch((e) => logger.error("sendCancellationNotification failed", { error: String(e) }))

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error cancelling appointment", { error: String(error) })
    return NextResponse.json({ error: "Erro ao cancelar consulta" }, { status: 500 })
  }
}
