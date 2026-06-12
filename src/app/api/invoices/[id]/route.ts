import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { z } from "zod"

const updateInvoiceSchema = z.object({
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED", "REFUNDED"]).optional(),
  paymentMethod: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
})

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

    const body = await request.json()
    const result = updateInvoiceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.issues.map((i) => i.message) },
        { status: 400 }
      )
    }
    const data = result.data
    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: data.status ?? existing.status,
        paidDate: data.status === "PAID" ? new Date() : existing.paidDate,
        paymentMethod: data.paymentMethod ? sanitizeHtml(data.paymentMethod) : existing.paymentMethod,
        notes: data.notes ? sanitizeHtml(data.notes) : existing.notes,
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
