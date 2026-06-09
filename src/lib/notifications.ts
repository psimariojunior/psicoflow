import { prisma } from "./prisma"
import { logger } from "./logger"
import { sendAppointmentReminderEmail } from "./email"
import { sendAppointmentReminderWhatsApp } from "./whatsapp"

export async function sendReminderNow(
  patientId: string,
  channel: string,
  psychologistName: string,
  appointmentDate?: string,
  appointmentTime?: string
): Promise<boolean> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { name: true, email: true, phone: true },
  })
  if (!patient) return false

  let success = false

  if (channel === "EMAIL" && patient.email) {
    success = await sendAppointmentReminderEmail(
      patient.email,
      patient.name,
      psychologistName,
      appointmentDate || "",
      appointmentTime || "",
      "Atendimento",
      "presential"
    )
  } else if (channel === "WHATSAPP" && patient.phone) {
    success = await sendAppointmentReminderWhatsApp(
      patient.phone,
      patient.name,
      appointmentDate || "",
      appointmentTime || ""
    )
  }

  return success
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

  let success = false

  if (notification.channel === "EMAIL" && patientEmail) {
    success = await sendAppointmentReminderEmail(
      patientEmail,
      patientName,
      psyName,
      "",
      "",
      "Atendimento",
      "presential"
    )
  } else if (notification.channel === "WHATSAPP" && patientPhone) {
    success = await sendAppointmentReminderWhatsApp(
      patientPhone,
      patientName,
      "",
      ""
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

export async function processPendingNotifications(): Promise<{ sent: number; failed: number }> {
  const pending = await prisma.notification.findMany({
    where: {
      status: "PENDING",
      scheduledAt: { lte: new Date() },
    },
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
