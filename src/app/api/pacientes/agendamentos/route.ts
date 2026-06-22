import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { verifyPatientToken } from "@/lib/patient-auth"

export const dynamic = "force-dynamic"

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

    const appointments = await prisma.appointment.findMany({
      where: { patientId: payload.patientId },
      include: {
        psychologist: { select: { name: true } },
      },
      orderBy: { startTime: "asc" },
    })

    return NextResponse.json(appointments)
  } catch (error) {
    logger.error("Error fetching patient appointments", { error: String(error) })
    return NextResponse.json({ error: "Erro ao buscar agendamentos" }, { status: 500 })
  }
}
