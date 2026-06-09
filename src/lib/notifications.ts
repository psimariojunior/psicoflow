import { prisma } from "./prisma"
import { logger } from "./logger"
import { sendAppointmentReminderEmail } from "./email"
import { sendAppointmentReminderWhatsApp } from "./whatsapp"

export async function sendReminderNow(
  patientId: string,
  channel: string,
  psychologistName: string,
  appointmentDate?: string,
  appointmentTime?: string,
  overrides?: { email?: string | null; phone?: string | null; name?: string }
): Promise<{ ok: boolean; error?: string }> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { name: true, email: true, phone: true },
  })
  if (!patient) {
    const msg = `Paciente não encontrado (${patientId})`
    console.error("[sendReminderNow]", msg)
    return { ok: false, error: msg }
  }

  const patientEmail = overrides?.email ? overrides.email : patient.email
  const patientPhone = overrides?.phone ? overrides.phone : patient.phone
  const patientName = overrides?.name || patient.name

  console.log("[sendReminderNow] request", {
    patientId, channel, patientName,
    dbEmail: patient.email,
    overrideEmail: overrides?.email,
    patientEmail,
    dbPhone: patient.phone,
    overridePhone: overrides?.phone,
    patientPhone,
  })

  if (channel === "EMAIL") {
    if (!patientEmail) {
      const msg = "Paciente não tem e-mail cadastrado"
      console.error("[sendReminderNow]", msg, { patientId, patientName })
      return { ok: false, error: msg }
    }
    const ok = await sendAppointmentReminderEmail(
      patientEmail, patientName, psychologistName,
      appointmentDate || "", appointmentTime || "", "Atendimento", "presential"
    )
    console.log("[sendReminderNow] EMAIL result", { patientId, ok })
    return ok ? { ok: true } : { ok: false, error: "Falha ao enviar e-mail" }
  }

  if (channel === "WHATSAPP") {
    const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const waToken = process.env.WHATSAPP_API_TOKEN
    if (!waPhoneId || !waToken) {
      console.log("[sendReminderNow] WHATSAPP not configured, skipping")
      return { ok: true }
    }
    if (!patientPhone) {
      const msg = "Paciente não tem WhatsApp cadastrado"
      console.error("[sendReminderNow]", msg, { patientId, patientName })
      return { ok: false, error: msg }
    }
    const ok = await sendAppointmentReminderWhatsApp(patientPhone, patientName, appointmentDate || "", appointmentTime || "")
    console.log("[sendReminderNow] WHATSAPP result", { patientId, ok })
    return ok ? { ok: true } : { ok: false, error: "Falha ao enviar WhatsApp" }
  }

  return { ok: false, error: `Canal desconhecido: ${channel}` }
}

export async function dispatchNotification(
  notificationId: string,
  overrides?: { psychologistName?: string }
): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  })

  if (!notification) {
    logger.warn("Notification not found", { notificationId })
    return
  }

  const psyName = overrides?.psychologistName || "Psicólogo"

  let patientName = "Paciente"
  let patientEmail: string | null = null
  let patientPhone: string | null = null
  let appointmentDate = ""
  let appointmentTime = ""

  if (notification.patientId) {
    const patient = await prisma.patient.findUnique({
      where: { id: notification.patientId },
      select: { name: true, email: true, phone: true },
    })
    if (patient) {
      patientName = patient.name
      patientEmail = patient.email
      patientPhone = patient.phone
    }
  }

  if (notification.externalId) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: notification.externalId },
      select: { startTime: true },
    })
    if (appointment) {
      const d = new Date(appointment.startTime)
      const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
      appointmentDate = `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`
      appointmentTime = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    }
  }

  let success = false

  if (notification.channel === "EMAIL" && patientEmail) {
    success = await sendAppointmentReminderEmail(
      patientEmail,
      patientName,
      psyName,
      appointmentDate,
      appointmentTime,
      "Atendimento",
      "presential"
    )
  } else if (notification.channel === "WHATSAPP" && patientPhone) {
    success = await sendAppointmentReminderWhatsApp(
      patientPhone,
      patientName,
      appointmentDate,
      appointmentTime
    )
  } else {
    logger.warn("Cannot dispatch notification", {
      notificationId,
      channel: notification.channel,
      hasEmail: !!patientEmail,
      hasPhone: !!patientPhone,
    })
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: success ? "SENT" : "FAILED",
      sentAt: success ? new Date() : null,
      errorMessage: success ? null : "Falha no envio",
    },
  })
}

export async function scheduleReminders(
  appointmentId: string,
  patientId: string,
  psychologistId: string,
  startTime: Date
): Promise<void> {
  const now = new Date()

  const remindAt = [
    new Date(startTime.getTime() - 24 * 60 * 60 * 1000),
    new Date(startTime.getTime() - 60 * 60 * 1000),
  ]

  for (const scheduledAt of remindAt) {
    if (scheduledAt <= now) continue
    for (const channel of ["EMAIL", "WHATSAPP"]) {
      await prisma.notification.create({
        data: {
          title: "Lembrete de consulta",
          message: "Lembrete automático de consulta",
          channel,
          status: "PENDING",
          scheduledAt,
          patientId,
          recipientId: patientId,
          psychologistId,
          externalId: appointmentId,
        },
      })
    }
  }
}

export async function cancelPendingReminders(appointmentId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { externalId: appointmentId, status: "PENDING" },
    data: { status: "CANCELLED" },
  })
}

export async function processPendingNotifications(force = false): Promise<{ sent: number; failed: number }> {
  const where: any = { status: "PENDING" }
  if (!force) {
    where.scheduledAt = { lte: new Date() }
  }
  const pending = await prisma.notification.findMany({
    where,
    select: { id: true },
  })

  let sent = 0
  let failed = 0

  for (const n of pending) {
    try {
      await dispatchNotification(n.id)
      sent++
    } catch (err) {
      logger.error("Error dispatching notification", { id: n.id, error: String(err) })
      failed++
    }
  }

  if (pending.length > 0) {
    logger.info("Notifications processed", { total: pending.length, sent, failed })
  }

  return { sent, failed }
}
