import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { validate, createAppointmentSchema } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const patientId = searchParams.get("patientId")

    const where: Record<string, unknown> = {
      psychologistId: (session.user as { id: string }).id,
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
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { startTime: "asc" },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    logger.error("Error fetching appointments", { error: String(error) })
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const { error } = validate(createAppointmentSchema, data)
    if (error) return error

    if (new Date(data.endTime) <= new Date(data.startTime)) {
      return NextResponse.json({ error: "Data/hora fim deve ser após data/hora início" }, { status: 400 })
    }

    const appointment = await prisma.appointment.create({
      data: {
        title: data.title || null,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        type: data.type || null,
        modality: data.modality || "presential",
        notes: data.notes || null,
        price: data.price ? parseFloat(data.price) : null,
        color: data.color || null,
        status: "SCHEDULED",
        patientId: data.patientId,
        psychologistId: (session.user as { id: string }).id,
      },
      include: {
        patient: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    logger.error("Error creating appointment", { error: String(error) })
    return NextResponse.json(
      { error: "Erro ao criar agendamento" },
      { status: 500 }
    )
  }
}
