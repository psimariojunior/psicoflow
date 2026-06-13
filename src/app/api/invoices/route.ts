import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { sanitizeHtml } from "@/lib/security"
import { z } from "zod"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

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
    const psychologistId = await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")))

    const where: Record<string, unknown> = {
      psychologistId,
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

    return apiSuccess({ invoices: enriched, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    logger.error("Error fetching invoices", { error: String(error) })
    return apiError("Erro ao buscar faturas")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

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
      where: { id: data.patientId, psychologistId },
      select: { id: true },
    })
    if (!patient) {
      return apiError("Paciente não encontrado", 404)
    }

    const dueDate = new Date(data.dueDate)
    if (isNaN(dueDate.getTime())) {
      return apiError("Data de vencimento inválida", 400)
    }

    const nextNumber = `NF-${String((await prisma.invoice.count({ where: { psychologistId } })) + 1).padStart(4, "0")}`

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
        psychologistId,
        status: data.status || "PENDING",
      },
      include: {
        patient: { select: { id: true, name: true } },
      },
    })

    return apiSuccess(invoice, 201)
  } catch (error) {
    logger.error("Error creating invoice", { error: String(error) })
    return apiError("Erro ao criar fatura")
  }
}
