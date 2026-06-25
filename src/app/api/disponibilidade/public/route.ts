import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { rateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const limiter = rateLimit(30, 60000)

export async function GET(request: NextRequest) {
  try {
    const rawIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "anon"
    const limit = await limiter(rawIp)
    if (!limit.allowed) {
      return NextResponse.json({ error: "Muitas requisições. Tente novamente." }, { status: 429 })
    }
    const searchParams = request.nextUrl.searchParams
    const psychologistId = searchParams.get("psychologistId")
    const startDateStr = searchParams.get("startDate")
    const endDateStr = searchParams.get("endDate")

    let psychologistIdFinal = psychologistId
    if (!psychologistIdFinal) {
      const firstPsychologist = await prisma.user.findFirst({
        where: { role: { in: ["PSYCHOLOGIST", "ADMIN"] }, active: true },
        orderBy: { createdAt: "asc" },
      })
      if (!firstPsychologist) {
        return NextResponse.json({ error: "Nenhum psicólogo disponível" }, { status: 404 })
      }
      psychologistIdFinal = firstPsychologist.id
    }

    const slots = await prisma.availabilitySlot.findMany({
      where: { psychologistId: psychologistIdFinal, isActive: true },
    })

    if (slots.length === 0) {
      return NextResponse.json({ availableDays: [] })
    }

    const startDate = startDateStr ? new Date(startDateStr) : new Date()
    const endDate = endDateStr ? new Date(endDateStr) : new Date(startDate)
    endDate.setDate(endDate.getDate() + 30)

    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        psychologistId: psychologistIdFinal,
        status: { in: ["SCHEDULED", "CONFIRMED"] },
        startTime: { gte: startDate, lte: endDate },
      },
      select: { startTime: true, endTime: true },
    })

    const busyRanges = existingAppointments.map((a) => ({
      start: new Date(a.startTime).getTime(),
      end: new Date(a.endTime).getTime(),
    }))

    const APPOINTMENT_DURATION = parseInt(process.env.APPOINTMENT_DURATION_MINUTES || "30", 10)
    const availableDays: {
      date: string
      dayOfWeek: number
      slots: { time: string; startTime: string; endTime: string }[]
    }[] = []

    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getUTCDay()
      const daySlots = slots.filter((s) => s.dayOfWeek === dayOfWeek)

      if (daySlots.length > 0) {
        const dateStr = currentDate.toISOString().split("T")[0]

        const timeSlots: { time: string; startTime: string; endTime: string }[] = []

        for (const slot of daySlots) {
          const [startH, startM] = slot.startTime.split(":").map(Number)
          const [endH, endM] = slot.endTime.split(":").map(Number)

          let currentMinutes = startH * 60 + startM
          const endMinutes = endH * 60 + endM

          while (currentMinutes + APPOINTMENT_DURATION <= endMinutes) {
            const slotStart = new Date(currentDate)
            const h = Math.floor(currentMinutes / 60)
            const m = currentMinutes % 60
            slotStart.setUTCHours(h + 3, m, 0, 0)
            const slotEnd = new Date(slotStart)
            slotEnd.setUTCMinutes(slotEnd.getUTCMinutes() + APPOINTMENT_DURATION)

            const slotStartTs = slotStart.getTime()
            const slotEndTs = slotEnd.getTime()

            const isBusy = busyRanges.some(
              (b) => slotStartTs < b.end && slotEndTs > b.start
            )

            if (!isBusy && slotStart > new Date()) {
              const time = `${String(Math.floor(currentMinutes / 60)).padStart(2, "0")}:${String(currentMinutes % 60).padStart(2, "0")}`
              timeSlots.push({
                time,
                startTime: slotStart.toISOString(),
                endTime: slotEnd.toISOString(),
              })
            }

            currentMinutes += APPOINTMENT_DURATION
          }
        }

        if (timeSlots.length > 0) {
          availableDays.push({
            date: dateStr,
            dayOfWeek,
            slots: timeSlots,
          })
        }
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    const response: Record<string, unknown> = { availableDays }
    if (psychologistId) {
      response.psychologistId = psychologistIdFinal
    }
    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, max-age=30, s-maxage=30, stale-while-revalidate=60" },
    })
  } catch (error) {
    logger.error("Error fetching public availability", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar horários disponíveis" }, { status: 500 })
  }
}
