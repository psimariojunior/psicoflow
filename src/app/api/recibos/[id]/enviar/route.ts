import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, apiSuccess } from "@/lib/api-helpers"
import { sendEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const receipt = await prisma.receipt.findFirst({
      where: { id: params.id, psychologistId },
    })

    if (!receipt) return apiError("Recibo não encontrado", 404)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const pdfUrl = `${appUrl}/api/recibos/${receipt.id}/pdf`

    const html = `
<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h1 style="color: #0D9488; font-size: 1.5rem; margin: 0;">PsiHumanis</h1>
    <p style="color: #666; margin: 0;">Recibo de pagamento</p>
  </div>
  <div style="background: #f8fafc; border-radius: 8px; padding: 24px;">
    <p style="margin: 0 0 16px;">Ol\u00e1, <strong>${receipt.patientName}</strong>!</p>
    <p style="margin: 0 0 8px;">Segue o recibo da sua consulta:</p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px 0; color: #666;">Recibo</td><td style="padding: 8px 0;"><strong>${receipt.number}</strong></td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Data</td><td style="padding: 8px 0;"><strong>${new Date(receipt.issueDate).toLocaleDateString("pt-BR")}</strong></td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Descri\u00e7\u00e3o</td><td style="padding: 8px 0;"><strong>${receipt.description}</strong></td></tr>
      <tr><td style="padding: 8px 0; color: #666;">Valor</td><td style="padding: 8px 0;"><strong>R$ ${receipt.amount.toFixed(2).replace(".", ",")}</strong></td></tr>
    </table>
    <p style="margin-top: 16px;">
      <a href="${pdfUrl}" style="display: inline-block; padding: 12px 24px; background: #0D9488; color: #fff; text-decoration: none; border-radius: 6px;">
        Visualizar Recibo
      </a>
    </p>
  </div>
  <p style="text-align: center; font-size: 0.75rem; color: #999; margin-top: 24px;">PsiHumanis — Gest\u00e3o de Psicologia</p>
</div>`

    const error = await sendEmail(
      receipt.patientId
        ? (await prisma.patient.findUnique({ where: { id: receipt.patientId }, select: { email: true } }))?.email || ""
        : "",
      `Recibo ${receipt.number} - PsiHumanis`,
      html
    )

    if (error) return apiError("Erro ao enviar email: " + error)

    await prisma.receipt.update({
      where: { id: receipt.id },
      data: { status: "SENT", sentAt: new Date() },
    })

    return apiSuccess({ message: "Recibo enviado com sucesso" })
  } catch (error) {
    logger.error("Error sending receipt email", { error: String(error) })
    return apiError("Erro ao enviar recibo por email")
  }
}
