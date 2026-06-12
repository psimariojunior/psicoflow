import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { validate, createTransactionSchema } from "@/lib/validation"
import { sanitizeHtml } from "@/lib/security"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const psychologistId = (session.user as { id: string }).id
    const { searchParams } = request.nextUrl
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const dateFilter: any = {}
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

    return NextResponse.json({
      summary: {
        totalRevenue: income._sum.amount || 0,
        totalExpenses: expense._sum.amount || 0,
        balance: (income._sum.amount || 0) - (expense._sum.amount || 0),
      },
      transactions,
    })
  } catch (error) {
    logger.error("Error fetching financial data", { error: String(error) })
    return NextResponse.json(
      { error: "Erro ao buscar dados financeiros" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

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
        psychologistId: (session.user as { id: string }).id,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    logger.error("Error creating transaction", { error: String(error) })
    return NextResponse.json(
      { error: "Erro ao criar transação" },
      { status: 500 }
    )
  }
}
