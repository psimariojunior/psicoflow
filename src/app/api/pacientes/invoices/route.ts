import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { verifyPatientToken } from "@/lib/patient-auth"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const payload = await verifyPatientToken(authHeader.slice(7))
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const invoices = await prisma.invoice.findMany({
      where: { patientId: payload.patientId },
      orderBy: { dueDate: "desc" },
      select: {
        id: true,
        number: true,
        description: true,
        amount: true,
        totalAmount: true,
        dueDate: true,
        paidDate: true,
        paymentMethod: true,
        status: true,
        issueDate: true,
        psychologist: {
          select: {
            name: true,
            pixKey: true,
            paymentInfo: true,
          },
        },
      },
    })

    return NextResponse.json({
      invoices: invoices.map(({ psychologist, ...inv }) => ({
        ...inv,
        psychologistName: psychologist.name,
        pixKey: psychologist.pixKey,
        paymentInfo: psychologist.paymentInfo,
      })),
    })
  } catch (error) {
    logger.error("Error fetching patient invoices", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar faturas" }, { status: 500 })
  }
}