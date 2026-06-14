import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export async function GET() {
  try {
    const psychologistId = await requireAuth()
    const now = new Date()
    const brtNow = new Date(now.getTime() - 3 * 3600000)
    const currentYear = brtNow.getUTCFullYear()
    const currentMonth = brtNow.getUTCMonth()
    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1))
    const startOfLastMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1))
    const startOfToday = new Date(Date.UTC(currentYear, currentMonth, brtNow.getUTCDate()))
    const endOfToday = new Date(startOfToday.getTime() + 86400000)
    const startOfYear = new Date(Date.UTC(currentYear, 0, 1))
    const sixMonthsAgo = new Date(Date.UTC(currentYear, currentMonth - 5, 1))

    const [
      totalPatients,
      appointmentsToday,
      monthlyIncome,
      lastMonthIncome,
      pendingPayments,
      overduePayments,
      recentAppointments,
      recentPatients,
      financialSummary,
      allAppointments,
      monthlyRevenueData,
      paymentMethods,
      newPatientsMonthly,
      patientsPerMonth,
      completedAppointments,
      totalAppointments,
      appointmentStatuses,
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
        where: { psychologistId, type: "INCOME", paymentStatus: "PAID", paymentDate: { gte: startOfLastMonth, lt: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.aggregate({
        where: { psychologistId, type: "INCOME", paymentStatus: "PENDING" },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.aggregate({
        where: { psychologistId, type: "INCOME", paymentStatus: "OVERDUE" },
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
      prisma.appointment.findMany({
        where: { psychologistId, startTime: { gte: startOfYear } },
        select: { startTime: true, status: true },
      }),
      prisma.financialTransaction.groupBy({
        by: ["paymentDate"],
        where: {
          psychologistId,
          type: "INCOME",
          paymentStatus: "PAID",
          paymentDate: { gte: startOfYear },
        },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.groupBy({
        by: ["paymentMethod"],
        where: { psychologistId, type: "INCOME", paymentStatus: "PAID" },
        _sum: { amount: true },
      }),
      prisma.patient.findMany({
        where: { psychologistId, createdAt: { gte: sixMonthsAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.$queryRawUnsafe<{ mes: string; total: bigint }[]>(
        `SELECT to_char("startTime", 'YYYY-MM') as mes, COUNT(*) as total
         FROM "Appointment"
         WHERE "psychologistId" = $1 AND "startTime" >= $2 AND "status" != 'CANCELLED'
         GROUP BY mes ORDER BY mes`,
        psychologistId, sixMonthsAgo
      ),
      prisma.appointment.count({
        where: { psychologistId, status: "COMPLETED" },
      }),
      prisma.appointment.count({
        where: { psychologistId, status: { notIn: ["CANCELLED"] } },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        where: { psychologistId },
        _count: true,
      }),
    ])

    const income = financialSummary[0]._sum.amount || 0
    const expense = financialSummary[1]._sum.amount || 0
    const pending = pendingPayments._sum.amount || 0
    const overdue = overduePayments._sum.amount || 0

    const currentMonthRevenue = monthlyIncome._sum.amount || 0
    const prevMonthRevenue = lastMonthIncome._sum.amount || 0
    const revenueChange = prevMonthRevenue > 0 ? ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 : 0

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    const monthlyAppointments = Array(12).fill(0)
    for (const apt of allAppointments) {
      monthlyAppointments[apt.startTime.getMonth()]++
    }

    const monthlyRevenue: number[] = Array(12).fill(0)
    for (const tx of monthlyRevenueData) {
      if (tx.paymentDate) {
        monthlyRevenue[tx.paymentDate.getMonth()] += tx._sum.amount || 0
      }
    }

    const monthlyData = monthNames.map((month, i) => ({
      month,
      appointments: monthlyAppointments[i],
      receita: monthlyRevenue[i],
    }))

    const lastMonthAppointments = allAppointments.filter(
      (a) => a.startTime.getMonth() === currentMonth - 1 && a.startTime.getFullYear() === currentYear
    ).length
    const thisMonthAppointments = monthlyAppointments[currentMonth]
    const appointmentChange = lastMonthAppointments > 0 ? ((thisMonthAppointments - lastMonthAppointments) / lastMonthAppointments) * 100 : 0

    const paymentsByMethod = paymentMethods.map((pm) => ({
      name: pm.paymentMethod || "Outros",
      value: pm._sum.amount || 0,
    }))

    const totalPts = totalAppointments || 1
    const completionRate = Math.round((completedAppointments / totalPts) * 100)
    const cancellationCount = appointmentStatuses.find((s) => s.status === "CANCELLED")?._count || 0
    const totalWithCancel = totalAppointments + cancellationCount || 1
    const cancellationRate = Math.round((cancellationCount / totalWithCancel) * 100)
    const averageTicket = totalPatients > 0 ? Math.round(income / totalPatients) : 0
    const occupationRate = Math.min(100, Math.round((monthlyAppointments[currentMonth] / 22) * 100))

    const sixMonthNames: string[] = []
    for (let i = 5; i >= 0; i--) {
      const m = new Date(currentYear, currentMonth - i, 1)
      sixMonthNames.push(monthNames[m.getMonth()])
    }
    const newPatientsByMonth = sixMonthNames.map((m) => ({ month: m, count: 0 }))
    for (const p of newPatientsMonthly) {
      const idx = sixMonthNames.indexOf(monthNames[p.createdAt.getMonth()])
      if (idx >= 0) newPatientsByMonth[idx].count++
    }

    return apiSuccess({
      stats: {
        totalPatients,
        appointmentsToday,
        monthlyRevenue: currentMonthRevenue,
        pendingPayments: pending + overdue,
        appointmentChange: Math.round(appointmentChange * 10) / 10,
        revenueChange: Math.round(revenueChange * 10) / 10,
      },
      monthlyData,
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
        pending,
        overdue,
        received: income,
        goal: 10000,
      },
      indicators: {
        averageTicket,
        completionRate,
        cancellationRate,
        occupationRate,
      },
      paymentsByMethod,
      newPatientsByMonth,
      appointmentsPerMonth: patientsPerMonth.map((ap) => ({
        month: ap.mes.slice(5),
        count: Number(ap.total),
      })),
    })
  } catch (error) {
    logger.error("Error fetching dashboard data", { error: String(error) })
    return apiError("Erro ao carregar dashboard")
  }
}
