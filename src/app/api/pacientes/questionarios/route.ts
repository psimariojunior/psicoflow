import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPatientToken } from "@/lib/patient-auth"

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

    const patient = await prisma.patient.findUnique({
      where: { id: payload.patientId },
      select: { psychologistId: true },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    const questionnaires = await prisma.questionnaire.findMany({
      where: {
        psychologistId: patient.psychologistId,
        isActive: true,
      },
      include: {
        _count: { select: { questions: true, responses: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(questionnaires)
  } catch (error) {
    console.error("Erro ao buscar questionários:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}