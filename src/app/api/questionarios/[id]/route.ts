import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { questionOrder: "asc" },
        },
      },
    })

    if (!questionnaire) {
      return NextResponse.json({ error: "Questionário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(questionnaire)
  } catch (error) {
    console.error("Erro ao buscar questionário:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}