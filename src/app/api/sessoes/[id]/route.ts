import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

async function getSessionById(id: string, psychologistId: string) {
  return prisma.therapySession.findFirst({
    where: { id, psychologistId },
    include: {
      patient: {
        select: { id: true, name: true, cpf: true, phone: true, email: true, dateOfBirth: true, gender: true, address: true, neighborhood: true, city: true, state: true, profession: true, observations: true },
      },
      appointment: { select: { id: true, startTime: true, endTime: true, modality: true, status: true } },
    },
  })
}

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const therapySession = await getSessionById(params.id, (session.user as { id: string }).id)
    if (!therapySession) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
    }

    return NextResponse.json(therapySession)
  } catch (error) {
    logger.error("Error fetching session", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar sessão" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const psychologistId = (session.user as { id: string }).id
    const existing = await prisma.therapySession.findFirst({
      where: { id: params.id, psychologistId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
    }

    const body = await request.json()
    const { action, subjective, objective, assessment, plan, notes, moodBefore, moodAfter, tags, type, isRemote } = body

    const now = new Date()

    if (action === "start") {
      const updated = await prisma.therapySession.update({
        where: { id: params.id },
        data: { status: "IN_PROGRESS", startedAt: now },
        include: { patient: { select: { id: true, name: true } } },
      })
      await prisma.appointment.updateMany({
        where: { id: existing.appointmentId ?? "", psychologistId },
        data: { status: "IN_PROGRESS" },
      })
      return NextResponse.json(updated)
    }

    if (action === "pause") {
      if (existing.status !== "IN_PROGRESS") {
        return NextResponse.json({ error: "Sessão não está em andamento" }, { status: 400 })
      }
      const elapsed = existing.startedAt ? Math.floor((now.getTime() - existing.startedAt.getTime()) / 1000) : 0
      const totalPaused = (existing.pausedSeconds ?? 0) + elapsed
      const updated = await prisma.therapySession.update({
        where: { id: params.id },
        data: { status: "PAUSED", pausedSeconds: totalPaused, duration: totalPaused },
        include: { patient: { select: { id: true, name: true } } },
      })
      return NextResponse.json(updated)
    }

    if (action === "resume") {
      if (existing.status !== "PAUSED") {
        return NextResponse.json({ error: "Sessão não está pausada" }, { status: 400 })
      }
      const updated = await prisma.therapySession.update({
        where: { id: params.id },
        data: { status: "IN_PROGRESS", startedAt: now },
        include: { patient: { select: { id: true, name: true } } },
      })
      return NextResponse.json(updated)
    }

    if (action === "end") {
      if (existing.status !== "IN_PROGRESS" && existing.status !== "PAUSED") {
        return NextResponse.json({ error: "Sessão não está ativa" }, { status: 400 })
      }

      // Calculate total elapsed time
      let totalSeconds = existing.pausedSeconds ?? 0
      if (existing.status === "IN_PROGRESS" && existing.startedAt) {
        totalSeconds += Math.floor((now.getTime() - existing.startedAt.getTime()) / 1000)
      }

      const updated = await prisma.therapySession.update({
        where: { id: params.id },
        data: {
          status: "COMPLETED",
          endedAt: now,
          duration: totalSeconds,
          subjective: subjective ?? existing.subjective,
          objective: objective ?? existing.objective,
          assessment: assessment ?? existing.assessment,
          plan: plan ?? existing.plan,
          notes: notes ?? existing.notes,
          moodBefore: moodBefore !== undefined ? moodBefore : existing.moodBefore,
          moodAfter: moodAfter !== undefined ? moodAfter : existing.moodAfter,
          tags: tags ?? existing.tags,
          type: type ?? existing.type,
          isRemote: isRemote ?? existing.isRemote,
        },
        include: { patient: { select: { id: true, name: true } } },
      })

      await prisma.appointment.updateMany({
        where: { id: existing.appointmentId ?? "", psychologistId },
        data: { status: "COMPLETED" },
      })

      return NextResponse.json(updated)
    }

    // Draft save (no action) - update all provided fields
    const updated = await prisma.therapySession.update({
      where: { id: params.id },
      data: {
        subjective: subjective !== undefined ? subjective : existing.subjective,
        objective: objective !== undefined ? objective : existing.objective,
        assessment: assessment !== undefined ? assessment : existing.assessment,
        plan: plan !== undefined ? plan : existing.plan,
        notes: notes !== undefined ? notes : existing.notes,
        moodBefore: moodBefore !== undefined ? moodBefore : existing.moodBefore,
        moodAfter: moodAfter !== undefined ? moodAfter : existing.moodAfter,
        tags: tags !== undefined ? tags : existing.tags,
        type: type ?? existing.type,
        isRemote: isRemote ?? existing.isRemote,
      },
      include: { patient: { select: { id: true, name: true } } },
    })

    return NextResponse.json(updated)
  } catch (error) {
    logger.error("Error updating session", { error: String(error) })
    return NextResponse.json({ error: "Erro ao atualizar sessão" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const existing = await prisma.therapySession.findFirst({
      where: { id: params.id, psychologistId: (session.user as { id: string }).id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Sessão não encontrada" }, { status: 404 })
    }

    await prisma.therapySession.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Sessão removida" })
  } catch (error) {
    logger.error("Error deleting session", { error: String(error) })
    return NextResponse.json({ error: "Erro ao remover sessão" }, { status: 500 })
  }
}
