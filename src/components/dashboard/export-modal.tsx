"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileSpreadsheet, FileJson, FileText, Calendar, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportModal({ open, onOpenChange }: ExportModalProps) {
  const [exporting, setExporting] = useState<string | null>(null)

  const exportCSV = async () => {
    setExporting("csv")
    try {
      const res = await fetch("/api/dashboard")
      const json = await res.json()
      const d = json.data
      if (!d) throw new Error("Sem dados")

      const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
      let csv = "\uFEFF"

      csv += "=== MÉTRICAS ===\n"
      csv += `"Indicador";"Valor"\n`
      csv += `${esc("Pacientes Ativos")};${esc(d.stats.totalPatients)}\n`
      csv += `${esc("Consultas Hoje")};${esc(d.stats.appointmentsToday)}\n`
      csv += `${esc("Receita do Mês")};${esc(d.stats.monthlyRevenue)}\n`
      csv += `${esc("Pendências")};${esc(d.stats.pendingPayments)}\n`
      csv += `${esc("Ticket Médio")};${esc(d.indicators.averageTicket)}\n`
      csv += `${esc("Comparecimento")};${esc(d.indicators.completionRate)}%\n`
      csv += `${esc("Cancelamento")};${esc(d.indicators.cancellationRate)}%\n`
      csv += `${esc("Ocupação")};${esc(d.indicators.occupationRate)}%\n\n`

      if (d.monthlyData?.length) {
        csv += "=== RECEITA MENSAL ===\n"
        csv += `"Mês";"Consultas";"Receita"\n`
        for (const row of d.monthlyData) {
          csv += `${esc(row.month)};${esc(row.appointments)};${esc(row.receita)}\n`
        }
        csv += "\n"
      }

      if (d.paymentsByMethod?.length) {
        csv += "=== FORMAS DE PAGAMENTO ===\n"
        csv += `"Método";"Valor"\n`
        for (const row of d.paymentsByMethod) {
          csv += `${esc(row.name)};${esc(row.value)}\n`
        }
        csv += "\n"
      }

      if (d.appointments?.length) {
        csv += "=== PRÓXIMAS CONSULTAS ===\n"
        csv += `"Paciente";"Data";"Status";"Modalidade"\n`
        for (const apt of d.appointments) {
          const date = new Date(apt.startTime).toLocaleString("pt-BR")
          csv += `${esc(apt.patientName)};${esc(date)};${esc(apt.status)};${esc(apt.modality)}\n`
        }
      }

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio-psihumanis-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("CSV exportado com sucesso!")
    } catch {
      toast.error("Erro ao exportar CSV")
    } finally {
      setExporting(null)
    }
  }

  const exportJSON = async () => {
    setExporting("json")
    try {
      const res = await fetch("/api/dashboard")
      const json = await res.json()
      if (!json.data) throw new Error("Sem dados")

      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `dados-psihumanis-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("JSON exportado com sucesso!")
    } catch {
      toast.error("Erro ao exportar JSON")
    } finally {
      setExporting(null)
    }
  }

  const exportSummary = async () => {
    setExporting("summary")
    try {
      const [dashRes, repRes] = await Promise.all([
        fetch("/api/dashboard"),
        fetch("/api/relatorios"),
      ])
      const dash = await dashRes.json()
      const rep = await repRes.json()
      if (!dash.data) throw new Error("Sem dados")

      const d = dash.data
      const r = rep.data

      let txt = ""
      txt += "=".repeat(48) + "\n"
      txt += "  PSIHUMANIS — RELATÓRIO COMPLETO\n"
      txt += `  Gerado em ${new Date().toLocaleString("pt-BR")}\n`
      txt += "=".repeat(48) + "\n\n"

      txt += "📊 MÉTRICAS PRINCIPAIS\n"
      txt += "─".repeat(40) + "\n"
      txt += `  Pacientes ativos:   ${d.stats.totalPatients}\n`
      txt += `  Consultas hoje:     ${d.stats.appointmentsToday}\n`
      txt += `  Receita do mês:     R$ ${d.stats.monthlyRevenue.toFixed(2)}\n`
      txt += `  Pendências:         R$ ${d.stats.pendingPayments.toFixed(2)}\n\n`

      txt += "📈 INDICADORES\n"
      txt += "─".repeat(40) + "\n"
      txt += `  Ticket médio:       R$ ${d.indicators.averageTicket.toFixed(2)}\n`
      txt += `  Comparecimento:     ${d.indicators.completionRate}%\n`
      txt += `  Cancelamento:       ${d.indicators.cancellationRate}%\n`
      txt += `  Ocupação agenda:    ${d.indicators.occupationRate}%\n\n`

      if (r?.summary) {
        txt += "💰 RESUMO FINANCEIRO\n"
        txt += "─".repeat(40) + "\n"
        txt += `  Total receitas:     R$ ${r.summary.totalRevenue.toFixed(2)}\n`
        txt += `  Total despesas:     R$ ${r.summary.totalExpenses.toFixed(2)}\n`
        txt += `  Saldo:              R$ ${r.summary.balance.toFixed(2)}\n`
        txt += `  Total consultas:    ${r.summary.totalAppointments}\n\n`
      }

      txt += "📅 CONSULTAS POR MÊS\n"
      txt += "─".repeat(40) + "\n"
      if (d.monthlyData?.length) {
        for (const row of d.monthlyData) {
          txt += `  ${row.month.padEnd(6)} ${String(row.appointments).padStart(3)} consultas  R$ ${(row.receita || 0).toFixed(2)}\n`
        }
      }
      txt += "\n"

      if (d.appointments?.length) {
        txt += "📋 PRÓXIMAS CONSULTAS\n"
        txt += "─".repeat(40) + "\n"
        for (const apt of d.appointments) {
          txt += `  ${new Date(apt.startTime).toLocaleString("pt-BR")} — ${apt.patientName}\n`
        }
        txt += "\n"
      }

      txt += "=".repeat(48) + "\n"
      txt += "  Relatório gerado por PsiHumanis\n"
      txt += "=".repeat(48) + "\n"

      const blob = new Blob([txt], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `relatorio-completo-${new Date().toISOString().slice(0, 10)}.txt`
      a.click()
      URL.revokeObjectURL(url)
      toast.success("Relatório exportado com sucesso!")
    } catch {
      toast.error("Erro ao exportar relatório")
    } finally {
      setExporting(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="h-5 w-5 text-emerald-500" />
            Exportar Relatórios
          </DialogTitle>
          <DialogDescription>
            Exporte os dados do dashboard em diferentes formatos
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="csv">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="csv" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </TabsTrigger>
            <TabsTrigger value="json" className="gap-2">
              <FileJson className="h-4 w-4" />
              JSON
            </TabsTrigger>
            <TabsTrigger value="summary" className="gap-2">
              <FileText className="h-4 w-4" />
              Relatório
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-3 pt-3">
            <p className="text-sm text-muted-foreground">
              Exporta métricas, receitas mensais, formas de pagamento e próximas consultas em formato CSV (compatível com Excel).
            </p>
            <Button
              onClick={exportCSV}
              disabled={exporting === "csv"}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 gap-2"
            >
              {exporting === "csv" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
              {exporting === "csv" ? "Exportando..." : "Exportar CSV"}
            </Button>
          </TabsContent>

          <TabsContent value="json" className="space-y-3 pt-3">
            <p className="text-sm text-muted-foreground">
              Exporta todos os dados do dashboard em JSON — ideal para backup ou integração com outras ferramentas.
            </p>
            <Button
              onClick={exportJSON}
              disabled={exporting === "json"}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 gap-2"
            >
              {exporting === "json" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileJson className="h-4 w-4" />}
              {exporting === "json" ? "Exportando..." : "Exportar JSON"}
            </Button>
          </TabsContent>

          <TabsContent value="summary" className="space-y-3 pt-3">
            <p className="text-sm text-muted-foreground">
              Gera um relatório completo em texto com todas as métricas, indicadores, receitas e próximas consultas.
            </p>
            <Button
              onClick={exportSummary}
              disabled={exporting === "summary"}
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-600 hover:to-indigo-700 gap-2"
            >
              {exporting === "summary" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              {exporting === "summary" ? "Gerando..." : "Gerar Relatório Completo"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
