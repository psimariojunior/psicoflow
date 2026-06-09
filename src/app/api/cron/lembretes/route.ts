import { NextResponse } from "next/server"
import { processPendingNotifications } from "@/lib/notifications"

import nodemailer from "nodemailer"

async function testBrevo(to?: string): Promise<{ ok: boolean; message: string; code?: string; response?: string }> {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const host = process.env.SMTP_HOST
  if (!user || !pass || !host) return { ok: false, message: "SMTP not configured" }
  try {
    const t = nodemailer.createTransport({ host, port: 587, secure: false, requireTLS: true, auth: { user, pass }, tls: { rejectUnauthorized: true } })
    await t.verify()
    if (to) {
      await t.sendMail({ from: user, to, subject: "Teste PsicoFlow - Brevo", html: "<p>Email enviado via Brevo SMTP!</p>" })
      return { ok: true, message: `Email sent to ${to}` }
    }
    return { ok: true, message: "SMTP connection verified" }
  } catch (err: any) {
    return { ok: false, message: err.message || String(err), code: err.code, response: err.response }
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    if (url.searchParams.has("test")) {
      return NextResponse.json(await testBrevo(url.searchParams.get("to") || undefined))
    }
    const force = url.searchParams.get("force") === "true"
    const result = await processPendingNotifications(force)
    return NextResponse.json({
      ok: true,
      processed: result.sent + result.failed,
      sent: result.sent,
      failed: result.failed,
    })
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  return GET(request)
}
