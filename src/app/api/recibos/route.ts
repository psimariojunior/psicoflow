import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()
    const patientId = request.nextUrl.searchParams.get("patientId")

    const where: Record<string, unknown> = { psychologistId }
    if (patientId) where.patientId = patientId

    const receipts = await prisma.receipt.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true } },
      },
      orderBy: { issueDate: "desc" },
    })

    return apiSuccess(receipts)
  } catch (error) {
    logger.error("Error fetching receipts", { error: String(error) })
    return apiError("Erro ao buscar recibos")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

    const body = await request.json()
    const { patientId, appointmentId, description, amount, paymentMethod, patientName, patientDoc } = body

    if (!description || !amount) {
      return apiError("Descrição e valor são obrigatórios", 400)
    }

    const year = new Date().getFullYear()
    const lastReceipt = await prisma.receipt.findFirst({
      where: { number: { startsWith: `RPA-${year}-` } },
      orderBy: { number: "desc" },
    })

    let nextSeq = 1
    if (lastReceipt) {
      const parts = lastReceipt.number.split("-")
      nextSeq = parseInt(parts[parts.length - 1], 10) + 1
    }

    const number = `RPA-${year}-${String(nextSeq).padStart(4, "0")}`

    const receipt = await prisma.receipt.create({
      data: {
        number,
        patientName: patientName || "Paciente",
        patientDoc: patientDoc || null,
        description,
        amount: parseFloat(String(amount)),
        paymentMethod: paymentMethod || null,
        psychologistId,
        patientId: patientId || null,
        appointmentId: appointmentId || null,
      },
    })

    return apiSuccess(receipt, 201)
  } catch (error) {
    logger.error("Error creating receipt", { error: String(error) })
    return apiError("Erro ao criar recibo")
  }
}
