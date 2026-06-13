import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { logAudit, sanitizeHtml } from "@/lib/security"
import { rateLimitMiddleware } from "@/lib/rate-limit"

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(120, "Nome muito longo"),
  email: z.string().email("Email inválido").max(255),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").max(128, "Senha muito longa"),
  crp: z.string().max(20).optional().or(z.literal("")),
})

const rateLimit = rateLimitMiddleware(3, 60000)

export async function POST(request: Request) {
  const blocked = await rateLimit(request)
  if (blocked) return blocked

  try {
    const raw = await request.json()
    const parse = registerSchema.safeParse(raw)
    if (!parse.success) {
      return NextResponse.json({
        error: "Dados inválidos",
        details: parse.error.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
      }, { status: 400 })
    }

    const { name, email, password, crp } = parse.data
    const sanitizedName = sanitizeHtml(name.trim())

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email,
        password: hashedPassword,
        crp: crp || null,
        role: "PSYCHOLOGIST",
        permissions: {
          create: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })

    await logAudit(user.id, "REGISTER", "User", user.id, "Novo usuário cadastrado")

    return NextResponse.json(
      { message: "Conta criada com sucesso", user },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
