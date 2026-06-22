import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { validate, createTransactionSchema } from "@/lib/validation"
import { sanitizeHtml } from "@/lib/security"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"
import { logAudit } from "@/lib/security"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()
    const { searchParams } = request.nextUrl
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const dateFilter: { createdAt?: { gte?: Date; lte?: Date } } = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.gte = new Date(startDate)
      if (endDate) dateFilter.createdAt.lte = new Date(endDate + "T23:59:59.999Z")
    }

    const whereBase = { psychologistId }

    const [income, expense] = await Promise.all([
      prisma.financialTransaction.aggregate({
        where: { ...whereBase, type: "INCOME", paymentStatus: "PAID" },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.aggregate({
        where: { ...whereBase, type: "EXPENSE", paymentStatus: "PAID" },
        _sum: { amount: true },
      }),
    ])

    const transactions = await prisma.financialTransaction.findMany({
      where: { ...whereBase, ...dateFilter },
      include: { patient: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 200,
    })

    return apiSuccess({
      summary: {
        totalRevenue: income._sum.amount || 0,
        totalExpenses: expense._sum.amount || 0,
        balance: (income._sum.amount || 0) - (expense._sum.amount || 0),
      },
      transactions,
    })
  } catch (error) {
    logger.error("Error fetching financial data", { error: String(error) })
    return apiError("Erro ao buscar dados financeiros")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

    const data = await request.json()
    const { error } = validate(createTransactionSchema, data)
    if (error) return error

    const transaction = await prisma.financialTransaction.create({
      data: {
        description: sanitizeHtml(data.description),
        type: data.type,
        category: data.category ? sanitizeHtml(data.category) : null,
        amount: data.amount,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : null,
        paymentMethod: data.paymentMethod ? sanitizeHtml(data.paymentMethod) : null,
        paymentStatus: "PENDING",
        notes: data.notes ? sanitizeHtml(data.notes) : null,
        patientId: data.patientId || null,
        psychologistId,
      },
    })

    logAudit(psychologistId, "CREATE", "FinancialTransaction", transaction.id, `${data.type}: ${data.description}`).catch(() => {})
    return apiSuccess(transaction, 201)
  } catch (error) {
    logger.error("Error creating transaction", { error: String(error) })
    return apiError("Erro ao criar transação")
  }
}
