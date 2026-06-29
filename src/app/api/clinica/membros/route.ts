import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const addMemberSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120).optional(),
  role: z.enum(["RECEPTIONIST", "PSYCHOLOGIST", "CLINIC_ADMIN"]).default("RECEPTIONIST"),
  crp: z.string().optional(),
  password: z.string().min(8).optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const clinicId = session.user.clinicId
  if (!clinicId) {
    return NextResponse.json({ error: "Sem clínica" }, { status: 403 })
  }

  const members = await prisma.clinicMember.findMany({
    where: { clinicId },
    include: {
      user: { select: { id: true, name: true, email: true, role: true, crp: true, specialty: true, active: true } },
    },
    orderBy: { joinedAt: "asc" },
  })

  return NextResponse.json({ members })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const clinicId = session.user.clinicId
  if (!clinicId) return NextResponse.json({ error: "Sem clínica" }, { status: 403 })
  if (session.user.role !== "ADMIN" && session.user.role !== "CLINIC_ADMIN" && session.user.role !== "PSYCHOLOGIST") {
    return NextResponse.json({ error: "Sem permissão para adicionar membros" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = addMemberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } })

  let userId: string

  if (existingUser) {
    const alreadyMember = await prisma.clinicMember.findFirst({
      where: { clinicId, userId: existingUser.id },
    })
    if (alreadyMember) {
      return NextResponse.json({ error: "Usuário já é membro desta clínica" }, { status: 409 })
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { clinicId },
    })
    userId = existingUser.id
  } else {
    if (!parsed.data.name || !parsed.data.password) {
      return NextResponse.json({ error: "Nome e senha são obrigatórios para novos usuários" }, { status: 400 })
    }
    const hashedPassword = await bcrypt.hash(parsed.data.password, 12)
    const newUser = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name,
        password: hashedPassword,
        role: parsed.data.role,
        crp: parsed.data.crp,
        clinicId,
      },
    })
    userId = newUser.id
  }

  const member = await prisma.clinicMember.create({
    data: {
      clinicId,
      userId,
      role: parsed.data.role,
    },
    include: {
      user: { select: { id: true, name: true, email: true, role: true, crp: true } },
    },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CLINIC_MEMBER_ADDED",
      entity: "ClinicMember",
      entityId: member.id,
      details: `Membro ${parsed.data.email} adicionado como ${parsed.data.role}`,
    },
  })

  return NextResponse.json({ member }, { status: 201 })
}
