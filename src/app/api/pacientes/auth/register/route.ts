import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import bcrypt from "bcryptjs"
import { signPatientToken } from "@/lib/patient-auth"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import { validateOrigin } from "@/lib/csrf"
import { sanitizeHtml } from "@/lib/security"

const registerPatientSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(120, "Nome muito longo"),
  email: z.string().email("Email inválido").max(255),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(128),
  phone: z.string().max(20).optional().or(z.literal("")),
  cpf: z.string().max(14).optional().or(z.literal("")),
  rg: z.string().max(20).optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  gender: z.string().max(20).optional().or(z.literal("")),
  maritalStatus: z.string().max(20).optional().or(z.literal("")),
  profession: z.string().max(100).optional().or(z.literal("")),
  company: z.string().max(100).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  neighborhood: z.string().max(100).optional().or(z.literal("")),
  city: z.string().max(100).optional().or(z.literal("")),
  state: z.string().max(50).optional().or(z.literal("")),
  zipCode: z.string().max(10).optional().or(z.literal("")),
  emergencyContact: z.string().max(100).optional().or(z.literal("")),
  emergencyPhone: z.string().max(20).optional().or(z.literal("")),
  healthInsurance: z.string().max(100).optional().or(z.literal("")),
  insuranceNumber: z.string().max(50).optional().or(z.literal("")),
  referredBy: z.string().max(100).optional().or(z.literal("")),
  howFound: z.string().max(100).optional().or(z.literal("")),
  observations: z.string().max(2000).optional().or(z.literal("")),
})

export async function POST(request: NextRequest) {
  const rateLimit = rateLimitMiddleware(5, 60000)
  const blocked = await rateLimit(request)
  if (blocked) return blocked

  const originCheck = validateOrigin(request)
  if (!originCheck.allowed) return originCheck.error

  try {
    const raw = await request.json()
    const parse = registerPatientSchema.safeParse(raw)
    if (!parse.success) {
      return NextResponse.json({
        error: "Dados inválidos",
        details: parse.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      }, { status: 400 })
    }

    const { name, email, phone, password, cpf, rg, dateOfBirth, gender, maritalStatus, profession, company, address, neighborhood, city, state, zipCode, emergencyContact, emergencyPhone, healthInsurance, insuranceNumber, referredBy, howFound, observations } = parse.data

    const psychologist = await prisma.user.findFirst({
      where: { role: "PSYCHOLOGIST", active: true },
      orderBy: { createdAt: "asc" },
    })

    if (!psychologist) {
      return NextResponse.json({ error: "Nenhum psicólogo disponível" }, { status: 404 })
    }

    const existing = await prisma.patient.findFirst({
      where: { email: email.trim(), psychologistId: psychologist.id },
    })

    if (existing) {
      return NextResponse.json({ error: "Já existe uma conta com este email" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const patient = await prisma.patient.create({
      data: {
        name: sanitizeHtml(name.trim()),
        email: email.trim(),
        phone: phone?.trim() || null,
        password: hashedPassword,
        cpf: cpf?.trim() || null,
        rg: rg?.trim() || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        maritalStatus: maritalStatus || null,
        profession: profession?.trim() || null,
        company: company?.trim() || null,
        address: address?.trim() || null,
        neighborhood: neighborhood?.trim() || null,
        city: city?.trim() || null,
        state: state || null,
        zipCode: zipCode?.trim() || null,
        emergencyContact: emergencyContact?.trim() || null,
        emergencyPhone: emergencyPhone?.trim() || null,
        healthInsurance: healthInsurance?.trim() || null,
        insuranceNumber: insuranceNumber?.trim() || null,
        referredBy: referredBy?.trim() || null,
        howFound: howFound?.trim() || null,
        observations: observations?.trim() || null,
        psychologistId: psychologist.id,
      },
    })

    const token = await signPatientToken({ patientId: patient.id, email: patient.email })

    const { password: _, ...patientSafe } = patient

    return NextResponse.json({
      token,
      patient: {
        ...patientSafe,
        dateOfBirth: patient.dateOfBirth?.toISOString() ?? null,
        createdAt: patient.createdAt.toISOString(),
        updatedAt: patient.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    logger.error("Error registering patient", { error: String(error) })
    return NextResponse.json({ error: "Erro ao criar conta" }, { status: 500 })
  }
}
