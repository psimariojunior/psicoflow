import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  let clinicId = session.user.clinicId
  if (!clinicId && (session.user.role === "ADMIN" || session.user.role === "PSYCHOLOGIST")) {
    const clinic = await prisma.clinic.findFirst({ where: { ownerId: session.user.id } })
    clinicId = clinic?.id || null
  }

  if (!clinicId) return NextResponse.json({ todayAppointments: [], todayArrivals: [], members: 0, psychologists: 0, receptionists: 0, totalPatients: 0, totalAppointmentsToday: 0 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const members = await prisma.clinicMember.findMany({
    where: { clinicId },
    include: {
      user: { select: { id: true, name: true, email: true, crp: true, specialty: true, role: true } },
    },
  })

  const psychologistIds = members
    .filter(m => m.user.role === "PSYCHOLOGIST" || m.user.role === "ADMIN" || m.user.role === "CLINIC_ADMIN")
    .map(m => m.user.id)

  const todayAppointments = await prisma.appointment.findMany({
    where: {
      psychologistId: { in: psychologistIds },
      startTime: { gte: today, lt: tomorrow },
    },
    include: {
      patient: { select: { id: true, name: true } },
      psychologist: { select: { id: true, name: true } },
    },
    orderBy: { startTime: "asc" },
  })

  const todayArrivals = await prisma.patientArrival.findMany({
    where: {
      clinicId,
      arrivedAt: { gte: today, lt: tomorrow },
    },
    orderBy: { arrivedAt: "desc" },
  })

  const totalPatients = await prisma.patient.count({
    where: { psychologistId: { in: psychologistIds } },
  })

  const totalAppointmentsToday = todayAppointments.length

  return NextResponse.json({
    clinic: { id: clinicId },
    members: members.length,
    psychologists: psychologistIds.length,
    receptionists: members.filter(m => m.user.role === "RECEPTIONIST").length,
    todayAppointments,
    todayArrivals,
    totalPatients,
    totalAppointmentsToday,
  })
}
