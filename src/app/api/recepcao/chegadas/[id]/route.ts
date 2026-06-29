import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const clinicId = session.user.clinicId
  if (!clinicId) {
    return NextResponse.json({ error: "Sem clínica vinculada" }, { status: 403 })
  }

  const arrival = await prisma.patientArrival.findFirst({
    where: { id: params.id, clinicId },
  })
  if (!arrival) {
    return NextResponse.json({ error: "Chegada não encontrada" }, { status: 404 })
  }

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "RECEPTION_ARRIVAL_REMOVED",
      entity: "PatientArrival",
      entityId: arrival.id,
      details: `Registro de chegada removido`,
    },
  })

  await prisma.patientArrival.delete({ where: { id: params.id } })

  return NextResponse.json({ ok: true })
}
