import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPatientToken } from "@/lib/patient-auth"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const token = authHeader.slice(7)
  const patientToken = await verifyPatientToken(token)
  if (!patientToken) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 })
  }

  const patientId = patientToken.patientId

  const [patient, diaries, appointments, questionnaires, tasks, invoices, therapySessions, consentLogs] = await Promise.all([
    prisma.patient.findUnique({
      where: { id: patientId },
      select: {
        id: true, name: true, email: true, phone: true,
        cpf: true, rg: true, dateOfBirth: true, gender: true,
        maritalStatus: true, profession: true, address: true,
        neighborhood: true, city: true, state: true, zipCode: true,
        emergencyContact: true, emergencyPhone: true,
        healthInsurance: true, insuranceNumber: true,
        createdAt: true,
      },
    }),
    prisma.emotionDiary.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      select: { mood: true, emotions: true, activities: true, notes: true, sleepHours: true, sleepQuality: true, anxietyLevel: true, createdAt: true },
    }),
    prisma.appointment.findMany({
      where: { patientId },
      orderBy: { startTime: "desc" },
      select: {
        startTime: true, endTime: true, status: true, type: true,
        modality: true, notes: true, price: true,
        createdAt: true,
      },
    }),
    prisma.questionnaireResponse.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      include: {
        questionnaire: { select: { title: true } },
        answers: true,
      },
    }),
    prisma.therapyTask.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      select: {
        status: true, notes: true, createdAt: true, completedAt: true,
        resource: { select: { name: true, description: true } },
      },
    }),
    prisma.invoice.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      select: { amount: true, totalAmount: true, status: true, dueDate: true, paidDate: true, createdAt: true },
    }),
    prisma.therapySession.findMany({
      where: { patientId },
      orderBy: { date: "desc" },
      select: {
        date: true, duration: true, status: true,
        subjective: true, objective: true, assessment: true, plan: true,
        createdAt: true,
      },
    }),
    prisma.consentLog.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
      select: { type: true, consent: true, signedAt: true, createdAt: true },
    }),
  ])

  if (!patient) return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })

  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      platform: "PsiHumanis",
      lgpdNotice: "Esta exportação é fornecida conforme o Art. 18 da Lei Geral de Proteção de Dados (LGPD).",
    },
    dadosPessoais: patient,
    diarioEmocoes: diaries,
    consultas: appointments,
    respostasQuestionarios: questionnaires.map(q => ({
      questionario: q.questionnaire?.title,
      pontuacao: q.totalScore,
      severidade: q.severity,
      respostas: q.answers,
      data: q.createdAt,
    })),
    tarefas: tasks.map(t => ({
      recurso: t.resource?.name,
      descricao: t.resource?.description,
      status: t.status,
      notas: t.notes,
      atribuidaEm: t.createdAt,
      concluidaEm: t.completedAt,
    })),
    faturas: invoices,
    sessoesTerapeuticas: therapySessions,
    consentimentos: consentLogs,
    estatisticas: {
      totalConsultas: appointments.length,
      consultasConcluidas: appointments.filter(a => a.status === "COMPLETED").length,
      totalRegistrosDiario: diaries.length,
      totalQuestionarios: questionnaires.length,
      totalTarefas: tasks.length,
      tarefasConcluidas: tasks.filter(t => t.status === "COMPLETED").length,
    },
  }

  return NextResponse.json(exportData, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="psiHumanis-export-${patient.name.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json"`,
    },
  })
}
