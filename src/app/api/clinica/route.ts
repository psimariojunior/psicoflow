import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { requireClinicPlan } from "@/lib/check-plan"
import { z } from "zod"

const createClinicSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  let clinicId = session.user.clinicId
  if (!clinicId && (session.user.role === "ADMIN" || session.user.role === "PSYCHOLOGIST")) {
    const clinic = await prisma.clinic.findFirst({ where: { ownerId: session.user.id } })
    clinicId = clinic?.id || null
  }

  if (!clinicId) {
    return NextResponse.json({ clinic: null })
  }

  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, email: true, role: true, crp: true } } },
      },
      _count: { select: { arrivals: true, members: true } },
    },
  })

  return NextResponse.json({ clinic })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  if (session.user.role !== "ADMIN" && session.user.role !== "PSYCHOLOGIST") {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  const planCheck = await requireClinicPlan(session.user.id)
  if (!planCheck.allowed) {
    return NextResponse.json({ error: planCheck.reason, upgradeRequired: true }, { status: 403 })
  }

  const existingClinic = await prisma.clinic.findFirst({ where: { ownerId: session.user.id } })
  if (existingClinic) {
    return NextResponse.json({ error: "Usuário já possui uma clínica" }, { status: 409 })
  }

  const body = await request.json()
  const parsed = createClinicSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 })
  }

  const slug = parsed.data.name
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  const uniqueSlug = `${slug}-${session.user.id.slice(0, 6)}`

  const clinic = await prisma.clinic.create({
    data: {
      name: parsed.data.name,
      slug: uniqueSlug,
      phone: parsed.data.phone,
      address: parsed.data.address,
      city: parsed.data.city,
      state: parsed.data.state,
      ownerId: session.user.id,
    },
  })

  await prisma.user.update({
    where: { id: session.user.id },
    data: { clinicId: clinic.id },
  })

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "CLINIC_CREATED",
      entity: "Clinic",
      entityId: clinic.id,
      details: `Clínica "${clinic.name}" criada`,
    },
  })

  return NextResponse.json({ clinic }, { status: 201 })
}
