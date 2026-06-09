import { prisma } from "./prisma"
import { logger } from "./logger"
import { sendAppointmentReminderEmail } from "./email"
import { sendAppointmentReminderWhatsApp } from "./whatsapp"

interface AppointmentInfo {
  id: string
  startTime: Date
  type: string | null
  modality: string | null
  patient: { id: string; name: string; email: string | null; phone: string | null }
  psychologist: { id: string; name: string }
}

export async function scheduleReminders(appointment: AppointmentInfo): Promise<void> {
  const start = new Date(appointment.startTime)
  const now = new Date()
  const reminders = [
    { label: "24h antes", offset: 24 * 60 * 60 * 1000 },
    { label: "1h antes", offset: 60 * 60 * 1000 },
  ]

  for (const r of reminders) {
    const scheduledAt = new Date(start.getTime() - r.offset)
    if (scheduledAt <= now) continue

    const channels = ["EMAIL"]
    if (appointment.patient.phone) channels.push("WHATSAPP")

    for (const channel of channels) {
      await prisma.notification.create({
        data: {
          title: `Lembrete de consulta (${r.label})`,
          message: `Lembrete para ${appointment.patient.name}: consulta em ${start.toLocaleDateString("pt-BR")} às ${start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
          channel,
          status: "PENDING",
          scheduledAt,
          patientId: appointment.patient.id,
          recipientId: appointment.patient.id,
          psychologistId: appointment.psychologist.id,
          appointmentId: appointment.id,
        },
      })
    }
  }

  logger.info("Reminders scheduled", { appointmentId: appointment.id })
}

export async function cancelPendingReminders(appointmentId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { appointmentId, status: "PENDING" },
    data: { status: "CANCELLED" },
  })
  logger.info("Pending reminders cancelled", { appointmentId })
}

export async function dispatchNotification(notificationId: string): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      appointment: {
        select: {
          startTime: true,
          type: true,
          modality: true,
          psychologist: { select: { id: true, name: true } },
          patient: { select: { name: true, email: true, phone: true } },
        },
      },
    },
  })

  if (!notification) {
    logger.warn("Notification not found", { notificationId })
    return
  }

  const appt = notification.appointment
  if (!appt) {
    logger.warn("Notification has no linked appointment", { notificationId })
    return
  }

  let success = false
  const start = appt.startTime
  const dateStr = start.toLocaleDateString("pt-BR")
  const timeStr = start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  if (notification.channel === "EMAIL" && appt.patient.email) {
    success = await sendAppointmentReminderEmail(
      appt.patient.email,
      appt.patient.name,
      appt.psychologist.name,
      dateStr,
      timeStr,
      appt.type || "Atendimento",
      appt.modality || "presential"
    )
  } else if (notification.channel === "WHATSAPP" && appt.patient.phone) {
    success = await sendAppointmentReminderWhatsApp(
      appt.patient.phone,
      appt.patient.name,
      dateStr,
      timeStr
    )
  } else {
    logger.warn("Cannot dispatch notification: missing contact or channel", {
      notificationId,
      channel: notification.channel,
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

export async function processPendingNotifications(): Promise<{ sent: number; failed: number }> {
  const pending = await prisma.notification.findMany({
    where: {
      status: "PENDING",
      scheduledAt: { lte: new Date() },
      appointment: {
        startTime: { gte: new Date() },
        status: { not: "CANCELLED" },
      },
    },
    include: {
      appointment: {
        select: {
          startTime: true,
          type: true,
          modality: true,
          psychologist: { select: { name: true } },
          patient: { select: { name: true, email: true, phone: true } },
        },
      },
    },
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
