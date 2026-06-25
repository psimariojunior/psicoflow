import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"
import { requireAuth, apiError, isAuthError } from "@/lib/api-helpers"

export const dynamic = "force-dynamic"

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return ""
  const str = String(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function toCsv(rows: Record<string, unknown>[], headers: string[]): string {
  const head = headers.join(",")
  const body = rows
    .map((row) => headers.map((h) => csvEscape(row[h])).join(","))
    .join("\n")
  return `${head}\n${body}`
}

export async function GET(req: Request) {
  try {
    const psychologistId = await requireAuth()
    const { searchParams } = new URL(req.url)
    const format = (searchParams.get("format") || "json").toLowerCase()

    const [patients, appointments, sessions, transactions, invoices] = await Promise.all([
      prisma.patient.findMany({
        where: { psychologistId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          cpf: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.appointment.findMany({
        where: { psychologistId },
        include: { patient: { select: { name: true } } },
        orderBy: { startTime: "desc" },
      }),
      prisma.therapySession.findMany({
        where: { psychologistId },
        include: { patient: { select: { name: true } } },
        orderBy: { date: "desc" },
      }),
      prisma.financialTransaction.findMany({
        where: { psychologistId },
        include: { patient: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.invoice.findMany({
        where: { psychologistId },
        include: { patient: { select: { name: true } } },
        orderBy: { issueDate: "desc" },
      }),
    ])

    const stamp = new Date().toISOString().slice(0, 10)

    if (format === "json") {
      const payload = {
        exportedAt: new Date().toISOString(),
        psychologistId,
        patients: patients.map((p) => ({
          name: p.name,
          email: p.email,
          phone: p.phone,
          cpf: p.cpf,
          createdAt: p.createdAt,
        })),
        appointments: appointments.map((a) => ({
          patient: a.patient.name,
          date: a.startTime,
          status: a.status,
          type: a.type,
        })),
        sessions: sessions.map((s) => ({
          patient: s.patient.name,
          date: s.date,
          notes: s.notes,
        })),
        transactions: transactions.map((t) => ({
          description: t.description,
          amount: t.amount,
          type: t.type,
          date: t.createdAt,
        })),
        invoices: invoices.map((i) => ({
          patient: i.patient.name,
          amount: i.totalAmount,
          status: i.status,
          date: i.issueDate,
        })),
      }

      const json = JSON.stringify(payload, null, 2)
      return new Response(json, {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="psihumanis-backup-${stamp}.json"`,
          "Cache-Control": "no-store",
        },
      })
    }

    if (format !== "csv") {
      return apiError("Formato inválido. Use format=csv ou format=json", 400)
    }

    const patientRows = patients.map((p) => ({
      name: p.name,
      email: p.email ?? "",
      phone: p.phone ?? "",
      cpf: p.cpf ?? "",
      createdAt: p.createdAt.toISOString(),
    }))
    const appointmentRows = appointments.map((a) => ({
      patient: a.patient.name,
      date: a.startTime.toISOString(),
      status: a.status,
      type: a.type ?? "",
    }))
    const sessionRows = sessions.map((s) => ({
      patient: s.patient.name,
      date: s.date.toISOString(),
      notes: s.notes ?? "",
    }))
    const transactionRows = transactions.map((t) => ({
      description: t.description,
      amount: t.amount,
      type: t.type,
      date: t.createdAt.toISOString(),
    }))
    const invoiceRows = invoices.map((i) => ({
      patient: i.patient.name,
      amount: i.totalAmount,
      status: i.status,
      date: i.issueDate.toISOString(),
    }))

    const csv = [
      "# PACIENTES",
      toCsv(patientRows, ["name", "email", "phone", "cpf", "createdAt"]),
      "",
      "# CONSULTAS",
      toCsv(appointmentRows, ["patient", "date", "status", "type"]),
      "",
      "# SESSOES",
      toCsv(sessionRows, ["patient", "date", "notes"]),
      "",
      "# TRANSACOES FINANCEIRAS",
      toCsv(transactionRows, ["description", "amount", "type", "date"]),
      "",
      "# FATURAS",
      toCsv(invoiceRows, ["patient", "amount", "status", "date"]),
      "",
    ].join("\n")

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="psihumanis-backup-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    if (isAuthError(error)) return apiError("Não autorizado", 401)
    logger.error("Error exporting data", { error: String(error) })
    return apiError("Erro ao exportar dados")
  }
}

export async function POST() {
  return apiError("Método não permitido", 405)
}
