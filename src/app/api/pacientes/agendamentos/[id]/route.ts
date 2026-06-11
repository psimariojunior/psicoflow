import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { cancelPendingReminders } from "@/lib/notifications"
import * as jose from "jose"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = request.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const token = auth.slice(7)
    const secret = new TextEncoder().encode(process.env.ENCRYPTION_KEY || "fallback-dev-key-change-in-production")

    let payload: { patientId: string }
    try {
      payload = (await jose.jwtVerify(token, secret)).payload as unknown as { patientId: string }
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 })
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id: params.id, patientId: payload.patientId },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Agendamento não encontrado" }, { status: 404 })
    }

    if (appointment.status === "CANCELLED") {
      return NextResponse.json({ error: "Consulta já cancelada" }, { status: 400 })
    }

    if (new Date(appointment.startTime) <= new Date()) {
      return NextResponse.json({ error: "Não é possível cancelar uma consulta que já passou" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    await prisma.appointment.update({
      where: { id: params.id },
      data: { status: "CANCELLED", cancelReason: body.cancelReason || null },
    })

    cancelPendingReminders(params.id).catch(
      (e) => logger.error("cancelPendingReminders failed", { error: String(e) })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error("Error cancelling appointment", { error: String(error) })
    return NextResponse.json({ error: "Erro ao cancelar consulta" }, { status: 500 })
  }
}
