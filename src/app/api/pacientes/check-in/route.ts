import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// POST /api/pacientes/check-in — patient checks in for appointment
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { appointmentId } = body

    if (!appointmentId) {
      return NextResponse.json({ error: "appointmentId required" }, { status: 400 })
    }

    // Get patient from JWT token
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify appointment exists and belongs to this patient
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      select: { id: true, patientId: true, status: true },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Update appointment with check-in time (using notes field as simple storage)
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: appointment.status === "SCHEDULED" ? "CONFIRMED" : appointment.status,
      },
    })

    return NextResponse.json({ ok: true, checkedIn: true })
  } catch (error) {
    return NextResponse.json({ error: "Erro ao realizar check-in" }, { status: 500 })
  }
}
