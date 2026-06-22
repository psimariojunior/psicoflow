import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const psychologistId = await requireAuth()

    const receipt = await prisma.receipt.findFirst({
      where: { id: params.id, psychologistId },
    })

    if (!receipt) return apiError("Recibo não encontrado", 404)

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Recibo - ${receipt.number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; }
    .container { max-width: 700px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 16px; padding: 48px; }
    .header { text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 24px; margin-bottom: 32px; }
    .header h1 { font-size: 24px; color: #1e40af; margin-bottom: 4px; }
    .header .subtitle { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; }
    .number { text-align: center; margin-bottom: 32px; }
    .number h2 { font-size: 20px; color: #1e40af; letter-spacing: 1px; }
    .number small { color: #94a3b8; font-size: 12px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
    .info-group { padding: 12px; background: #f8fafc; border-radius: 8px; }
    .info-group.full { grid-column: 1 / -1; }
    .info-group label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px; }
    .info-group span { font-size: 15px; color: #0f172a; font-weight: 500; }
    .divider { border: none; border-top: 1px dashed #cbd5e1; margin: 24px 0; }
    .amount-section { text-align: center; margin-bottom: 32px; }
    .amount-section .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
    .amount-section .value { font-size: 36px; font-weight: 700; color: #1e40af; margin-top: 4px; }
    .amount-section .method { font-size: 14px; color: #475569; margin-top: 4px; }
    .qrcode { text-align: center; margin-bottom: 32px; }
    .qrcode-placeholder { display: inline-flex; align-items: center; justify-content: center; width: 160px; height: 160px; background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; }
    .qrcode-placeholder svg { width: 64px; height: 64px; fill: #94a3b8; }
    .footer { text-align: center; border-top: 2px solid #e2e8f0; padding-top: 16px; }
    .footer p { font-size: 12px; color: #94a3b8; }
    @media print { body { padding: 0; } .container { border: none; box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>PsicoFlow</h1>
      <p class="subtitle">Gest\u00e3o em Psicologia</p>
    </div>
    <div class="number">
      <h2>RECIBO ${receipt.number}</h2>
      <small>Documento comprobat\u00f3rio de pagamento</small>
    </div>
    <div class="info-grid">
      <div class="info-group">
        <label>Data de Emiss\u00e3o</label>
        <span>${new Date(receipt.issueDate).toLocaleDateString("pt-BR")}</span>
      </div>
      <div class="info-group">
        <label>Status</label>
        <span>${receipt.status === "CANCELLED" ? "CANCELADO" : "EMITIDO"}</span>
      </div>
      <div class="info-group full">
        <label>Psic\u00f3logo(a)</label>
        <span>${process.env.PSYCHOLOGIST_NAME || "Psic\u00f3logo"} - CRP ${process.env.PSYCHOLOGIST_CRP || ""}</span>
      </div>
      <div class="info-group full">
        <label>Paciente</label>
        <span>${receipt.patientName}${receipt.patientDoc ? ` - CPF: ${receipt.patientDoc}` : ""}</span>
      </div>
      <div class="info-group full">
        <label>Descri\u00e7\u00e3o</label>
        <span>${receipt.description}</span>
      </div>
    </div>
    <hr class="divider" />
    <div class="amount-section">
      <p class="label">Valor</p>
      <p class="value">R$ ${receipt.amount.toFixed(2).replace(".", ",")}</p>
      ${receipt.paymentMethod ? `<p class="method">Forma de pagamento: ${receipt.paymentMethod}</p>` : ""}
    </div>
    <div class="qrcode">
      <div class="qrcode-placeholder">
        <svg viewBox="0 0 24 24"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm10 0h2v2h-2v-2zm0 4h2v2h-2v-2zm-4-4h2v2h-2v-2zm4-4h2v2h-2v-2zm2 2h2v2h-2v-2z"/></svg>
      </div>
      <p style="font-size: 11px; color: #94a3b8; margin-top: 8px;">QR Code para pagamento</p>
    </div>
    <div class="footer">
      <p>Documento emitido pelo PsicoFlow \u2014 Gest\u00e3o em Psicologia</p>
      <p style="margin-top: 4px;">Este \u00e9 um documento v\u00e1lido como comprovante de pagamento.</p>
    </div>
  </div>
  <script>window.print()</script>
</body>
</html>`

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  } catch (error) {
    logger.error("Error generating receipt PDF", { error: String(error) })
    return apiError("Erro ao gerar PDF do recibo")
  }
}
