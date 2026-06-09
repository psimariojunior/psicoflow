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

    const psychologistId = (session.user as { id: string }).id
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get("year") || String(now.getFullYear()))

    const [
      totalPatients,
      activePatients,
      totalAppointments,
      monthlyAppointments,
      revenue,
      expenses,
      monthlyRevenue,
      appointmentsByMonth,
      topPatientsRaw,
    ] = await Promise.all([
      prisma.patient.count({ where: { psychologistId } }),
      prisma.patient.count({ where: { psychologistId, active: true } }),
      prisma.appointment.count({ where: { psychologistId } }),
      prisma.appointment.count({
        where: { psychologistId, startTime: { gte: startOfMonth } },
      }),
      prisma.financialTransaction.aggregate({
        where: { psychologistId, type: "INCOME", paymentStatus: "PAID" },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.aggregate({
        where: { psychologistId, type: "EXPENSE", paymentStatus: "PAID" },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.aggregate({
        where: {
          psychologistId,
          type: "INCOME",
          paymentStatus: "PAID",
          paymentDate: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      prisma.appointment.findMany({
        where: {
          psychologistId,
          startTime: {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1),
          },
        },
        select: { startTime: true },
      }),
      prisma.appointment.groupBy({
        by: ["patientId"],
        where: { psychologistId },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
    ])

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    const monthlyCounts = Array(12).fill(0)
    for (const apt of appointmentsByMonth) {
      monthlyCounts[apt.startTime.getMonth()]++
    }
    const monthlySessions = monthNames.map((month, i) => ({
      month,
      sessoes: monthlyCounts[i],
      receita: i === now.getMonth() && year === now.getFullYear() ? (monthlyRevenue._sum.amount || 0) : 0,
    }))

    const topPatientIds = topPatientsRaw.map((p) => p.patientId)
    const patients = topPatientIds.length > 0
      ? await prisma.patient.findMany({ where: { id: { in: topPatientIds } }, select: { id: true, name: true } })
      : []
    const patientMap = Object.fromEntries(patients.map((p) => [p.id, p.name]))
    const topPatients = topPatientsRaw.map((p) => ({
      name: patientMap[p.patientId] || "Desconhecido",
      sessions: p._count.id,
      revenue: 0,
    }))

    return NextResponse.json({
      summary: {
        totalPatients,
        activePatients,
        totalAppointments,
        monthlyAppointments,
        totalRevenue: revenue._sum.amount || 0,
        totalExpenses: expenses._sum.amount || 0,
        balance: (revenue._sum.amount || 0) - (expenses._sum.amount || 0),
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
      },
      monthlySessions,
      topPatients,
    })
  } catch (error) {
    logger.error("Error generating reports", { error: String(error) })
    return NextResponse.json({ error: "Erro ao gerar relatórios" }, { status: 500 })
  }
}
