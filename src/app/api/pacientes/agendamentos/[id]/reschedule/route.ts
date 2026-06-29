import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { cancelPendingReminders, scheduleReminders } from "@/lib/notifications"
import { sendCancellationNotification, sendEmail } from "@/lib/email"
import { verifyPatientToken } from "@/lib/patient-auth"
import { sanitizeHtml } from "@/lib/security"
import { z } from "zod"
import { rateLimitMiddleware } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const rateLimit = rateLimitMiddleware(10, 60000)

const rescheduleSchema = z.object({
  newStartTime: z.string().datetime(),
  newEndTime: z.string().datetime(),
  reason: z.string().max(500).optional(),
})

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rateLimitResponse = await rateLimit(request)
    if (rateLimitResponse) return rateLimitResponse

    const auth = request.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const token = await verifyPatientToken(auth.slice(7))
    if (!token) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id: params.id, patientId: token.patientId },
      include: {
        patient: { select: { name: true, email: true } },
        psychologist: { select: { email: true, name: true, sessionDuration: true, sessionInterval: true } },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 })
    }

    if (appointment.status === "CANCELLED") {
      return NextResponse.json({ error: "Não é possível remarcar uma consulta cancelada" }, { status: 400 })
    }

    if (new Date(appointment.startTime) <= new Date()) {
      return NextResponse.json({ error: "Não é possível remarcar uma consulta que já passou" }, { status: 400 })
    }

    const body = await request.json()
    const parsed = rescheduleSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 })
    }

    const newStart = new Date(parsed.data.newStartTime)
    const newEnd = new Date(parsed.data.newEndTime)

    if (newStart <= new Date()) {
      return NextResponse.json({ error: "A nova data deve ser no futuro" }, { status: 400 })
    }

    if (newEnd <= newStart) {
      return NextResponse.json({ error: "Horário de fim deve ser após o início" }, { status: 400 })
    }

    const conflict = await prisma.appointment.findFirst({
      where: {
        psychologistId: appointment.psychologistId,
        id: { not: appointment.id },
        status: { notIn: ["CANCELLED"] },
        startTime: { lt: newEnd },
        endTime: { gt: newStart },
      },
    })

    if (conflict) {
      return NextResponse.json({ error: "Horário já ocupado. Escolha outro horário." }, { status: 409 })
    }

    const reason = parsed.data.reason ? sanitizeHtml(parsed.data.reason) : null

    await cancelPendingReminders(appointment.id).catch(
      (e) => logger.error("cancelPendingReminders failed", { error: String(e) })
    )

    await prisma.appointment.update({
      where: { id: params.id },
      data: {
        startTime: newStart,
        endTime: newEnd,
        notes: reason ? `Remarcado pelo paciente. Motivo: ${reason}` : appointment.notes,
      },
    })

    await scheduleReminders(appointment.id, appointment.patientId, appointment.psychologistId, newStart).catch(
      (e) => logger.error("scheduleReminders failed", { error: String(e) })
    )

    const tz = "America/Sao_Paulo"
    const oldDateStr = new Date(appointment.startTime).toLocaleDateString("pt-BR", { timeZone: tz, day: "numeric", month: "long" })
    const oldTimeStr = new Date(appointment.startTime).toLocaleTimeString("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit" })
    const newDateStr = newStart.toLocaleDateString("pt-BR", { timeZone: tz, day: "numeric", month: "long" })
    const newTimeStr = newStart.toLocaleTimeString("pt-BR", { timeZone: tz, hour: "2-digit", minute: "2-digit" })

    sendEmail(
      appointment.psychologist.email,
      `PsiHumanis — Consulta remarcada: ${appointment.patient.name}`,
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
        <p>Olá, <strong>${appointment.psychologist.name}</strong>,</p>
        <p>O paciente <strong>${appointment.patient.name}</strong> remarcou a consulta:</p>
        <p><strong>De:</strong> ${oldDateStr} às ${oldTimeStr}</p>
        <p><strong>Para:</strong> ${newDateStr} às ${newTimeStr}</p>
        ${reason ? `<p><strong>Motivo:</strong> ${reason}</p>` : ""}
      </div>`
    ).catch((e) => logger.error("sendEmail failed", { error: String(e) }))

    return NextResponse.json({
      success: true,
      message: `Consulta remarcada para ${newDateStr} às ${newTimeStr}`,
    })
  } catch (error) {
    logger.error("Error rescheduling appointment", { error: String(error) })
    return NextResponse.json({ error: "Erro ao remarcar consulta" }, { status: 500 })
  }
}
