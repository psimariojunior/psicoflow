import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPatientToken } from "@/lib/patient-auth"

export const dynamic = "force-dynamic"

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  return verifyPatientToken(authHeader.slice(7))
}

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request)
    if (!payload) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const responses = await prisma.questionnaireResponse.findMany({
      where: { patientId: payload.patientId },
      include: {
        questionnaire: { select: { id: true, title: true, type: true } },
      },
      orderBy: { completedAt: "desc" },
    })

    return NextResponse.json(responses)
  } catch (error) {
    console.error("Erro ao buscar respostas:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}