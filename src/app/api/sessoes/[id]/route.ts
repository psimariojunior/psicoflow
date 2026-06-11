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

    const updateAndFetch = async (data: any) => {
      await prisma.therapySession.update({ where: { id: params.id }, data })
      return getSessionById(params.id, psychologistId)
    }

    if (action === "start") {
      const updated = await updateAndFetch({ status: "IN_PROGRESS", startedAt: now })
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
      const updated = await updateAndFetch({ status: "PAUSED", pausedSeconds: totalPaused, duration: totalPaused })
      return NextResponse.json(updated)
    }

    if (action === "resume") {
      if (existing.status !== "PAUSED") {
        return NextResponse.json({ error: "Sessão não está pausada" }, { status: 400 })
      }
      const updated = await updateAndFetch({ status: "IN_PROGRESS", startedAt: now })
      return NextResponse.json(updated)
    }

    if (action === "end") {
      if (existing.status !== "IN_PROGRESS" && existing.status !== "PAUSED") {
        return NextResponse.json({ error: "Sessão não está ativa" }, { status: 400 })
      }

      let totalSeconds = existing.pausedSeconds ?? 0
      if (existing.status === "IN_PROGRESS" && existing.startedAt) {
        totalSeconds += Math.floor((now.getTime() - existing.startedAt.getTime()) / 1000)
      }

      const updated = await updateAndFetch({
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
      })

      await prisma.appointment.updateMany({
        where: { id: existing.appointmentId ?? "", psychologistId },
        data: { status: "COMPLETED" },
      })

      const sessionDate = existing.startedAt ?? existing.createdAt
      const dateStr = sessionDate.toLocaleDateString("pt-BR")
      const sections: string[] = []
      if (subjective?.trim()) sections.push("**Subjetivo:**\n" + subjective)
      if (objective?.trim()) sections.push("**Objetivo:**\n" + objective)
      if (assessment?.trim()) sections.push("**Avaliação:**\n" + assessment)
      if (plan?.trim()) sections.push("**Plano:**\n" + plan)
      if (notes?.trim()) sections.push("**Observações:**\n" + notes)
      const content = sections.join("\n\n") || "Sessão realizada sem anotações."

      const title = `Sessão ${dateStr}` + (tags?.trim() ? ` — ${tags}` : "")

      await prisma.medicalRecord.create({
        data: {
          type: "SESSION_NOTE",
          title,
          content,
          patientId: existing.patientId,
          psychologistId,
        },
      })

      return NextResponse.json(updated)
    }

    const updated = await updateAndFetch({
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
