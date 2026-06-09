import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { logAudit, sanitizeHtml } from "@/lib/security"
import { validate, createPatientSchema } from "@/lib/validation"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))

    const where: Record<string, unknown> = {
      psychologistId: (session.user as { id: string }).id,
      ...(search ? {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      } : {}),
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.patient.count({ where }),
    ])

    return NextResponse.json({
      patients,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    logger.error("Error fetching patients", { error: String(error) })
    return NextResponse.json(
      { error: "Erro ao buscar pacientes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const { error } = validate(createPatientSchema, data)
    if (error) return error

    const psychologistId = (session.user as { id: string }).id

    const patient = await prisma.patient.create({
      data: {
        name: sanitizeHtml(data.name),
        email: data.email || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        rg: data.rg || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender || null,
        maritalStatus: data.maritalStatus || null,
        profession: data.profession || null,
        address: data.address || null,
        neighborhood: data.neighborhood || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        emergencyContact: data.emergencyContact || null,
        emergencyPhone: data.emergencyPhone || null,
        healthInsurance: data.healthInsurance || null,
        insuranceNumber: data.insuranceNumber || null,
        referredBy: data.referredBy || null,
        observations: data.observations || null,
        privacyConsent: data.privacyConsent || false,
        psychologistId,
      },
    })

    await logAudit(
      psychologistId,
      "CREATE",
      "Patient",
      patient.id,
      `Paciente ${patient.name} cadastrado`
    )

    return NextResponse.json(patient, { status: 201 })
  } catch (error) {
    logger.error("Error creating patient", { error: String(error) })
    return NextResponse.json(
      { error: "Erro ao cadastrar paciente" },
      { status: 500 }
    )
  }
}
