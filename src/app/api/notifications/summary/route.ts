import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const psychologistId = await requireAuth()
    const now = new Date()
    const brtNow = new Date(now.getTime() - 3 * 3600000)
    const currentYear = brtNow.getUTCFullYear()
    const currentMonth = brtNow.getUTCMonth()
    const startOfToday = new Date(Date.UTC(currentYear, currentMonth, brtNow.getUTCDate()))
    const endOfToday = new Date(startOfToday.getTime() + 86400000)

    const [todaysAppointments, pendingInvoices, unreadNotifications] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          psychologistId,
          startTime: { gte: startOfToday, lt: endOfToday },
          status: { notIn: ["CANCELLED"] },
        },
        include: { patient: { select: { id: true, name: true } } },
        orderBy: { startTime: "asc" },
        take: 10,
      }),
      prisma.invoice.findMany({
        where: { psychologistId, status: "PENDING" },
        include: { patient: { select: { id: true, name: true } } },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
      prisma.notification.findMany({
        where: { psychologistId, readAt: null, status: { in: ["SENT", "PENDING"] } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

    const pendingPayments = pendingInvoices.map((inv) => ({
      id: inv.id,
      number: inv.number,
      patientName: inv.patient.name,
      amount: inv.totalAmount,
      dueDate: inv.dueDate,
    }))

    const appointments = todaysAppointments.map((apt) => ({
      id: apt.id,
      patientName: apt.patient.name,
      startTime: apt.startTime,
      status: apt.status,
      modality: apt.modality || "presential",
    }))

    const unread = unreadNotifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      channel: n.channel,
      status: n.status,
      createdAt: n.createdAt,
    }))

    const unconfirmedToday = todaysAppointments.filter((a) => a.status === "SCHEDULED").length
    const unreadCount = unreadNotifications.length
    const total = unconfirmedToday + pendingPayments.length + unreadCount

    return apiSuccess({
      appointments,
      pendingPayments,
      unread,
      unreadCount,
      total,
    })
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error fetching notification summary", { error: String(error) })
    return apiError("Erro ao buscar resumo de notificações")
  }
}
