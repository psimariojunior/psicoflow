import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const psychologistId = (session.user as { id: string }).id
    const now = new Date()
    const brtNow = new Date(now.getTime() - 3 * 3600000)
    const startOfMonth = new Date(Date.UTC(brtNow.getUTCFullYear(), brtNow.getUTCMonth(), 1))
    const startOfToday = new Date(Date.UTC(brtNow.getUTCFullYear(), brtNow.getUTCMonth(), brtNow.getUTCDate()))
    const endOfToday = new Date(startOfToday.getTime() + 86400000)

    const [
      totalPatients,
      appointmentsToday,
      monthlyIncome,
      pendingPayments,
      recentAppointments,
      recentPatients,
      financialSummary,
    ] = await Promise.all([
      prisma.patient.count({ where: { psychologistId, active: true } }),
      prisma.appointment.count({
        where: { psychologistId, startTime: { gte: startOfToday, lt: endOfToday } },
      }),
      prisma.financialTransaction.aggregate({
        where: { psychologistId, type: "INCOME", paymentStatus: "PAID", paymentDate: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.aggregate({
        where: { psychologistId, type: "INCOME", paymentStatus: { in: ["PENDING", "OVERDUE"] } },
        _sum: { amount: true },
      }),
      prisma.appointment.findMany({
        where: { psychologistId, startTime: { gte: now }, status: { in: ["SCHEDULED", "CONFIRMED"] } },
        include: { patient: { select: { id: true, name: true } } },
        orderBy: { startTime: "asc" },
        take: 5,
      }),
      prisma.patient.findMany({
        where: { psychologistId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      Promise.all([
        prisma.financialTransaction.aggregate({
          where: { psychologistId, type: "INCOME", paymentStatus: "PAID" },
          _sum: { amount: true },
        }),
        prisma.financialTransaction.aggregate({
          where: { psychologistId, type: "EXPENSE", paymentStatus: "PAID" },
          _sum: { amount: true },
        }),
      ]),
    ])

    const income = financialSummary[0]._sum.amount || 0
    const expense = financialSummary[1]._sum.amount || 0

    return NextResponse.json({
      stats: {
        totalPatients,
        appointmentsToday,
        monthlyRevenue: monthlyIncome._sum.amount || 0,
        pendingPayments: pendingPayments._sum.amount || 0,
        appointmentChange: 0,
        revenueChange: 0,
      },
      appointments: recentAppointments.map((apt) => ({
        id: apt.id,
        patientName: apt.patient.name,
        startTime: apt.startTime,
        status: apt.status,
        modality: apt.modality || "presential",
      })),
      patients: recentPatients.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        createdAt: p.createdAt,
      })),
      financialSummary: {
        totalRevenue: income,
        totalExpenses: expense,
        balance: income - expense,
        pending: pendingPayments._sum.amount || 0,
        overdue: 0,
        received: income,
        goal: 10000,
      },
    })
  } catch (error) {
    logger.error("Error fetching dashboard data", { error: String(error) })
    return NextResponse.json({ error: "Erro ao carregar dashboard" }, { status: 500 })
  }
}
