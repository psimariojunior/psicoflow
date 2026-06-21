import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { logAudit, sanitizeHtml } from "@/lib/security"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import { sendEmail } from "@/lib/email"

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    sendEmail(
      email,
      "Bem-vindo ao PsicoFlow!",
      `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Bem-vindo ao PsicoFlow!</h2>
        <p>Olá <strong>${sanitizedName}</strong>!</p>
        <p>Sua conta foi criada com sucesso.</p>
        <p>Você tem <strong>14 dias de trial gratuito</strong> para testar todas as funcionalidades.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${appUrl}/login"
             style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Acessar PsicoFlow
          </a>
        </div>
        <p style="font-size: 0.875rem; color: #666;">
          Se tiver alguma dúvida, responda este email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 0.75rem; color: #999; text-align: center;">PsicoFlow - Gestão para Psicólogos</p>
      </div>`
    ).catch((err) => console.error("[register] Failed to send welcome email:", err))

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
