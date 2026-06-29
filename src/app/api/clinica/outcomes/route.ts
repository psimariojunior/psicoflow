import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const psychologistId = session.user.id

  const patients = await prisma.patient.findMany({
    where: { psychologistId, active: true },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      createdAt: true,
    },
  })

  const patientIds = patients.map(p => p.id)

  const [diaries, questionnaires, appointments, therapyTasks] = await Promise.all([
    prisma.emotionDiary.findMany({
      where: { patientId: { in: patientIds } },
      orderBy: { createdAt: "asc" },
      select: { id: true, patientId: true, mood: true, emotions: true, createdAt: true },
    }),
    prisma.questionnaireResponse.findMany({
      where: { patientId: { in: patientIds } },
      orderBy: { createdAt: "asc" },
      include: {
        questionnaire: { select: { title: true } },
      },
    }),
    prisma.appointment.findMany({
      where: { patientId: { in: patientIds } },
      orderBy: { startTime: "asc" },
      select: { id: true, patientId: true, startTime: true, status: true, price: true, paid: true },
    }),
    prisma.therapyTask.findMany({
      where: { patientId: { in: patientIds } },
      orderBy: { createdAt: "asc" },
      include: {
        resource: { select: { name: true } },
      },
    }),
  ])

  const outcomes = patients.map(patient => {
    const pDiaries = diaries.filter(d => d.patientId === patient.id)
    const pQuestionnaires = questionnaires.filter(q => q.patientId === patient.id)
    const pAppointments = appointments.filter(a => a.patientId === patient.id)
    const pTasks = therapyTasks.filter(t => t.patientId === patient.id)

    const moodTrend = pDiaries.map(d => ({
      date: d.createdAt,
      mood: d.mood,
      emotion: d.emotions,
    }))

    const scoreTrend = pQuestionnaires.map(q => ({
      date: q.createdAt,
      score: q.totalScore,
      title: q.questionnaire?.title,
      category: null as string | null,
    }))

    const completedAppointments = pAppointments.filter(a => a.status === "COMPLETED").length
    const totalAppointments = pAppointments.length
    const attendanceRate = totalAppointments > 0 ? Math.round((completedAppointments / totalAppointments) * 100) : 0

    const completedTasks = pTasks.filter(t => t.status === "COMPLETED").length
    const totalTasks = pTasks.length
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    let riskLevel: "low" | "medium" | "high" = "low"
    const riskFactors: string[] = []

    const recentScores = scoreTrend.slice(-5)
    if (recentScores.length >= 2) {
      const firstHalf = recentScores.slice(0, Math.ceil(recentScores.length / 2))
      const secondHalf = recentScores.slice(Math.ceil(recentScores.length / 2))
      const avgFirst = firstHalf.reduce((s, r) => s + (r.score || 0), 0) / firstHalf.length
      const avgSecond = secondHalf.reduce((s, r) => s + (r.score || 0), 0) / secondHalf.length
      if (avgSecond > avgFirst * 1.3) {
        riskLevel = "high"
        riskFactors.push("Scores piorando significativamente")
      } else if (avgSecond > avgFirst * 1.1) {
        riskLevel = "medium"
        riskFactors.push("Scores em tendência de alta")
      }
    }

    const lastDiary = pDiaries[pDiaries.length - 1]
    if (lastDiary) {
      const daysSinceLastDiary = Math.floor((Date.now() - new Date(lastDiary.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceLastDiary > 14) {
        riskFactors.push(`Sem registros há ${daysSinceLastDiary} dias`)
        if (riskLevel === "low") riskLevel = "medium"
      }
    }

    if (attendanceRate < 60 && totalAppointments >= 3) {
      riskFactors.push(`Taxa de comparecimento: ${attendanceRate}%`)
      if (riskLevel === "low") riskLevel = "medium"
    }

    if (taskCompletionRate < 30 && totalTasks >= 3) {
      riskFactors.push(`Taxa de conclusão de tarefas: ${taskCompletionRate}%`)
    }

    const daysInTreatment = Math.floor((Date.now() - new Date(patient.createdAt).getTime()) / (1000 * 60 * 60 * 24))

    return {
      patient: {
        id: patient.id,
        name: patient.name,
        daysInTreatment,
      },
      moodTrend,
      scoreTrend,
      stats: {
        totalAppointments,
        completedAppointments,
        attendanceRate,
        totalTasks,
        completedTasks,
        taskCompletionRate,
        diaryEntries: pDiaries.length,
        questionnaireResponses: pQuestionnaires.length,
      },
      risk: {
        level: riskLevel,
        factors: riskFactors,
      },
    }
  })

  const summary = {
    totalPatients: patients.length,
    highRisk: outcomes.filter(o => o.risk.level === "high").length,
    mediumRisk: outcomes.filter(o => o.risk.level === "medium").length,
    lowRisk: outcomes.filter(o => o.risk.level === "low").length,
    avgAttendanceRate: outcomes.length > 0
      ? Math.round(outcomes.reduce((s, o) => s + o.stats.attendanceRate, 0) / outcomes.length)
      : 0,
    avgTaskCompletion: outcomes.length > 0
      ? Math.round(outcomes.reduce((s, o) => s + o.stats.taskCompletionRate, 0) / outcomes.length)
      : 0,
  }

  return NextResponse.json({ outcomes, summary })
}
