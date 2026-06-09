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

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        psychologistId: (session.user as { id: string }).id,
      },
      include: {
        patient: { select: { id: true, name: true, email: true, phone: true } },
      },
    })

    if (!invoice) {
      return NextResponse.json({ error: "Fatura não encontrada" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    logger.error("Error fetching invoice", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar fatura" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, psychologistId: (session.user as { id: string }).id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Fatura não encontrada" }, { status: 404 })
    }

    const data = await request.json()
    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: data.status ?? existing.status,
        paidDate: data.status === "PAID" ? new Date() : existing.paidDate,
        paymentMethod: data.paymentMethod ?? existing.paymentMethod,
        notes: data.notes ?? existing.notes,
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    logger.error("Error updating invoice", { error: String(error) })
    return NextResponse.json({ error: "Erro ao atualizar fatura" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, psychologistId: (session.user as { id: string }).id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Fatura não encontrada" }, { status: 404 })
    }

    await prisma.invoice.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Fatura excluída com sucesso" })
  } catch (error) {
    logger.error("Error deleting invoice", { error: String(error) })
    return NextResponse.json({ error: "Erro ao excluir fatura" }, { status: 500 })
  }
}
