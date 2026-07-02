import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const psychologists = await prisma.user.findMany({
    where: { active: true, plan: { in: ["pro", "clinica"] } },
    select: { id: true, name: true, email: true },
  })

  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  let sent = 0
  let errors = 0

  for (const psych of psychologists) {
    try {
      const patients = await prisma.patient.findMany({
        where: { psychologistId: psych.id, active: true },
        select: { id: true, name: true },
      })
      const patientIds = patients.map(p => p.id)

      const [appointments, diaries, tasks] = await Promise.all([
        prisma.appointment.findMany({
          where: {
            psychologistId: psych.id,
            startTime: { gte: weekAgo, lte: now },
          },
          select: { status: true, startTime: true, patient: { select: { name: true } } },
        }),
        prisma.emotionDiary.findMany({
          where: { patientId: { in: patientIds }, createdAt: { gte: weekAgo } },
          select: { mood: true, emotions: true, patient: { select: { name: true } } },
        }),
        prisma.therapyTask.findMany({
          where: { patientId: { in: patientIds }, createdAt: { gte: weekAgo } },
          select: { status: true, patient: { select: { name: true } }, resource: { select: { name: true } } },
        }),
      ])

      const completed = appointments.filter(a => a.status === "COMPLETED").length
      const cancelled = appointments.filter(a => a.status === "CANCELLED").length
      const scheduled = appointments.length
      const avgMood = diaries.length > 0
        ? (diaries.reduce((s, d) => s + d.mood, 0) / diaries.length).toFixed(1)
        : "N/A"
      const tasksCompleted = tasks.filter(t => t.status === "COMPLETED").length

      const weekStart = weekAgo.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
      const weekEnd = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0D9488, #0F766E); padding: 24px; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">PsiHumanis</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0;">Resumo Semanal</p>
          </div>
          <div style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0;">
            <p style="color: #334155; font-size: 16px;">Olá, <strong>${psych.name}</strong>!</p>
            <p style="color: #64748b; font-size: 14px;">Aqui está o resumo da semana de ${weekStart} a ${weekEnd}:</p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0;">
              <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">Consultas</p>
                <p style="color: #1e293b; font-size: 24px; font-weight: bold; margin: 4px 0 0;">${completed}/${scheduled}</p>
                <p style="color: #64748b; font-size: 11px; margin: 2px 0 0;">concluídas</p>
              </div>
              <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">Cancelamentos</p>
                <p style="color: ${cancelled > 0 ? '#ef4444' : '#22c55e'}; font-size: 24px; font-weight: bold; margin: 4px 0 0;">${cancelled}</p>
              </div>
              <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">Humor Médio</p>
                <p style="color: #1e293b; font-size: 24px; font-weight: bold; margin: 4px 0 0;">${avgMood}</p>
                <p style="color: #64748b; font-size: 11px; margin: 2px 0 0;">escala 1-10</p>
              </div>
              <div style="background: white; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 12px; margin: 0;">Tarefas</p>
                <p style="color: #1e293b; font-size: 24px; font-weight: bold; margin: 4px 0 0;">${tasksCompleted}/${tasks.length}</p>
                <p style="color: #64748b; font-size: 11px; margin: 2px 0 0;">concluídas</p>
              </div>
            </div>

            ${diaries.length > 0 ? `
            <h3 style="color: #1e293b; font-size: 14px; margin: 16px 0 8px;">Registros de Humor Recentes</h3>
            ${diaries.slice(0, 5).map(d => `
              <p style="color: #64748b; font-size: 13px; margin: 2px 0;">
                <strong>${d.patient.name}</strong>: ${d.mood}/10 ${d.emotions ? `(${d.emotions})` : ""}
              </p>
            `).join("")}
            ` : ""}

            <div style="margin-top: 20px; padding: 12px; background: #f0fdfa; border-radius: 8px;">
              <p style="color: #0f766e; font-size: 13px; margin: 0;">
                Acesse o <a href="https://psihumanis.com.br/outcomes" style="color: #0D9488;">Clinical Outcomes Intelligence</a>
                para ver a análise completa de progresso dos seus pacientes.
              </p>
            </div>
          </div>
          <div style="padding: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0;">PsiHumanis — Gestão em Psicologia</p>
            <p style="margin: 4px 0 0;">Este é um relatório automático semanal.</p>
          </div>
        </div>
      `

      await sendEmail(
        psych.email,
        `PsiHumanis — Resumo Semanal (${weekStart} a ${weekEnd})`,
        html,
      )

      sent++
    } catch (err) {
      console.error(`Error sending report to ${psych.email}:`, err)
      errors++
    }
  }

  return NextResponse.json({ ok: true, sent, errors, total: psychologists.length })
}
