import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/lib/google-calendar"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export async function POST(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: psychologistId },
      select: { googleRefreshToken: true, googleCalendarId: true },
    })

    if (!user?.googleRefreshToken || !user?.googleCalendarId) {
      return apiError("Google Calendar não está conectado", 400)
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        psychologistId,
        status: { notIn: ["CANCELLED"] },
        googleEventId: null,
        startTime: { gte: new Date() },
      },
      include: { patient: { select: { id: true, name: true, email: true } } },
      orderBy: { startTime: "asc" },
      take: 50,
    })

    let synced = 0
    let failed = 0

    for (const apt of appointments) {
      try {
        const eventId = await createCalendarEvent(
          user.googleRefreshToken,
          user.googleCalendarId,
          {
            summary: `${apt.title || "Sessão"} - ${apt.patient.name}`,
            description: `Paciente: ${apt.patient.name}\nStatus: ${apt.status}\nObservações: ${apt.notes || "—"}`,
            startTime: apt.startTime.toISOString(),
            endTime: apt.endTime.toISOString(),
            patientName: apt.patient.name,
            patientEmail: apt.patient.email || undefined,
            isOnline: apt.modality === "online",
          }
        )

        await prisma.appointment.update({
          where: { id: apt.id },
          data: { googleEventId: eventId },
        })

        synced++
      } catch (err) {
        logger.error("Failed to sync appointment", { appointmentId: apt.id, error: String(err) })
        failed++
      }
    }

    return apiSuccess({ synced, failed, total: appointments.length })
  } catch (error) {
    logger.error("Google Calendar sync error", { error: String(error) })
    return apiError("Erro ao sincronizar com Google Calendar")
  }
}
