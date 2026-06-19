"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Download, FileText, User, CreditCard, Activity, CheckCircle, Clock, AlertCircle, Loader2, Search } from "lucide-react"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

interface Patient {
  id: string
  name: string
}

interface PatientReport {
  patient: { id: string; name: string; email: string | null; phone: string | null }
  sessions: { total: number; list: { id: string; date: string; type: string | null; status: string }[] }
  questionnaires: { total: number; list: { id: string; title: string; type: string; createdAt: string; totalScore: number }[] }
  appointments: { total: number; completed: number; cancelled: number }
  tasks: { total: number; completed: number; pending: number }
  diary: { totalEntries: number; averageMood: number | null }
}

interface FinancialReport {
  summary: { totalRevenue: number; totalExpenses: number; balance: number; pending: number; overdue: number }
  transactions: { id: string; description: string; type: string; amount: number; category: string | null; paymentDate: string | null; paymentStatus: string; patientName: string | null }[]
}

interface ProducaoReport {
  patients: { total: number; active: number; newInPeriod: number }
  appointments: { total: number; inPeriod: number }
  sessions: { inPeriod: number }
  financial: { revenue: number; expenses: number; balance: number }
  tasks: { completed: number; pending: number; total: number }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
}

export default function ReportsPage() {
  const [tab, setTab] = useState("paciente")

  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState("")
  const [patientPeriod, setPatientPeriod] = useState("30")
  const [patientReport, setPatientReport] = useState<PatientReport | null>(null)
  const [patientLoading, setPatientLoading] = useState(false)

  const [finPeriod, setFinPeriod] = useState("30")
  const [finReport, setFinReport] = useState<FinancialReport | null>(null)
  const [finLoading, setFinLoading] = useState(false)

  const [prodPeriod, setProdPeriod] = useState("30")
  const [prodReport, setProdReport] = useState<ProducaoReport | null>(null)
  const [prodLoading, setProdLoading] = useState(false)

  const [searchPatient, setSearchPatient] = useState("")

  useEffect(() => {
    fetch("/api/pacientes")
      .then(r => r.json())
      .then(data => setPatients(data.patients || []))
      .catch(() => {})
  }, [])

  async function loadPatientReport() {
    if (!selectedPatient) { toast.error("Selecione um paciente"); return }
    setPatientLoading(true)
    setPatientReport(null)
    try {
      const res = await fetch(`/api/relatorios?tipo=paciente&pacienteId=${selectedPatient}&periodo=${patientPeriod}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setPatientReport(data)
    } catch {
      toast.error("Erro ao carregar relatório do paciente")
    } finally {
      setPatientLoading(false)
    }
  }

  async function loadFinReport() {
    setFinLoading(true)
    setFinReport(null)
    try {
      const res = await fetch(`/api/relatorios?tipo=financeiro&periodo=${finPeriod}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setFinReport(data)
    } catch {
      toast.error("Erro ao carregar relatório financeiro")
    } finally {
      setFinLoading(false)
    }
  }

  async function loadProdReport() {
    setProdLoading(true)
    setProdReport(null)
    try {
      const res = await fetch(`/api/relatorios?tipo=producao&periodo=${prodPeriod}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setProdReport(data)
    } catch {
      toast.error("Erro ao carregar relatório de produção")
    } finally {
      setProdLoading(false)
    }
  }

  useEffect(() => { if (tab === "financeiro") loadFinReport() }, [tab, finPeriod])
  useEffect(() => { if (tab === "producao") loadProdReport() }, [tab, prodPeriod])

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchPatient.toLowerCase())
  )

  const statCard = (Icon: typeof DollarSign, label: string, value: string, color: string, bg: string) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", bg)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">Análise detalhada da sua prática clínica</p>
        </div>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" />Exportar PDF
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="paciente"><User className="mr-2 h-4 w-4" />Relatório do Paciente</TabsTrigger>
          <TabsTrigger value="financeiro"><DollarSign className="mr-2 h-4 w-4" />Relatório Financeiro</TabsTrigger>
          <TabsTrigger value="producao"><BarChart3 className="mr-2 h-4 w-4" />Produção Clínica</TabsTrigger>
        </TabsList>

        <TabsContent value="paciente" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2 flex-1 min-w-[200px]">
                  <Label>Paciente</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={searchPatient} onChange={e => setSearchPatient(e.target.value)} className="pl-9" placeholder="Buscar paciente..." />
                  </div>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger><SelectValue placeholder="Selecione um paciente" /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {filteredPatients.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select value={patientPeriod} onValueChange={setPatientPeriod}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={loadPatientReport} disabled={patientLoading || !selectedPatient}>
                  {patientLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Gerar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>

          {patientLoading && (
            <div className="grid gap-4 sm:grid-cols-3">{[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border p-5 space-y-2"><div className="h-4 w-20 animate-shimmer rounded" /><div className="h-7 w-14 animate-shimmer rounded" /></div>
            ))}</div>
          )}

          {patientReport && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <motion.div variants={itemVariants}>{statCard(Calendar, "Sessões Realizadas", String(patientReport.sessions.total), "text-blue-600", "bg-blue-600/10")}</motion.div>
                <motion.div variants={itemVariants}>{statCard(CheckCircle, "Tarefas Concluídas", String(patientReport.tasks.completed), "text-emerald-600", "bg-emerald-600/10")}</motion.div>
                <motion.div variants={itemVariants}>{statCard(Activity, "Média de Humor", patientReport.diary.averageMood !== null ? String(patientReport.diary.averageMood) : "N/A", "text-amber-600", "bg-amber-600/10")}</motion.div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-base">Consultas</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm"><span>Total no período</span><span className="font-medium">{patientReport.appointments.total}</span></div>
                    <div className="flex justify-between text-sm"><span>Realizadas</span><span className="font-medium text-emerald-600">{patientReport.appointments.completed}</span></div>
                    <div className="flex justify-between text-sm"><span>Canceladas</span><span className="font-medium text-red-600">{patientReport.appointments.cancelled}</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Questionários</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm"><span>Total respondidos</span><span className="font-medium">{patientReport.questionnaires.total}</span></div>
                    {patientReport.questionnaires.list.slice(0, 5).map(q => (
                      <div key={q.id} className="flex justify-between text-sm">
                        <span className="truncate text-muted-foreground">{q.title}</span>
                        <span>{q.totalScore}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {patientReport.sessions.list.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Sessões</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {patientReport.sessions.list.map(s => (
                        <div key={s.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                          <span>{formatDate(s.date)}</span>
                          <span className="text-muted-foreground">{s.type || "Sessão"}</span>
                          <Badge variant={s.status === "COMPLETED" ? "success" : "warning"}>{s.status === "COMPLETED" ? "Concluída" : "Pendente"}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="financeiro" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select value={finPeriod} onValueChange={setFinPeriod}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={loadFinReport} disabled={finLoading}>
                  {finLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Gerar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>

          {finLoading && (
            <div className="grid gap-4 sm:grid-cols-3">{[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border p-5 space-y-2"><div className="h-4 w-20 animate-shimmer rounded" /><div className="h-7 w-14 animate-shimmer rounded" /></div>
            ))}</div>
          )}

          {finReport && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <motion.div variants={itemVariants}>{statCard(TrendingUp, "Receita", formatCurrency(finReport.summary.totalRevenue), "text-emerald-600", "bg-emerald-600/10")}</motion.div>
                <motion.div variants={itemVariants}>{statCard(DollarSign, "Despesas", formatCurrency(finReport.summary.totalExpenses), "text-red-600", "bg-red-600/10")}</motion.div>
                <motion.div variants={itemVariants}>{statCard(CreditCard, "Saldo", formatCurrency(finReport.summary.balance), "text-blue-600", "bg-blue-600/10")}</motion.div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-base">Síntese Financeira</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm"><span>Receita</span><span className="font-medium text-emerald-600">{formatCurrency(finReport.summary.totalRevenue)}</span></div>
                    <Progress value={finReport.summary.totalRevenue > 0 ? 100 : 0} className="h-2" indicatorClassName="bg-emerald-500" />
                    <div className="flex justify-between text-sm"><span>Despesas</span><span className="font-medium text-red-600">{formatCurrency(finReport.summary.totalExpenses)}</span></div>
                    <Progress value={finReport.summary.totalExpenses > 0 ? (finReport.summary.totalExpenses / (finReport.summary.totalRevenue || 1)) * 100 : 0} className="h-2" indicatorClassName="bg-red-500" />
                    <div className="flex justify-between text-sm pt-2 border-t"><span>Saldo</span><span className={cn("font-medium", finReport.summary.balance >= 0 ? "text-emerald-600" : "text-red-600")}>{formatCurrency(finReport.summary.balance)}</span></div>
                    <div className="flex justify-between text-sm"><span>Pendente</span><span className="font-medium text-amber-600">{formatCurrency(finReport.summary.pending)}</span></div>
                    <div className="flex justify-between text-sm"><span>Vencido</span><span className="font-medium text-red-600">{formatCurrency(finReport.summary.overdue)}</span></div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">Últimas Transações</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {finReport.transactions.slice(0, 8).map(t => (
                        <div key={t.id} className="flex items-center justify-between text-sm py-1 border-b last:border-0">
                          <div className="min-w-0 flex-1">
                            <p className="truncate">{t.description}</p>
                            <p className="text-xs text-muted-foreground">{t.patientName || t.category || ""}</p>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <p className={cn("font-medium", t.type === "INCOME" ? "text-emerald-600" : "text-red-600")}>
                              {t.type === "INCOME" ? "+" : "-"}{formatCurrency(t.amount)}
                            </p>
                            <Badge variant={t.paymentStatus === "PAID" ? "success" : t.paymentStatus === "OVERDUE" ? "destructive" : "warning"} className="text-[10px]">
                              {t.paymentStatus === "PAID" ? "Pago" : t.paymentStatus === "OVERDUE" ? "Vencido" : "Pendente"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {finReport.transactions.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma transação no período</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="producao" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select value={prodPeriod} onValueChange={setProdPeriod}>
                    <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 dias</SelectItem>
                      <SelectItem value="60">60 dias</SelectItem>
                      <SelectItem value="90">90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={loadProdReport} disabled={prodLoading}>
                  {prodLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Gerar Relatório
                </Button>
              </div>
            </CardContent>
          </Card>

          {prodLoading && (
            <div className="grid gap-4 sm:grid-cols-3">{[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl border p-5 space-y-2"><div className="h-4 w-20 animate-shimmer rounded" /><div className="h-7 w-14 animate-shimmer rounded" /></div>
            ))}</div>
          )}

          {prodReport && (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <motion.div variants={itemVariants}>{statCard(Users, "Pacientes Ativos", String(prodReport.patients.active), "text-blue-600", "bg-blue-600/10")}</motion.div>
                <motion.div variants={itemVariants}>{statCard(Calendar, "Sessões no Período", String(prodReport.sessions.inPeriod), "text-emerald-600", "bg-emerald-600/10")}</motion.div>
                <motion.div variants={itemVariants}>{statCard(TrendingUp, "Receita no Período", formatCurrency(prodReport.financial.revenue), "text-violet-600", "bg-violet-600/10")}</motion.div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-base">Pacientes</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm"><span>Total</span><span className="font-medium">{prodReport.patients.total}</span></div>
                    <div className="flex justify-between text-sm"><span>Ativos</span><span className="font-medium text-blue-600">{prodReport.patients.active}</span></div>
                    <div className="flex justify-between text-sm"><span>Novos no período</span><span className="font-medium text-emerald-600">{prodReport.patients.newInPeriod}</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Atendimentos</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm"><span>Total de consultas</span><span className="font-medium">{prodReport.appointments.total}</span></div>
                    <div className="flex justify-between text-sm"><span>No período</span><span className="font-medium">{prodReport.appointments.inPeriod}</span></div>
                    <div className="flex justify-between text-sm"><span>Sessões realizadas</span><span className="font-medium">{prodReport.sessions.inPeriod}</span></div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle className="text-base">Financeiro</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm"><span>Receita</span><span className="font-medium text-emerald-600">{formatCurrency(prodReport.financial.revenue)}</span></div>
                    <div className="flex justify-between text-sm"><span>Despesas</span><span className="font-medium text-red-600">{formatCurrency(prodReport.financial.expenses)}</span></div>
                    <div className="flex justify-between text-sm pt-2 border-t"><span>Saldo</span><span className={cn("font-medium", prodReport.financial.balance >= 0 ? "text-emerald-600" : "text-red-600")}>{formatCurrency(prodReport.financial.balance)}</span></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Tarefas</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm"><span>Concluídas</span><span className="font-medium text-emerald-600">{prodReport.tasks.completed}</span></div>
                    <div className="flex justify-between text-sm"><span>Pendentes</span><span className="font-medium text-amber-600">{prodReport.tasks.pending}</span></div>
                    <Progress value={prodReport.tasks.total > 0 ? (prodReport.tasks.completed / prodReport.tasks.total) * 100 : 0} className="h-2" />
                    <p className="text-xs text-muted-foreground">{prodReport.tasks.completed}/{prodReport.tasks.total} concluídas</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
