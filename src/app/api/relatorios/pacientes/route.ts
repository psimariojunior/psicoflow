export const dynamic = "force-dynamic"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-helpers"
import { generateReportHTML } from "@/lib/pdf"

export async function GET() {
  try {
    const psychologistId = await requireAuth()

    const patients = await prisma.patient.findMany({
      where: { psychologistId },
      include: {
        appointments: {
          select: { startTime: true, status: true },
          orderBy: { startTime: "desc" },
        },
      },
      orderBy: { name: "asc" },
    })

    const rows = patients.map((p) => {
      const total = p.appointments.length
      const last = p.appointments.length > 0 ? p.appointments[0].startTime : null
      return `<tr>
        <td>${p.name}</td>
        <td>${p.email || "—"}</td>
        <td>${p.phone || "—"}</td>
        <td>${p.cpf || "—"}</td>
        <td style="text-align:center">${total}</td>
        <td>${last ? new Date(last).toLocaleDateString("pt-BR") : "—"}</td>
        <td>${new Date(p.createdAt).toLocaleDateString("pt-BR")}</td>
      </tr>`
    }).join("\n")

    const content = `
      <p style="color:#666;font-size:13px;margin-bottom:16px">Total de pacientes: <strong>${patients.length}</strong></p>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Telefone</th>
            <th>CPF</th>
            <th>Consultas</th>
            <th>Última Consulta</th>
            <th>Cadastro</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="7" style="text-align:center;color:#999">Nenhum paciente encontrado</td></tr>'}
        </tbody>
      </table>`

    const html = generateReportHTML("Relatório de Pacientes", content)

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
