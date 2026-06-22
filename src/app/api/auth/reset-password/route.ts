import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { rateLimitMiddleware } from "@/lib/rate-limit"
import { z } from "zod"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(128),
})

export async function POST(request: Request) {
  const limit = rateLimitMiddleware(5, 60000)
  const blocked = await limit(request)
  if (blocked) return blocked

  try {
    const raw = await request.json()
    const parsed = resetPasswordSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }
    const { token, password } = parsed.data

    const sessionToken = await prisma.sessionToken.findUnique({
      where: { token },
      include: { user: true },
    })

    if (!sessionToken) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 })
    }

    if (new Date() > sessionToken.expires) {
      await prisma.sessionToken.delete({ where: { id: sessionToken.id } })
      return NextResponse.json({ error: "Token expirado. Solicite um novo." }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: sessionToken.userId },
      data: { password: hashedPassword },
    })

    await prisma.sessionToken.delete({ where: { id: sessionToken.id } })

    logger.info("Password reset successful", { userId: sessionToken.userId })

    return NextResponse.json({ message: "Senha redefinida com sucesso" })
  } catch (error) {
    logger.error("Reset password error", { error: String(error) })
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
