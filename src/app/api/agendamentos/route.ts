import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { validate, createAppointmentSchema } from "@/lib/validation"
import { scheduleReminders } from "@/lib/notifications"
import { sanitizeHtml } from "@/lib/security"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"
import { syncAppointmentToCalendar } from "@/lib/google-calendar"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const patientId = searchParams.get("patientId")

    const where: Prisma.AppointmentWhereInput = {
      psychologistId,
    }

    if (startDate && endDate) {
      where.startTime = { gte: new Date(startDate), lte: new Date(endDate) }
    }
    if (patientId) {
      where.patientId = patientId
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { startTime: "asc" },
    })

    return apiSuccess(appointments)
  } catch (error) {
    logger.error("Error fetching appointments", { error: String(error) })
    return apiError("Erro ao buscar agendamentos")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

    const data = await request.json()
    const { error } = validate(createAppointmentSchema, data)
    if (error) return error

    if (new Date(data.endTime) <= new Date(data.startTime)) {
      return apiError("Data/hora fim deve ser após data/hora início", 400)
    }

    const createSingleAppointment = async (
      startTime: Date, endTime: Date, index: number, total: number
    ) => {
      const appt = await prisma.appointment.create({
        data: {
          title: data.title ? sanitizeHtml(data.title) : null,
          startTime,
          endTime,
          type: data.type || null,
          modality: data.modality || "presential",
          notes: data.notes ? sanitizeHtml(data.notes) : null,
          price: data.price ? parseFloat(String(data.price)) : null,
          color: data.color || null,
          status: "SCHEDULED",
          patientId: data.patientId,
          psychologistId,
          isRecurring: total > 1,
          recurringRule: total > 1 ? JSON.stringify({ index, total }) : null,
        },
        include: {
          patient: { select: { id: true, name: true, email: true, phone: true } },
        },
      })

      scheduleReminders(appt.id, appt.patientId, psychologistId, appt.startTime).catch(
        (e) => logger.error("scheduleReminders failed", { error: String(e) })
      )
      syncAppointmentToCalendar(psychologistId, appt as Parameters<typeof syncAppointmentToCalendar>[1]).catch(() => {})

      return appt
    }

    const duration = new Date(data.endTime).getTime() - new Date(data.startTime).getTime()

    if (data.isRecurring && data.recurringRule) {
      let rule: { frequency: string; occurrences: number }
      try { rule = JSON.parse(data.recurringRule) } catch {
        return apiError("Regra de recorrência inválida", 400)
      }
      const intervalDays = rule.frequency === "weekly" ? 7 : 14
      const maxOccurrences = Math.min(rule.occurrences || 4, 52)
      const results = []
      for (let i = 0; i < maxOccurrences; i++) {
        const start = new Date(data.startTime)
        start.setDate(start.getDate() + i * intervalDays)
        const end = new Date(start.getTime() + duration)
        results.push(await createSingleAppointment(start, end, i + 1, maxOccurrences))
      }
      return apiSuccess(results, 201)
    }

    const appointment = await createSingleAppointment(
      new Date(data.startTime), new Date(data.endTime), 1, 1
    )
    return apiSuccess(appointment, 201)
  } catch (error) {
    logger.error("Error creating appointment", { error: String(error) })
    return apiError("Erro ao criar agendamento")
  }
}
