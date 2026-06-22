import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const questionnaires = await prisma.questionnaire.findMany({
      where: {
        isActive: true,
        psychologistId: session.user.id,
      },
      include: {
        _count: {
          select: { questions: true, responses: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(questionnaires)
  } catch (error) {
    console.error("Erro ao buscar questionários:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { type, title, description, questions } = body

    const questionnaire = await prisma.questionnaire.create({
      data: {
        type,
        title,
        description,
        psychologistId: session.user.id,
        questions: {
          create: questions.map((q: { text: string; order: number; options?: string; scaleMin?: number; scaleMax?: number; category?: string }, i: number) => ({
            questionText: q.text,
            questionOrder: q.order ?? i + 1,
            options: q.options ?? JSON.stringify([
              { value: 0, label: "Nenhum dia" },
              { value: 1, label: "Vários dias" },
              { value: 2, label: "Mais da metade dos dias" },
              { value: 3, label: "Quase todos os dias" },
            ]),
            scaleMin: q.scaleMin ?? 0,
            scaleMax: q.scaleMax ?? 3,
            category: q.category,
          })),
        },
      },
      include: { questions: true },
    })

    return NextResponse.json(questionnaire, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar questionário:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}