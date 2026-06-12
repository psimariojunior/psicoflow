import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate, updateSettingsSchema } from "@/lib/validation"
import { sanitizeHtml } from "@/lib/security"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as { id: string }).id },
      select: { name: true, email: true, phone: true, crp: true, specialty: true, bio: true, pixKey: true, paymentInfo: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

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
      where: { id: (session.user as { id: string }).id },
      data,
      select: { name: true, email: true, phone: true, crp: true, specialty: true, bio: true, pixKey: true, paymentInfo: true },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Erro ao salvar configurações" },
      { status: 500 }
    )
  }
}
