import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { answers, notes } = body

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id },
      include: { questions: true },
    })

    if (!questionnaire) {
      return NextResponse.json({ error: "Questionário não encontrado" }, { status: 404 })
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
        patientId: session.user.id,
        psychologistId: questionnaire.psychologistId,
        totalScore,
        severity,
        notes,
        answers: {
          create: answers.map((a: { questionId: string; value: number; notes?: string }) => ({
            questionId: a.questionId,
            value: a.value,
            notes: a.notes,
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