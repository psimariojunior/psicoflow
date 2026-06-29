import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./prisma"
import { NextResponse } from "next/server"

export async function requireClinicAccess() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) }
  }
  if (session.user.role === "RECEPTIONIST" && !session.user.clinicId) {
    return { error: NextResponse.json({ error: "Recepcionista sem clínica vinculada" }, { status: 403 }) }
  }
  return { session }
}

export async function getClinicId(session: { user: { clinicId?: string | null; role: string; id: string } }): Promise<string | null> {
  if (session.user.clinicId) return session.user.clinicId
  if (session.user.role === "ADMIN" || session.user.role === "PSYCHOLOGIST") {
    const clinic = await prisma.clinic.findFirst({
      where: { ownerId: session.user.id },
    })
    return clinic?.id || null
  }
  return null
}

export function isClinicAdmin(role: string) {
  return role === "ADMIN" || role === "CLINIC_ADMIN"
}

export function isReceptionistOrAdmin(role: string) {
  return role === "RECEPTIONIST" || role === "ADMIN" || role === "CLINIC_ADMIN"
}
