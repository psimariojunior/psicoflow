export const dynamic = "force-dynamic"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-helpers"
import { generateReportHTML } from "@/lib/pdf"

export async function GET() {
  try {
    const psychologistId = await requireAuth()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    const [allAppointments, appointments] = await Promise.all([
      prisma.appointment.findMany({
        where: { psychologistId },
        select: { status: true, startTime: true, patientId: true },
      }),
      prisma.appointment.findMany({
        where: { psychologistId, startTime: { gte: startOfMonth, lte: endOfMonth } },
        include: { patient: { select: { name: true } } },
        orderBy: { startTime: "asc" },
      }),
    ])

    const statusCounts = new Map<string, number>()
    for (const a of allAppointments) {
      statusCounts.set(a.status, (statusCounts.get(a.status) || 0) + 1)
    }

    const statusLabels: Record<string, string> = {
      SCHEDULED: "Agendada",
      CONFIRMED: "Confirmada",
      COMPLETED: "Realizada",
      CANCELLED: "Cancelada",
      NO_SHOW: "Não Compareceu",
      IN_PROGRESS: "Em Andamento",
      PAUSED: "Pausada",
    }

    const statusColors: Record<string, string> = {
      SCHEDULED: "#0D9488",
      CONFIRMED: "#7c3aed",
      COMPLETED: "#16a34a",
      CANCELLED: "#dc2626",
      NO_SHOW: "#ea580c",
      IN_PROGRESS: "#0891b2",
      PAUSED: "#ca8a04",
    }

    const statusRows = Array.from(statusCounts.entries()).map(([status, count]) => `
      <tr>
        <td><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${statusColors[status] || "#999"};margin-right:8px"></span>${statusLabels[status] || status}</td>
        <td style="text-align:center;font-weight:600">${count}</td>
        <td style="text-align:center">${allAppointments.length > 0 ? Math.round((count / allAppointments.length) * 100) : 0}%</td>
      </tr>
    `).join("")

    const patientMap = new Map<string, { name: string; count: number }>()
    for (const a of appointments) {
      const id = a.patientId
      const name = a.patient.name
      if (patientMap.has(id)) {
        patientMap.get(id)!.count++
      } else {
        patientMap.set(id, { name, count: 1 })
      }
    }

    const patientRows = Array.from(patientMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .map(([_, { name, count }]) => `
        <tr>
          <td>${name}</td>
          <td style="text-align:center;font-weight:600">${count}</td>
        </tr>
      `).join("")

    const monthRows = appointments.map((a) => `
      <tr>
        <td>${new Date(a.startTime).toLocaleDateString("pt-BR")}</td>
        <td>${new Date(a.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</td>
        <td>${a.patient.name}</td>
        <td>${statusLabels[a.status] || a.status}</td>
      </tr>
    `).join("")

    const completed = statusCounts.get("COMPLETED") || 0
    const cancelled = statusCounts.get("CANCELLED") || 0
    const scheduled = statusCounts.get("SCHEDULED") || 0
    const noShow = statusCounts.get("NO_SHOW") || 0

    const content = `
      <div style="display:flex;gap:16px;margin-bottom:24px;flex-wrap:wrap">
        <div style="flex:1;min-width:140px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:14px;text-align:center">
          <div style="font-size:22px;font-weight:700;color:#0D9488">${allAppointments.length}</div>
          <div style="font-size:11px;color:#0f766e;text-transform:uppercase">Total</div>
        </div>
        <div style="flex:1;min-width:140px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px;text-align:center">
          <div style="font-size:22px;font-weight:700;color:#16a34a">${completed}</div>
          <div style="font-size:11px;color:#166534;text-transform:uppercase">Realizadas</div>
        </div>
        <div style="flex:1;min-width:140px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:14px;text-align:center">
          <div style="font-size:22px;font-weight:700;color:#7c3aed">${scheduled}</div>
          <div style="font-size:11px;color:#5b21b6;text-transform:uppercase">Agendadas</div>
        </div>
        <div style="flex:1;min-width:140px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px;text-align:center">
          <div style="font-size:22px;font-weight:700;color:#dc2626">${cancelled}</div>
          <div style="font-size:11px;color:#991b1b;text-transform:uppercase">Canceladas</div>
        </div>
        <div style="flex:1;min-width:140px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:14px;text-align:center">
          <div style="font-size:22px;font-weight:700;color:#ea580c">${noShow}</div>
          <div style="font-size:11px;color:#9a3412;text-transform:uppercase">No-Show</div>
        </div>
      </div>

      <h2 style="font-size:16px;color:#1e293b;margin:0 0 12px 0">Consultas por Status (Todos os Tempos)</h2>
      <table>
        <thead><tr><th>Status</th><th style="text-align:center">Quantidade</th><th style="text-align:center">Percentual</th></tr></thead>
        <tbody>${statusRows}</tbody>
      </table>

      <h2 style="font-size:16px;color:#1e293b;margin:24px 0 12px 0">Distribuição por Paciente (Mês Atual)</h2>
      ${patientRows ? `
      <table>
        <thead><tr><th>Paciente</th><th style="text-align:center">Consultas</th></tr></thead>
        <tbody>${patientRows}</tbody>
      </table>` : '<p style="color:#999;text-align:center;padding:20px">Nenhuma consulta no mês atual</p>'}

      <h2 style="font-size:16px;color:#1e293b;margin:24px 0 12px 0">Agenda do Mês Atual</h2>
      ${monthRows ? `
      <table>
        <thead><tr><th>Data</th><th>Horário</th><th>Paciente</th><th>Status</th></tr></thead>
        <tbody>${monthRows}</tbody>
      </table>` : '<p style="color:#999;text-align:center;padding:20px">Nenhuma consulta agendada no mês</p>'}
    `

    const html = generateReportHTML("Relatório de Agenda", content)

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  } catch (error) {
    if (error instanceof Error && error.name === "AuthError") {
      return new Response("Não autorizado", { status: 401 })
    }
    return new Response("Erro ao gerar relatório", { status: 500 })
  }
}
