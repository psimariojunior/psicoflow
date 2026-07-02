import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { logAudit, sanitizeHtml } from "@/lib/security"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import { sendEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter no mínimo 2 caracteres").max(120, "Nome muito longo"),
  email: z.string().email("Email inválido").max(255),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").max(128, "Senha muito longa"),
  crp: z.string().max(20).optional().or(z.literal("")),
  referralCode: z.string().max(20).optional().or(z.literal("")),
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

    const { name, email, password, crp, referralCode } = parse.data
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

    const normalizedReferralCode = referralCode?.trim().toUpperCase() || null
    const referrer = normalizedReferralCode
      ? await prisma.user.findUnique({
          where: { referralCode: normalizedReferralCode },
          select: { id: true },
        })
      : null

    const hashedPassword = await bcrypt.hash(password, 12)

    // Auto-promote first user to ADMIN
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    const userRole = adminCount === 0 ? "ADMIN" : "PSYCHOLOGIST"

    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email,
        password: hashedPassword,
        crp: crp || null,
        role: userRole,
        referredById: referrer?.id || null,
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

    if (normalizedReferralCode && referrer) {
      if (referrer && referrer.id !== user.id) {
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referredId: user.id,
            code: normalizedReferralCode,
          },
        }).catch(() => {})
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    sendEmail(
      email,
      "Bem-vindo ao PsiHumanis!",
      `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
      <div style="background:linear-gradient(135deg,#0D9488,#0F766E);padding:32px 24px;text-align:center">
        <div style="width:56px;height:56px;background:#fff;border-radius:14px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:28px">🧠</div>
        <h1 style="color:#fff;font-size:24px;font-weight:700;margin:0 0 4px">Bem-vindo ao PsiHumanis!</h1>
        <p style="color:#a7f3d0;font-size:14px;margin:0">Sua conta está pronta para usar</p>
      </div>
      <div style="padding:32px 24px">
        <p style="color:#1e293b;font-size:16px;line-height:1.6;margin:0 0 16px">Olá <strong>${sanitizedName}</strong>!</p>
        <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 24px">Sua conta foi criada com sucesso. Você tem <strong style="color:#0D9488">14 dias de trial gratuito</strong> para testar todas as funcionalidades sem compromisso.</p>
        <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:16px 20px;margin:0 0 24px">
          <p style="color:#0f766e;font-size:13px;font-weight:600;margin:0 0 12px">✨ O que você pode fazer agora:</p>
          <ul style="color:#115e59;font-size:13px;line-height:1.8;margin:0;padding-left:20px">
            <li>Cadastrar seus pacientes e criar prontuários digitais</li>
            <li>Agendar consultas e configurar sua disponibilidade</li>
            <li>Iniciar atendimentos na sala virtual segura</li>
            <li>Enviar lembretes automáticos por WhatsApp e email</li>
            <li>Acompanhar seu faturamento e indicadores</li>
          </ul>
        </div>
        <div style="text-align:center;margin:0 0 24px">
          <a href="${appUrl}/login" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#0D9488,#0F766E);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;font-size:15px;box-shadow:0 4px 12px rgba(13,148,136,0.3)">Acessar PsiHumanis →</a>
        </div>
        <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 8px;border-top:1px solid #e2e8f0;padding-top:20px">Precisa de ajuda? Responda este email ou acesse o suporte dentro da plataforma.</p>
        <p style="color:#cbd5e1;font-size:12px;text-align:center;margin:0">PsiHumanis — Gestão para Psicólogos · CRP 04/52274</p>
      </div>
    </div>
  </div>
</body>
</html>`
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
