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
  if (!clinicId) return NextResponse.json({ error: "Sem clínica" }, { status: 403 })
  if (session.user.role !== "ADMIN" && session.user.role !== "CLINIC_ADMIN" && session.user.role !== "PSYCHOLOGIST") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const member = await prisma.clinicMember.findFirst({
    where: { id: params.id, clinicId },
  })
  if (!member) {
    return NextResponse.json({ error: "Membro não encontrado" }, { status: 404 })
  }

  if (member.userId === session.user.id) {
    return NextResponse.json({ error: "Não é possível remover a si mesmo" }, { status: 400 })
  }

  await prisma.clinicMember.delete({ where: { id: params.id } })

  await prisma.user.update({
    where: { id: member.userId },
    data: { clinicId: null },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CLINIC_MEMBER_REMOVED",
      entity: "ClinicMember",
      entityId: member.id,
      details: `Membro removido da clínica`,
    },
  })

  return NextResponse.json({ ok: true })
}
