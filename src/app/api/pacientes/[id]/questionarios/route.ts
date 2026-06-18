import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const patient = await prisma.patient.findFirst({
      where: { id, psychologistId: session.user.id },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const responses = await prisma.questionnaireResponse.findMany({
      where: {
        patientId: id,
        psychologistId: session.user.id,
      },
      include: {
        questionnaire: {
          select: { id: true, title: true, type: true },
        },
        answers: {
          include: {
            question: {
              select: { id: true, questionText: true, questionOrder: true, category: true },
            },
          },
        },
      },
      orderBy: { completedAt: "desc" },
    })

    return NextResponse.json(responses)
  } catch (error) {
    console.error("Erro ao buscar respostas:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}