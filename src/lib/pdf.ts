export function generateReportHTML(title: string, content: string, logo?: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title} - PsicoFlow</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
    h1 { font-size: 20px; margin: 10px 0; }
    .subtitle { color: #666; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
    th { background: #f8fafc; font-weight: 600; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 11px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">PsicoFlow</div>
    <h1>${title}</h1>
    <p class="subtitle">Gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}</p>
  </div>
  ${content}
  <div class="footer">PsicoFlow — Gestão para Psicólogos | Documento gerado automaticamente</div>
</body>
</html>`
}
