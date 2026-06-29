import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const clinicId = session.user.clinicId || null
  let resolvedClinicId = clinicId

  if (!resolvedClinicId && (session.user.role === "ADMIN" || session.user.role === "PSYCHOLOGIST")) {
    const clinic = await prisma.clinic.findFirst({ where: { ownerId: session.user.id } })
    resolvedClinicId = clinic?.id || null
  }

  if (!resolvedClinicId) {
    return NextResponse.json({ error: "Clínica não encontrada" }, { status: 404 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const arrivals = await prisma.patientArrival.findMany({
    where: {
      clinicId: resolvedClinicId,
      arrivedAt: { gte: today, lt: tomorrow },
    },
    orderBy: { arrivedAt: "desc" },
  })

  return NextResponse.json({ arrivals })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const clinicId = session.user.clinicId
  if (!clinicId) {
    return NextResponse.json({ error: "Recepcionista sem clínica vinculada" }, { status: 403 })
  }

  const body = await request.json()
  const { patientId, psychologistId, patientName, notes } = body

  if (!psychologistId) {
    return NextResponse.json({ error: "psychologistId é obrigatório" }, { status: 400 })
  }

  if (!patientId && !patientName) {
    return NextResponse.json({ error: "patientId ou patientName é obrigatório" }, { status: 400 })
  }

  const psychologist = await prisma.user.findFirst({
    where: { id: psychologistId, clinicId },
  })
  if (!psychologist) {
    return NextResponse.json({ error: "Psicólogo não encontrado nesta clínica" }, { status: 404 })
  }

  const arrival = await prisma.patientArrival.create({
    data: {
      clinicId,
      patientId: patientId || null,
      psychologistId,
      receptionistId: session.user.id,
      patientName: patientName || null,
      notes: notes || null,
      status: "ARRIVED",
    },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "RECEPTION_ARRIVAL_REGISTERED",
      entity: "PatientArrival",
      entityId: arrival.id,
      details: `Paciente ${patientName || patientId} registrado como chegou`,
    },
  })

  return NextResponse.json({ arrival }, { status: 201 })
}
