import nodemailer from "nodemailer"
import { logger } from "./logger"

function getTransporter() {
  const host = process.env.SMTP_HOST
  if (!host) return null

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER || "",
      pass: process.env.SMTP_PASS || "",
    },
  })
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
  const transporter = getTransporter()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const resetUrl = `${appUrl}/reset-password?token=${token}`

  if (!transporter) {
    logger.warn("SMTP not configured. Reset link:", { resetUrl })
    return false
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@psicoflow.com.br",
      to: email,
      subject: "Recuperação de Senha - PsicoFlow",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Recuperação de Senha</h2>
          <p>Você solicitou a redefinição da sua senha no PsicoFlow.</p>
          <p>Clique no link abaixo para criar uma nova senha:</p>
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #fff; text-decoration: none; border-radius: 6px;">
            Redefinir Senha
          </a>
          <p style="margin-top: 24px; font-size: 0.875rem; color: #666;">
            Este link expira em 1 hora.<br>
            Se você não solicitou esta alteração, ignore este email.
          </p>
        </div>
      `,
    })
    logger.info("Password reset email sent", { email })
    return true
  } catch (err) {
    logger.error("Failed to send password reset email", { email, error: String(err) })
    return false
  }
}
