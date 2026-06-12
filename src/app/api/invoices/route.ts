import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { z } from "zod"

const createInvoiceSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória").max(500),
  amount: z.number().positive("Valor deve ser positivo"),
  taxAmount: z.number().min(0).optional(),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  patientId: z.string().min(1, "Paciente é obrigatório"),
  status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED", "REFUNDED"]).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")))

    const where: Record<string, unknown> = {
      psychologistId: (session.user as { id: string }).id,
      ...(status ? { status } : {}),
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          patient: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ])

    const enriched = invoices.map((inv) => ({
      id: inv.id,
      number: inv.number,
      patientName: inv.patient.name,
      description: inv.description,
      amount: inv.totalAmount,
      dueDate: inv.dueDate.toISOString(),
      status: inv.status,
      issueDate: inv.issueDate.toISOString(),
      paymentMethod: inv.paymentMethod,
    }))

    return NextResponse.json({ invoices: enriched, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    logger.error("Error fetching invoices", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar faturas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const result = createInvoiceSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.issues.map((i) => i.message) },
        { status: 400 }
      )
    }
    const data = result.data

    const patient = await prisma.patient.findFirst({
      where: { id: data.patientId, psychologistId: (session.user as { id: string }).id },
      select: { id: true },
    })
    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const dueDate = new Date(data.dueDate)
    if (isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: "Data de vencimento inválida" }, { status: 400 })
    }

    const nextNumber = `NF-${String((await prisma.invoice.count({ where: { psychologistId: (session.user as { id: string }).id } })) + 1).padStart(4, "0")}`

    const invoice = await prisma.invoice.create({
      data: {
        number: nextNumber,
        description: sanitizeHtml(data.description),
        amount: data.amount,
        totalAmount: data.amount + (data.taxAmount || 0),
        taxAmount: data.taxAmount || 0,
        dueDate,
        issueDate: new Date(),
        patientId: data.patientId,
        psychologistId: (session.user as { id: string }).id,
        status: data.status || "PENDING",
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    logger.error("Error creating invoice", { error: String(error) })
    return NextResponse.json({ error: "Erro ao criar fatura" }, { status: 500 })
  }
}
