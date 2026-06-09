import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

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

    const data = await request.json()
    const nextNumber = `NF-${String((await prisma.invoice.count({ where: { psychologistId: (session.user as { id: string }).id } })) + 1).padStart(4, "0")}`

    const invoice = await prisma.invoice.create({
      data: {
        number: nextNumber,
        description: data.description,
        amount: data.amount,
        totalAmount: data.amount + (data.taxAmount || 0),
        taxAmount: data.taxAmount || 0,
        dueDate: new Date(data.dueDate),
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
