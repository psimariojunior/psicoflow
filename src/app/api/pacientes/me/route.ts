import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { verifyPatientToken } from "@/lib/patient-auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const payload = await verifyPatientToken(authHeader.slice(7))
    if (!payload) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: payload.patientId },
      select: { id: true, name: true, email: true, phone: true, createdAt: true },
    })

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 })
    }

    return NextResponse.json(patient)
  } catch (error) {
    logger.error("Error fetching patient", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 })
  }
}
