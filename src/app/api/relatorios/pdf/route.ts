export const dynamic = "force-dynamic"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

function getSeverity(type: string, score: number): string {
  switch (type) {
    case "PHQ9":
      if (score >= 20) return "Severa"
      if (score >= 15) return "Moderadamente severa"
      if (score >= 10) return "Moderada"
      if (score >= 5) return "Leve"
      return "Mínima"
    case "GAD7":
      if (score >= 15) return "Severa"
      if (score >= 10) return "Moderada"
      if (score >= 5) return "Leve"
      return "Mínima"
    case "BECK":
      if (score > 40) return "Extrema"
      if (score >= 31) return "Grave"
      if (score >= 21) return "Moderada"
      if (score >= 17) return "Limítrofe"
      if (score >= 11) return "Leve"
      return "Normal"
    case "PSS":
      if (score >= 27) return "Alto"
      if (score >= 14) return "Moderado"
      return "Baixo"
    case "MINI":
      if (score >= 6) return "Alto"
      if (score >= 3) return "Moderado"
      return "Baixo"
    default:
      return "Não classificado"
  }
}

function getBarColor(type: string): string {
  switch (type) {
    case "PHQ9": return "#22c55e"
    case "GAD7": return "#ef4444"
    case "BECK": return "#3b82f6"
    case "PSS": return "#f59e0b"
    case "MINI": return "#8b5cf6"
    default: return "#6b7280"
  }
}

function getMaxScore(type: string): number {
  switch (type) {
    case "PHQ9": return 27
    case "GAD7": return 21
    case "BECK": return 63
    case "PSS": return 40
    case "MINI": return 16
    default: return 100
  }
}

function renderQuestionnaireSection(response: any, typeLabel: string): string {
  const score = response.totalScore ?? 0
  const severity = getSeverity(response.questionnaire.type, score)
  const maxScore = getMaxScore(response.questionnaire.type)
  const barColor = getBarColor(response.questionnaire.type)
  const barPercent = Math.min((score / maxScore) * 100, 100)

  const severityColor =
    severity === "Mínima" || severity === "Baixo" || severity === "Normal" ? "#22c55e" :
    severity === "Leve" || severity === "Limítrofe" ? "#f59e0b" :
    severity === "Moderada" || severity === "Moderado" ? "#f97316" :
    "#ef4444"

  const itemsHtml = response.answers
    .sort((a: any, b: any) => (a.question?.questionOrder ?? 0) - (b.question?.questionOrder ?? 0))
    .map((a: any) => {
      const label = response.questionnaire.type === "MINI"
        ? (a.value === 1 ? "Sim" : "Não")
        : `Valor: ${a.value}`
      return `
        <tr>
          <td style="padding:6px 8px;border:1px solid #d1d5db;font-size:13px">${a.question?.questionOrder}.</td>
          <td style="padding:6px 8px;border:1px solid #d1d5db;font-size:13px">${a.question?.questionText || ""}</td>
          <td style="padding:6px 8px;border:1px solid #d1d5db;font-size:13px;text-align:center;font-weight:600">${label}</td>
        </tr>`
    }).join("")

  return `
    <div style="margin-bottom:30px;page-break-inside:avoid">
      <h2 style="color:#1e293b;font-size:16px;margin:0 0 4px 0">${response.questionnaire.title}</h2>
      <p style="color:#64748b;font-size:12px;margin:0 0 12px 0">Realizado em: ${new Date(response.completedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>

      <div style="display:flex;gap:20px;margin-bottom:16px;flex-wrap:wrap">
        <div style="background:#f8fafc;border-radius:8px;padding:12px 18px;text-align:center;min-width:100px">
          <div style="font-size:28px;font-weight:700;color:#1e293b">${score}</div>
          <div style="font-size:11px;color:#64748b;text-transform:uppercase">Pontuação</div>
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:12px 18px;text-align:center;min-width:100px">
          <div style="font-size:28px;font-weight:700;color:${severityColor}">${severity}</div>
          <div style="font-size:11px;color:#64748b;text-transform:uppercase">Gravidade</div>
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:12px 18px;text-align:center;min-width:100px">
          <div style="font-size:28px;font-weight:700;color:#1e293b">${maxScore}</div>
          <div style="font-size:11px;color:#64748b;text-transform:uppercase">Máximo</div>
        </div>
      </div>

      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;margin-bottom:4px">
          <span>0</span>
          <span>${maxScore}</span>
        </div>
        <div style="height:12px;background:#e2e8f0;border-radius:6px;overflow:hidden">
          <div style="height:100%;width:${barPercent}%;background:${barColor};border-radius:6px;transition:width 0.3s"></div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-top:12px">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:8px;border:1px solid #d1d5db;font-size:12px;text-align:left;color:#475569;width:40px">#</th>
            <th style="padding:8px;border:1px solid #d1d5db;font-size:12px;text-align:left;color:#475569">Questão</th>
            <th style="padding:8px;border:1px solid #d1d5db;font-size:12px;text-align:center;color:#475569;width:100px">Resposta</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
    </div>`
}

