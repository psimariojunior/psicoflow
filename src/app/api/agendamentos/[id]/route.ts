import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { scheduleReminders, cancelPendingReminders } from "@/lib/notifications"
import { z } from "zod"

const updateAppointmentSchema = z.object({
  status: z.enum(["SCHEDULED", "CONFIRMED", "CANCELLED", "COMPLETED", "DELETE"]).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  type: z.string().max(100).optional(),
  modality: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
  price: z.union([z.string(), z.number()]).optional(),
})

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

    const body = await request.json()
    const result = updateAppointmentSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.issues.map((i) => i.message) },
        { status: 400 }
      )
    }

    const data = result.data
    const updated = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: data.status ?? existing.status,
        startTime: data.startTime ? new Date(data.startTime) : existing.startTime,
        endTime: data.endTime ? new Date(data.endTime) : existing.endTime,
        type: data.type ?? existing.type,
        modality: data.modality ?? existing.modality,
        notes: data.notes ?? existing.notes,
        price: data.price !== undefined ? (typeof data.price === "string" ? parseFloat(data.price) : data.price) : existing.price,
      },
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true } },
      },
    })

    if (data.status === "CONFIRMED") {
      scheduleReminders(updated.id, updated.patientId, updated.psychologistId, updated.startTime).catch(
        (e) => logger.error("scheduleReminders failed", { error: String(e) })
      )
    } else if (data.status === "CANCELLED" || data.status === "DELETE") {
      cancelPendingReminders(updated.id).catch(
        (e) => logger.error("cancelPendingReminders failed", { error: String(e) })
      )
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

    cancelPendingReminders(params.id).catch(
      (e) => logger.error("cancelPendingReminders failed", { error: String(e) })
    )
    await prisma.appointment.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Agendamento cancelado com sucesso" })
  } catch (error) {
    logger.error("Error deleting appointment", { error: String(error) })
    return NextResponse.json({ error: "Erro ao cancelar agendamento" }, { status: 500 })
  }
}
