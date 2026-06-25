import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const secret = body.secret || request.headers.get("x-seed-secret")

    if (secret !== "psihumanis-seed-2026") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const psychologist = await prisma.user.findFirst({
      where: { role: { in: ["PSYCHOLOGIST", "ADMIN"] }, active: true },
      orderBy: { createdAt: "asc" },
    })

    if (!psychologist) {
      return NextResponse.json({ error: "No psychologist found" }, { status: 404 })
    }

    const existingSlots = await prisma.availabilitySlot.count({
      where: { psychologistId: psychologist.id },
    })

    if (existingSlots > 0) {
      return NextResponse.json({
        message: "Availability already configured",
        slots: existingSlots,
        psychologist: psychologist.name,
      })
    }

    const slots = [
      { dayOfWeek: 1, startTime: "08:00", endTime: "12:00", isActive: true },
      { dayOfWeek: 1, startTime: "14:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 2, startTime: "08:00", endTime: "12:00", isActive: true },
      { dayOfWeek: 2, startTime: "14:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 3, startTime: "08:00", endTime: "12:00", isActive: true },
      { dayOfWeek: 3, startTime: "14:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 4, startTime: "08:00", endTime: "12:00", isActive: true },
      { dayOfWeek: 4, startTime: "14:00", endTime: "18:00", isActive: true },
      { dayOfWeek: 5, startTime: "08:00", endTime: "12:00", isActive: true },
      { dayOfWeek: 5, startTime: "14:00", endTime: "18:00", isActive: true },
    ]

    await prisma.$transaction([
      prisma.availabilitySlot.deleteMany({ where: { psychologistId: psychologist.id } }),
      ...slots.map((slot) =>
        prisma.availabilitySlot.create({
          data: { ...slot, psychologistId: psychologist.id },
        })
      ),
    ])

    logger.info("Availability seeded", { psychologistId: psychologist.id, slots: slots.length })

    return NextResponse.json({
      message: "Availability configured successfully",
      psychologist: psychologist.name,
      psychologistId: psychologist.id,
      slotsCreated: slots.length,
      schedule: "Seg-Sex: 08:00-12:00 e 14:00-18:00",
    })
  } catch (error) {
    logger.error("Error seeding availability", { error: String(error) })
    return NextResponse.json({ error: "Error seeding availability" }, { status: 500 })
  }
}
