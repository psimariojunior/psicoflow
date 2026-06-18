import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPatientToken } from "@/lib/patient-auth"

export const dynamic = "force-dynamic"

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  return verifyPatientToken(authHeader.slice(7))
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = await authenticate(request)
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = await params

    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id },
      include: {
        questions: { orderBy: { questionOrder: "asc" } },
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