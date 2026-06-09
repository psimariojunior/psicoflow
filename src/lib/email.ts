import { Resend } from "resend"

export async function sendEmail(to: string, subject: string, html: string): Promise<string | null> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || "PsicoFlow <onboarding@resend.dev>"

  console.log("[sendEmail] starting", { to, subject, hasApiKey: !!apiKey, from })

  if (!apiKey) {
    const msg = "RESEND_API_KEY não configurada"
    console.warn("[sendEmail]", msg)
    return msg
  }
  try {
    const resend = new Resend(apiKey)
    console.log("[sendEmail] calling Resend API...")
    const result = await resend.emails.send({
      from,
      to: [to],
      subject,
      html,
    })
    if (result.error) {
      const msg = typeof result.error === "string" ? result.error : result.error.message || "Erro desconhecido da Resend"
      console.error("[sendEmail] Resend API error", result.error)
      return msg
    }
    console.log("[sendEmail] success", { id: result.data?.id, to, subject })
    return null
  } catch (err) {
    const msg = String(err)
    console.error("[sendEmail] exception", msg)
    return msg
  }
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<string | null> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const resetUrl = `${appUrl}/reset-password?token=${token}`
  return sendEmail(
    email,
    "Recuperação de Senha - PsicoFlow",
    `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
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
    </div>`
  )
}

export async function sendAppointmentReminderEmail(
  to: string,
  patientName: string,
  psychologistName: string,
  date: string,
  time: string,
  type: string,
  modality: string
): Promise<string | null> {
  return sendEmail(
    to,
    "Lembrete de Consulta - PsicoFlow",
    `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2563eb; font-size: 1.5rem; margin: 0;">PsicoFlow</h1>
        <p style="color: #666; margin: 0;">Seu lembrete de consulta</p>
      </div>
      <div style="background: #f8fafc; border-radius: 8px; padding: 24px;">
        <p style="font-size: 1.125rem; margin: 0 0 16px;">Olá, <strong>${patientName}</strong>!</p>
        <p style="margin: 0 0 8px;">Você tem uma consulta agendada:</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666;">Data</td><td style="padding: 8px 0;"><strong>${date}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Horário</td><td style="padding: 8px 0;"><strong>${time}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Tipo</td><td style="padding: 8px 0;"><strong>${type}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Modalidade</td><td style="padding: 8px 0;"><strong>${modality === "online" ? "Online" : "Presencial"}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Psicólogo(a)</td><td style="padding: 8px 0;"><strong>${psychologistName}</strong></td></tr>
        </table>
        ${modality === "online"
          ? '<p style="margin-top: 16px; padding: 12px; background: #e0f2fe; border-radius: 6px; font-size: 0.875rem;">A consulta ser\u00e1 online. Acesse o link da sala virtual no momento da consulta.</p>'
          : '<p style="margin-top: 16px; padding: 12px; background: #f0fdf4; border-radius: 6px; font-size: 0.875rem;">A consulta ser\u00e1 presencial. Compare\u00e7a ao endere\u00e7o do consult\u00f3rio.</p>'}
      </div>
      <p style="text-align: center; font-size: 0.75rem; color: #999; margin-top: 24px;">PsicoFlow — Gestão de Psicologia</p>
    </div>`
  )
}