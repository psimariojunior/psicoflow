export const dynamic = "force-dynamic"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/api-helpers"
import { generateReportHTML } from "@/lib/pdf"

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export async function GET() {
  try {
    const psychologistId = await requireAuth()

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [incomeAgg, expenseAgg, transactions, invoices] = await Promise.all([
      prisma.financialTransaction.aggregate({
        where: { psychologistId, type: "INCOME", paymentStatus: "PAID", paymentDate: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.aggregate({
        where: { psychologistId, type: "EXPENSE", paymentStatus: "PAID", paymentDate: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.financialTransaction.findMany({
        where: { psychologistId, paymentDate: { gte: startOfMonth } },
        include: { patient: { select: { name: true } } },
        orderBy: { paymentDate: "desc" },
      }),
      prisma.invoice.findMany({
        where: { psychologistId, issueDate: { gte: startOfMonth } },
        select: { id: true, totalAmount: true, status: true, paymentMethod: true },
      }),
    ])

    const totalIncome = incomeAgg._sum.amount || 0
    const totalExpenses = expenseAgg._sum.amount || 0

    const incomeTransactions = transactions.filter((t) => t.type === "INCOME")
    const expenseTransactions = transactions.filter((t) => t.type === "EXPENSE")

    const categoryMap = new Map<string, number>()
    for (const t of incomeTransactions) {
      const cat = t.category || "Sem categoria"
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + t.amount)
    }

    const paymentMethodMap = new Map<string, number>()
    for (const t of transactions) {
      const method = t.paymentMethod || "Não informado"
      paymentMethodMap.set(method, (paymentMethodMap.get(method) || 0) + 1)
    }

    const sortedCategories = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1])
    const sortedMethods = Array.from(paymentMethodMap.entries()).sort((a, b) => b[1] - a[1])

    const categoryRows = sortedCategories.map(([cat, amt]) => `
      <tr>
        <td>${cat}</td>
        <td style="text-align:right">${formatBRL(amt)}</td>
      </tr>
    `).join("")

    const methodRows = sortedMethods.map(([method, count]) => `
      <tr>
        <td>${method}</td>
        <td style="text-align:center">${count}</td>
      </tr>
    `).join("")

    const incomeRows = incomeTransactions.slice(0, 20).map((t) => `
      <tr>
        <td>${new Date(t.paymentDate || t.createdAt).toLocaleDateString("pt-BR")}</td>
        <td>${t.description}</td>
        <td>${t.patient?.name || "—"}</td>
        <td>${t.category || "—"}</td>
        <td style="text-align:right;color:#16a34a;font-weight:600">${formatBRL(t.amount)}</td>
      </tr>
    `).join("")

    const expenseRows = expenseTransactions.slice(0, 20).map((t) => `
      <tr>
        <td>${new Date(t.paymentDate || t.createdAt).toLocaleDateString("pt-BR")}</td>
        <td>${t.description}</td>
        <td>${t.category || "—"}</td>
        <td style="text-align:right;color:#dc2626;font-weight:600">-${formatBRL(t.amount)}</td>
      </tr>
    `).join("")

    const content = `
      <div style="display:flex;gap:20px;margin-bottom:24px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;text-align:center">
          <div style="font-size:11px;color:#166534;text-transform:uppercase;margin-bottom:4px">Receitas (Mês)</div>
          <div style="font-size:22px;font-weight:700;color:#16a34a">${formatBRL(totalIncome)}</div>
        </div>
        <div style="flex:1;min-width:200px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;text-align:center">
          <div style="font-size:11px;color:#991b1b;text-transform:uppercase;margin-bottom:4px">Despesas (Mês)</div>
          <div style="font-size:22px;font-weight:700;color:#dc2626">${formatBRL(totalExpenses)}</div>
        </div>
        <div style="flex:1;min-width:200px;background:#f0fdfa;border:1px solid #99f6e4;border-radius:8px;padding:16px;text-align:center">
          <div style="font-size:11px;color:#0f766e;text-transform:uppercase;margin-bottom:4px">Saldo (Mês)</div>
          <div style="font-size:22px;font-weight:700;color:${totalIncome - totalExpenses >= 0 ? "#0D9488" : "#dc2626"}">${formatBRL(totalIncome - totalExpenses)}</div>
        </div>
      </div>

      <h2 style="font-size:16px;color:#1e293b;margin:0 0 12px 0">Receitas por Categoria</h2>
      ${categoryRows ? `
      <table>
        <thead><tr><th>Categoria</th><th style="text-align:right">Valor</th></tr></thead>
        <tbody>${categoryRows}</tbody>
      </table>` : '<p style="color:#999;text-align:center;padding:20px">Nenhuma receita registrada no período</p>'}

      <h2 style="font-size:16px;color:#1e293b;margin:24px 0 12px 0">Métodos de Pagamento</h2>
      ${methodRows ? `
      <table>
        <thead><tr><th>Método</th><th style="text-align:center">Quantidade</th></tr></thead>
        <tbody>${methodRows}</tbody>
      </table>` : '<p style="color:#999;text-align:center;padding:20px">Nenhum pagamento registrado</p>'}

      <h2 style="font-size:16px;color:#1e293b;margin:24px 0 12px 0">Receitas</h2>
      ${incomeRows ? `
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Paciente</th><th>Categoria</th><th style="text-align:right">Valor</th></tr></thead>
        <tbody>${incomeRows}</tbody>
      </table>` : '<p style="color:#999;text-align:center;padding:20px">Nenhuma receita no período</p>'}

      <h2 style="font-size:16px;color:#1e293b;margin:24px 0 12px 0">Despesas</h2>
      ${expenseRows ? `
      <table>
        <thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th style="text-align:right">Valor</th></tr></thead>
        <tbody>${expenseRows}</tbody>
      </table>` : '<p style="color:#999;text-align:center;padding:20px">Nenhuma despesa no período</p>'}
    `

    const html = generateReportHTML("Relatório Financeiro", content)

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