function getQueryTypeFilter(tipo: string): string[] | null {
  if (!tipo || tipo === "all") return null
  const map: Record<string, string> = {
    phq9: "PHQ9",
    gad7: "GAD7",
    beck: "BECK",
    pss: "PSS",
    mini: "MINI",
  }
  const mapped = map[tipo.toLowerCase()]
  return mapped ? [mapped] : null
}

function renderChartSection(responsesByType: Record<string, any[]>): string {
  const colors = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"]
  const labels = {
    PHQ9: "PHQ-9",
    GAD7: "GAD-7",
    BECK: "BDI",
    PSS: "PSS-10",
    MINI: "MINI",
  }

  const types = Object.entries(responsesByType).filter(([_, resps]) => resps.length > 0)

  if (types.length === 0) return ""

  const latestScores = types.map(([type, resps], i) => {
    const latest = resps[0]
    const prev = resps[1]
    const score = latest?.totalScore ?? 0
    const maxScore = getMaxScore(type)
    const barPercent = Math.min((score / maxScore) * 100, 100)
    const change = prev ? score - (prev.totalScore ?? 0) : null
    const changeText = change === null ? "" : change > 0
      ? `<span style="color:#ef4444">▲ +${change}</span>`
      : change < 0
        ? `<span style="color:#22c55e">▼ ${change}</span>`
        : `<span style="color:#64748b">— 0</span>`

    return `
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:13px;font-weight:600;color:#1e293b">${(labels as any)[type] || type}</span>
          <span style="font-size:13px;color:#475569">${score}/${maxScore} ${changeText}</span>
        </div>
        <div style="height:10px;background:#e2e8f0;border-radius:5px;overflow:hidden">
          <div style="height:100%;width:${barPercent}%;background:${colors[i % colors.length]};border-radius:5px"></div>
        </div>
      </div>`
  }).join("")

  return `
    <div style="margin-bottom:30px;page-break-inside:avoid">
      <h2 style="color:#1e293b;font-size:16px;margin:0 0 12px 0">Comparativo - Últimas Avaliações</h2>
      ${latestScores}
    </div>`
}

