import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { logAudit, sanitizeHtml } from "@/lib/security"
import { validate, createPatientSchema } from "@/lib/validation"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export async function GET(request: NextRequest) {
  try {
    const psychologistId = await requireAuth()

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")))

    const where: Prisma.PatientWhereInput = {
      psychologistId,
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

    return apiSuccess({
      patients,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    logger.error("Error fetching patients", { error: String(error) })
    return apiError("Erro ao buscar pacientes")
  }
}

export async function POST(request: Request) {
  try {
    const psychologistId = await requireAuth()

    const data = await request.json()
    const { error } = validate(createPatientSchema, data)
    if (error) return error

    const patient = await prisma.patient.create({
      data: {
        name: sanitizeHtml(data.name),
        email: data.email || null,
        phone: data.phone || null,
        cpf: data.cpf || null,
        rg: data.rg || null,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender ? sanitizeHtml(data.gender) : null,
        maritalStatus: data.maritalStatus ? sanitizeHtml(data.maritalStatus) : null,
        profession: data.profession ? sanitizeHtml(data.profession) : null,
        address: data.address ? sanitizeHtml(data.address) : null,
        neighborhood: data.neighborhood ? sanitizeHtml(data.neighborhood) : null,
        city: data.city ? sanitizeHtml(data.city) : null,
        state: data.state ? sanitizeHtml(data.state) : null,
        zipCode: data.zipCode || null,
        emergencyContact: data.emergencyContact ? sanitizeHtml(data.emergencyContact) : null,
        emergencyPhone: data.emergencyPhone || null,
        healthInsurance: data.healthInsurance ? sanitizeHtml(data.healthInsurance) : null,
        insuranceNumber: data.insuranceNumber ? sanitizeHtml(data.insuranceNumber) : null,
        referredBy: data.referredBy ? sanitizeHtml(data.referredBy) : null,
        observations: data.observations ? sanitizeHtml(data.observations) : null,
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

    return apiSuccess(patient, 201)
  } catch (error) {
    logger.error("Error creating patient", { error: String(error) })
    return apiError("Erro ao cadastrar paciente")
  }
}
