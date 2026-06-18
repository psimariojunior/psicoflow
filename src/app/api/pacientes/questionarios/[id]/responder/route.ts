import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPatientToken } from "@/lib/patient-auth"

export const dynamic = "force-dynamic"

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  return verifyPatientToken(authHeader.slice(7))
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await authenticate(request)
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { answers, notes } = body

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id },
      include: { questions: true },
    })

    if (!questionnaire) {
      return NextResponse.json({ error: "Questionário não encontrado" }, { status: 404 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: payload.patientId },
      select: { psychologistId: true },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const totalScore = answers.reduce((sum: number, a: { questionId: string; value: number }) => sum + a.value, 0)

    let severity = "Mínima"
    if (questionnaire.type === "PHQ9") {
      if (totalScore >= 20) severity = "Severa"
      else if (totalScore >= 15) severity = "Moderadamente severa"
      else if (totalScore >= 10) severity = "Moderada"
      else if (totalScore >= 5) severity = "Leve"
    } else if (questionnaire.type === "GAD7") {
      if (totalScore >= 15) severity = "Severa"
      else if (totalScore >= 10) severity = "Moderada"
      else if (totalScore >= 5) severity = "Leve"
    }

    const response = await prisma.questionnaireResponse.create({
      data: {
        questionnaireId: id,
        patientId: payload.patientId,
        psychologistId: patient.psychologistId,
        totalScore,
        severity,
        notes,
        answers: {
          create: answers.map((a: { questionId: string; value: number }) => ({
            questionId: a.questionId,
            value: a.value,
          })),
        },
      },
      include: { answers: true },
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Erro ao responder questionário:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}