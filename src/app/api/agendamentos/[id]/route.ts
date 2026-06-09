import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { scheduleReminders, cancelPendingReminders } from "@/lib/notifications"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const existing = await prisma.appointment.findFirst({
      where: { id: params.id, psychologistId: (session.user as { id: string }).id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 })
    }

    const data = await request.json()
    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: data.status ?? existing.status,
        startTime: data.startTime ? new Date(data.startTime) : existing.startTime,
        endTime: data.endTime ? new Date(data.endTime) : existing.endTime,
        type: data.type ?? existing.type,
        modality: data.modality ?? existing.modality,
        notes: data.notes ?? existing.notes,
        price: data.price !== undefined ? parseFloat(data.price) : existing.price,
      },
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true } },
      },
    })

    const newStatus = data.status ?? existing.status
    if (newStatus === "CANCELLED") {
      cancelPendingReminders(params.id).catch((err) => logger.error("Failed to cancel reminders", { appointmentId: params.id, error: String(err) }))
    } else if (existing.status === "SCHEDULED" && newStatus === "CONFIRMED") {
      scheduleReminders({
        ...existing,
        ...updated,
        psychologist: { id: (session.user as { id: string }).id, name: (session.user as { name: string }).name },
      }).catch((err) => logger.error("Failed to schedule reminders", { appointmentId: params.id, error: String(err) }))
    }

    return NextResponse.json(updated)
  } catch (error) {
    logger.error("Error updating appointment", { error: String(error) })
    return NextResponse.json({ error: "Erro ao atualizar agendamento" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const existing = await prisma.appointment.findFirst({
      where: { id: params.id, psychologistId: (session.user as { id: string }).id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 })
    }

    await prisma.appointment.delete({ where: { id: params.id } })
    cancelPendingReminders(params.id).catch((err) => logger.error("Failed to cancel reminders after delete", { appointmentId: params.id, error: String(err) }))
    return NextResponse.json({ message: "Agendamento cancelado com sucesso" })
  } catch (error) {
    logger.error("Error deleting appointment", { error: String(error) })
    return NextResponse.json({ error: "Erro ao cancelar agendamento" }, { status: 500 })
  }
}
