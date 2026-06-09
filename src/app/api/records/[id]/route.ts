import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const record = await prisma.medicalRecord.findFirst({
      where: {
        id: params.id,
        psychologistId: (session.user as { id: string }).id,
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    })

    if (!record) {
      return NextResponse.json({ error: "Prontuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(record)
  } catch (error) {
    logger.error("Error fetching record", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar prontuário" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const existing = await prisma.medicalRecord.findFirst({
      where: {
        id: params.id,
        psychologistId: (session.user as { id: string }).id,
      },
    })
    if (!existing) {
      return NextResponse.json({ error: "Prontuário não encontrado" }, { status: 404 })
    }

    const data = await request.json()
    const record = await prisma.medicalRecord.update({
      where: { id: params.id },
      data: {
        title: data.title ?? existing.title,
        content: data.content ?? existing.content,
        type: data.type ?? existing.type,
        isConfidential: data.isConfidential ?? existing.isConfidential,
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(record)
  } catch (error) {
    logger.error("Error updating record", { error: String(error) })
    return NextResponse.json({ error: "Erro ao atualizar prontuário" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const existing = await prisma.medicalRecord.findFirst({
      where: {
        id: params.id,
        psychologistId: (session.user as { id: string }).id,
      },
    })
    if (!existing) {
      return NextResponse.json({ error: "Prontuário não encontrado" }, { status: 404 })
    }

    await prisma.medicalRecord.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Prontuário excluído com sucesso" })
  } catch (error) {
    logger.error("Error deleting record", { error: String(error) })
    return NextResponse.json({ error: "Erro ao excluir prontuário" }, { status: 500 })
  }
}
