import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
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

  const updated = await prisma.patientArrival.update({
    where: { id: params.id },
    data: {
      status: "NOTIFIED",
      notifiedAt: new Date(),
    },
  })

  await prisma.notification.create({
    data: {
      psychologistId: arrival.psychologistId,
      title: "Paciente chegou",
      message: `Paciente ${arrival.patientName || "Paciente"} chegou e está aguardando. Registrado por recepção.`,
      channel: "INTERNAL",
    },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "RECEPTION_PATIENT_NOTIFIED",
      entity: "PatientArrival",
      entityId: arrival.id,
      details: `Psicólogo ${arrival.psychologistId} notificado sobre chegada do paciente`,
    },
  })

  return NextResponse.json({ arrival: updated })
}
