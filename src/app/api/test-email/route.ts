import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const to = searchParams.get("to") || "psi_mariojunior@hotmail.com"

  const success = await sendEmail(
    to,
    "Teste PsicoFlow - Resend",
    "<h1>Teste</h1><p>Se você recebeu este email, o Resend está funcionando!</p>"
  )

  return NextResponse.json({ success, to })
}