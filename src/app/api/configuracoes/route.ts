import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { validate, updateSettingsSchema } from "@/lib/validation"
import { sanitizeHtml } from "@/lib/security"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"

export async function GET() {
  try {
    const psychologistId = await requireAuth()

    const user = await prisma.user.findUnique({
      where: { id: psychologistId },
      select: { name: true, email: true, phone: true, crp: true, specialty: true, bio: true, pixKey: true, paymentInfo: true },
    })

    if (!user) {
      return apiError("Usuário não encontrado", 404)
    }

    return apiSuccess(user)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return apiError("Erro ao buscar configurações")
  }
}

export async function PUT(request: Request) {
  try {
    const psychologistId = await requireAuth()

    const raw = await request.json()
    const result = validate(updateSettingsSchema, raw)
    if (result.error) return result.error

    const data = result.data! as Record<string, unknown>
    const textFields = ["name", "specialty", "bio", "paymentInfo"] as const
    for (const field of textFields) {
      if (typeof data[field] === "string") {
        data[field] = sanitizeHtml(data[field] as string)
      }
    }

    const user = await prisma.user.update({
      where: { id: psychologistId },
      data,
      select: { name: true, email: true, phone: true, crp: true, specialty: true, bio: true, pixKey: true, paymentInfo: true },
    })

    return apiSuccess(user)
  } catch (error) {
    console.error("Error updating settings:", error)
    return apiError("Erro ao salvar configurações")
  }
}
