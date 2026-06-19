import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess, isAuthError } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo") || "producao"
    const periodo = parseInt(searchParams.get("periodo") || "30")
    const pacienteId = searchParams.get("pacienteId")

    const now = new Date()
    const dataInicio = new Date(now.getTime() - periodo * 86400000)

    switch (tipo) {
      case "paciente": {
        if (!pacienteId) return apiError("pacienteId é obrigatório para relatório de paciente", 400)

        const patient = await prisma.patient.findFirst({
          where: { id: pacienteId, psychologistId },
        })
        if (!patient) return apiError("Paciente não encontrado", 404)

        const [sessions, questionnaires, appointments, tasks, diaryEntries] = await Promise.all([
          prisma.therapySession.findMany({
            where: { patientId: pacienteId, psychologistId, date: { gte: dataInicio } },
            orderBy: { date: "asc" },
          }),
          prisma.questionnaireResponse.findMany({
            where: { patientId: pacienteId, psychologistId, createdAt: { gte: dataInicio } },
            include: { questionnaire: { select: { title: true, type: true } } },
            orderBy: { createdAt: "desc" },
          }),
          prisma.appointment.findMany({
            where: { patientId: pacienteId, psychologistId, startTime: { gte: dataInicio } },
            orderBy: { startTime: "asc" },
          }),
          prisma.therapyTask.findMany({
            where: { patientId: pacienteId, psychologistId },
            orderBy: { assignedAt: "desc" },
            include: { resource: { select: { name: true, type: true } } },
          }),
          prisma.emotionDiary.findMany({
            where: { patientId: pacienteId, psychologistId, date: { gte: dataInicio } },
            orderBy: { date: "asc" },
          }),
        ])

        const averageMood = diaryEntries.length > 0
          ? Math.round((diaryEntries.reduce((sum, e) => sum + (e.mood || 0), 0) / diaryEntries.length) * 10) / 10
          : null

        return apiSuccess({
          tipo: "paciente",
          periodo,
          patient: {
            id: patient.id,
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
          },
          sessions: {
            total: sessions.length,
            list: sessions.map((s) => ({ id: s.id, date: s.date, type: s.type, status: s.status })),
          },
          questionnaires: {
            total: questionnaires.length,
            list: questionnaires.map((q) => ({
              id: q.id,
              title: q.questionnaire.title,
              type: q.questionnaire.type,
              createdAt: q.createdAt,
              totalScore: q.totalScore,
            })),
          },
          appointments: {
            total: appointments.length,
            completed: appointments.filter((a) => a.status === "COMPLETED").length,
            cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
          },
          tasks: {
            total: tasks.length,
            completed: tasks.filter((t) => t.status === "COMPLETED").length,
            pending: tasks.filter((t) => t.status === "PENDING").length,
            list: tasks.map((t) => ({
              id: t.id,
              resourceName: t.resource.name,
              resourceType: t.resource.type,
              status: t.status,
              assignedAt: t.assignedAt,
              completedAt: t.completedAt,
            })),
          },
          diary: {
            totalEntries: diaryEntries.length,
            averageMood,
            entries: diaryEntries.map((e) => ({
              date: e.date,
              mood: e.mood,
              anxietyLevel: e.anxietyLevel,
              sleepHours: e.sleepHours,
            })),
          },
        })
      }

      case "financeiro": {
        const [incomeAgg, expenseAgg, pendingAgg, overdueAgg, transactions, invoices] = await Promise.all([
          prisma.financialTransaction.aggregate({
            where: { psychologistId, type: "INCOME", paymentStatus: "PAID", paymentDate: { gte: dataInicio } },
            _sum: { amount: true },
          }),
          prisma.financialTransaction.aggregate({
            where: { psychologistId, type: "EXPENSE", paymentStatus: "PAID", paymentDate: { gte: dataInicio } },
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
          prisma.financialTransaction.findMany({
            where: { psychologistId, paymentDate: { gte: dataInicio } },
            include: { patient: { select: { id: true, name: true } } },
            orderBy: { paymentDate: "desc" },
          }),
          prisma.invoice.findMany({
            where: { psychologistId, issueDate: { gte: dataInicio } },
            include: { patient: { select: { id: true, name: true } } },
            orderBy: { issueDate: "desc" },
          }),
        ])

        const income = incomeAgg._sum.amount || 0
        const expense = expenseAgg._sum.amount || 0

        return apiSuccess({
          tipo: "financeiro",
          periodo,
          summary: {
            totalRevenue: income,
            totalExpenses: expense,
            balance: income - expense,
            pending: (pendingAgg._sum.amount || 0) + (overdueAgg._sum.amount || 0),
            overdue: overdueAgg._sum.amount || 0,
          },
          transactions: transactions.map((t) => ({
            id: t.id,
            description: t.description,
            type: t.type,
            amount: t.amount,
            category: t.category,
            paymentDate: t.paymentDate,
            paymentStatus: t.paymentStatus,
            patientName: t.patient?.name || null,
          })),
          invoices: invoices.map((i) => ({
            id: i.id,
            number: i.number,
            amount: i.amount,
            totalAmount: i.totalAmount,
            status: i.status,
            issueDate: i.issueDate,
            dueDate: i.dueDate,
            patientName: i.patient.name,
          })),
        })
      }

      case "producao":
      default: {
        const [totalPatients, activePatients, totalAppointments, periodAppointments, completedSessions, taskStats, incomeAgg, expenseAgg] = await Promise.all([
          prisma.patient.count({ where: { psychologistId } }),
          prisma.patient.count({ where: { psychologistId, active: true } }),
          prisma.appointment.count({ where: { psychologistId } }),
          prisma.appointment.count({
            where: { psychologistId, startTime: { gte: dataInicio } },
          }),
          prisma.therapySession.count({
            where: { psychologistId, date: { gte: dataInicio } },
          }),
          prisma.therapyTask.groupBy({
            by: ["status"],
            where: { psychologistId },
            _count: true,
          }),
          prisma.financialTransaction.aggregate({
            where: { psychologistId, type: "INCOME", paymentStatus: "PAID", paymentDate: { gte: dataInicio } },
            _sum: { amount: true },
          }),
          prisma.financialTransaction.aggregate({
            where: { psychologistId, type: "EXPENSE", paymentStatus: "PAID", paymentDate: { gte: dataInicio } },
            _sum: { amount: true },
          }),
        ])

        const tasksCompleted = taskStats.find((t) => t.status === "COMPLETED")?._count || 0
        const tasksPending = taskStats.find((t) => t.status === "PENDING")?._count || 0

        return apiSuccess({
          tipo: "producao",
          periodo,
          patients: {
            total: totalPatients,
            active: activePatients,
            newInPeriod: totalPatients - (await prisma.patient.count({
              where: { psychologistId, createdAt: { lt: dataInicio } },
            })),
          },
          appointments: {
            total: totalAppointments,
            inPeriod: periodAppointments,
          },
          sessions: {
            inPeriod: completedSessions,
          },
          financial: {
            revenue: incomeAgg._sum.amount || 0,
            expenses: expenseAgg._sum.amount || 0,
            balance: (incomeAgg._sum.amount || 0) - (expenseAgg._sum.amount || 0),
          },
          tasks: {
            completed: tasksCompleted,
            pending: tasksPending,
            total: tasksCompleted + tasksPending,
          },
        })
      }
    }
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error generating report", { error: String(error) })
    return apiError("Erro ao gerar relatório")
  }
}