function renderTimelineSection(responsesByType: Record<string, any[]>): string {
  const colors = ["#22c55e", "#ef4444", "#3b82f6", "#f59e0b", "#8b5cf6"]
  const labels: Record<string, string> = {
    PHQ9: "PHQ-9", GAD7: "GAD-7", BECK: "BDI", PSS: "PSS-10", MINI: "MINI",
  }

  const types = Object.entries(responsesByType).filter(([_, resps]) => resps.length >= 2)

  if (types.length === 0) return ""

  const timelines = types.map(([type, resps], i) => {
    const sorted = [...resps].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    const maxScore = getMaxScore(type)
    const maxVal = Math.max(...sorted.map(r => r.totalScore ?? 0), 1)

    const bars = sorted.map(r => {
      const pct = Math.max(((r.totalScore ?? 0) / maxVal) * 100, 2)
      return `
        <div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1">
          <div style="height:${pct}px;width:100%;background:${colors[i % colors.length]};border-radius:3px 3px 0 0;min-height:6px;max-height:120px"></div>
          <span style="font-size:9px;color:#64748b;text-align:center;line-height:1.1">${new Date(r.completedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</span>
          <span style="font-size:9px;font-weight:600;color:#1e293b">${r.totalScore}</span>
        </div>`
    }).join("")

    return `
      <div style="margin-bottom:20px;page-break-inside:avoid">
        <h3 style="color:#1e293b;font-size:13px;margin:0 0 8px 0">${(labels as any)[type] || type}</h3>
        <div style="display:flex;align-items:flex-end;gap:4px;height:140px;padding:8px;background:#f8fafc;border-radius:8px">
          ${bars}
        </div>
      </div>`
  }).join("")

  return `
    <div style="margin-bottom:30px">
      <h2 style="color:#1e293b;font-size:16px;margin:0 0 12px 0">Evolução ao Longo do Tempo</h2>
      ${timelines}
    </div>`
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new Response("Não autorizado", { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const pacienteId = searchParams.get("pacienteId")
    const tipo = searchParams.get("tipo") || "all"

    if (!pacienteId) {
      return new Response("pacienteId é obrigatório", { status: 400 })
    }

    const patient = await prisma.patient.findFirst({
      where: { id: pacienteId, psychologistId: session.user.id },
    })

    if (!patient) {
      return new Response("Paciente não encontrado", { status: 404 })
    }

    const typeFilter = getQueryTypeFilter(tipo)

    const whereType: any = {}
    if (typeFilter) {
      whereType.type = { in: typeFilter }
    }

    const responses = await prisma.questionnaireResponse.findMany({
      where: {
        patientId: pacienteId,
        psychologistId: session.user.id,
        questionnaire: whereType,
      },
      include: {
        questionnaire: { select: { id: true, title: true, type: true } },
        answers: {
          include: {
            question: { select: { id: true, questionText: true, questionOrder: true } },
          },
          orderBy: { question: { questionOrder: "asc" } },
        },
      },
      orderBy: { completedAt: "desc" },
    })

    const responsesByType: Record<string, any[]> = {}
    for (const r of responses) {
      const type = r.questionnaire.type
      if (!responsesByType[type]) responsesByType[type] = []
      responsesByType[type].push(r)
    }

    const sectionTypes = typeFilter || ["PHQ9", "GAD7", "BECK", "PSS", "MINI"]

    const sectionsHtml = sectionTypes
      .filter(t => responsesByType[t]?.length > 0)
      .map(t => {
        const first = responsesByType[t][0]
        return renderQuestionnaireSection(first, t)
      }).join("")

    const chartHtml = renderChartSection(responsesByType)
    const timelineHtml = renderTimelineSection(responsesByType)

    const typeLabel = tipo === "all" ? "Todas as avaliações" : tipo.toUpperCase()

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Avaliações - ${patient.name}</title>
  <style>
    @page { margin: 20mm 15mm }
    * { margin: 0; padding: 0; box-sizing: border-box }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; line-height: 1.5; padding: 24px }
    @media print {
      body { padding: 0 }
      .no-print { display: none }
    }
    table { width: 100%; border-collapse: collapse }
    th, td { padding: 6px 8px; border: 1px solid #d1d5db; font-size: 13px; text-align: left }
    th { background: #f1f5f9; font-size: 12px; color: #475569 }
    @media print {
      th { background: #f1f5f9 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact }
      div[style*="background"] { -webkit-print-color-adjust: exact; print-color-adjust: exact }
    }
  </style>
</head>
<body>
  <div class="no-print" style="text-align:center;margin-bottom:20px;padding:12px;background:#f1f5f9;border-radius:8px;font-size:14px">
    Este relatório será impresso automaticamente. Se não abrir a janela de impressão, use Ctrl+P.
  </div>

  <div style="border-bottom:3px solid #1e293b;padding-bottom:16px;margin-bottom:24px">
    <h1 style="font-size:22px;color:#0f172a;margin:0">Relatório de Avaliações Psicológicas</h1>
    <div style="display:flex;justify-content:space-between;margin-top:8px;flex-wrap:wrap">
      <div>
        <p style="font-size:14px;color:#475569;margin:2px 0"><strong>Paciente:</strong> ${patient.name}</p>
        <p style="font-size:14px;color:#475569;margin:2px 0"><strong>Tipo:</strong> ${typeLabel}</p>
      </div>
      <div style="text-align:right">
        <p style="font-size:14px;color:#475569;margin:2px 0"><strong>Emissão:</strong> ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
        <p style="font-size:14px;color:#475569;margin:2px 0"><strong>Total de avaliações:</strong> ${responses.length}</p>
      </div>
    </div>
  </div>

  ${chartHtml}
  ${timelineHtml}

  <div style="border-top:2px solid #e2e8f0;padding-top:16px;margin-top:16px">
    <h2 style="color:#1e293b;font-size:16px;margin:0 0 12px 0">Detalhamento por Avaliação</h2>
    ${sectionsHtml}
  </div>

  <div style="margin-top:30px;padding-top:16px;border-top:2px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:11px">
    <p>PsicoFlow — Relatório gerado em ${new Date().toLocaleString("pt-BR")}</p>
  </div>

  <script>
    window.onload = function() { window.print() }
  </script>
</body>
</html>`

    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  } catch (error) {
    console.error("Erro ao gerar relatório PDF:", error)
    return new Response("Erro interno ao gerar relatório", { status: 500 })
  }
}
