"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { FinancialSummaryCard } from "@/components/dashboard/financial-summary"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { AppointmentsChart } from "@/components/dashboard/appointments-chart"
import { RecentPatients } from "@/components/dashboard/recent-patients"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { OnboardingChecklist } from "@/components/onboarding-checklist"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, UserPlus, FileText, Video, Sparkles, ArrowRight, Download, BarChart3, TrendingUp, Users, DollarSign, Clock, Activity, CalendarDays, Sun, Moon } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { cn, formatTime } from "@/lib/utils"
import { motion } from "framer-motion"

interface ActivityItem {
  id: string
  type: "appointment" | "patient" | "payment" | "session" | "system"
  description: string
  timestamp: string
  amount?: number
}

const quickActions = [
  { label: "Nova Consulta", href: "/agenda", icon: Calendar, gradient: "from-blue-500 to-indigo-600", desc: "Agende um novo horário" },
  { label: "Novo Paciente", href: "/pacientes/novo", icon: UserPlus, gradient: "from-blue-600 to-sky-600", desc: "Cadastre um paciente" },
  { label: "Novo Prontuário", href: "/prontuarios/novo", icon: FileText, gradient: "from-violet-500 to-purple-600", desc: "Registre um prontuário" },
  { label: "Sala Virtual", href: "/sala-virtual", icon: Video, gradient: "from-cyan-500 to-blue-700", desc: "Inicie uma videochamada" },
]

export default function DashboardHome() {
  const [data, setData] = useState<{
    stats: { totalPatients: number; appointmentsToday: number; monthlyRevenue: number; pendingPayments: number; appointmentChange: number; revenueChange: number }
    monthlyData: { month: string; appointments: number; receita: number }[]
    appointments: { id: string; patientName: string; startTime: string; status: string; modality: string }[]
    todaysAppointments: { id: string; patientName: string; startTime: string; status: string; modality: string }[]
    tomorrowsAppointments: { id: string; patientName: string; startTime: string; status: string; modality: string }[]
    patients: { id: string; name: string; email: string | null; phone: string | null; createdAt: string }[]
    recentActivity: ActivityItem[]
    financialSummary: { totalRevenue: number; totalExpenses: number; balance: number; pending: number; overdue: number; received: number; goal: number }
    indicators: { averageTicket: number; completionRate: number; cancellationRate: number; occupationRate: number }
    paymentsByMethod: { name: string; value: number }[]
    newPatientsByMonth: { month: string; count: number }[]
    appointmentsPerMonth: { month: string; count: number }[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [progressWidth, setProgressWidth] = useState(0)
  const [period, setPeriod] = useState<"6" | "12" | "all">("12")
  const [onboardingDone, setOnboardingDone] = useState(true)

  useEffect(() => {
    const val = localStorage.getItem("psicoflow_onboarding_completed")
    setOnboardingDone(val === "true")
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/dashboard", { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then(setData)
      .catch((err) => {
        if (err?.name === "AbortError") return
        toast.error("Erro ao carregar dados")
        setData(null)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!data?.financialSummary) return
    const pct = data.financialSummary.goal > 0
      ? Math.min(100, Math.round((data.financialSummary.received / data.financialSummary.goal) * 100)) : 0
    const timer = setTimeout(() => setProgressWidth(pct), 200)
    return () => clearTimeout(timer)
  }, [data])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-card rounded-xl animate-pulse" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-72 bg-card rounded-xl animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-44 bg-card rounded-xl animate-pulse" />
            <div className="h-64 bg-card rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const stats = data?.stats ?? { totalPatients: 0, appointmentsToday: 0, monthlyRevenue: 0, pendingPayments: 0, appointmentChange: 0, revenueChange: 0 }
  const appointments = (data?.appointments ?? []).map((a) => ({ ...a, startTime: new Date(a.startTime) }))
  const todaysAppointments = (data?.todaysAppointments ?? []).map((a) => ({ ...a, startTime: new Date(a.startTime) }))
  const tomorrowsAppointments = (data?.tomorrowsAppointments ?? []).map((a) => ({ ...a, startTime: new Date(a.startTime) }))
  const recentPatients = (data?.patients ?? []).map((p) => ({ ...p, createdAt: new Date(p.createdAt) }))
  const recentActivity = data?.recentActivity ?? []
  const financialSummary = data?.financialSummary ?? { totalRevenue: 0, totalExpenses: 0, balance: 0, pending: 0, overdue: 0, received: 0, goal: 10000 }
  const indicators = data?.indicators ?? { averageTicket: 0, completionRate: 0, cancellationRate: 0, occupationRate: 0 }

  const filteredMonthlyData = (data?.monthlyData ?? []).slice(period === "6" ? -6 : period === "12" ? -12 : 0)

  const statusVariant = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "info"
      case "CONFIRMED": return "success"
      case "IN_PROGRESS": return "warning"
      case "COMPLETED": return "success"
      case "CANCELLED": return "destructive"
      default: return "secondary"
    }
  }
  const statusLabel = (status: string) => {
    switch (status) {
      case "SCHEDULED": return "Agendado"
      case "CONFIRMED": return "Confirmado"
      case "IN_PROGRESS": return "Em andamento"
      case "COMPLETED": return "Concluído"
      case "CANCELLED": return "Cancelado"
      case "NO_SHOW": return "Faltou"
      default: return status
    }
  }

  const AppointmentList = ({ items, emptyIcon: EmptyIcon, emptyText }: { items: typeof todaysAppointments; emptyIcon: typeof Sun; emptyText: string }) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <EmptyIcon className="h-6 w-6 text-muted-foreground/40 mb-2" />
          <p className="text-xs text-muted-foreground">{emptyText}</p>
        </div>
      )
    }
    return (
      <div className="space-y-2">
        {items.slice(0, 6).map((apt) => (
          <div key={apt.id} className="flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-accent/50">
            <div className="flex flex-col items-center justify-center w-12 shrink-0">
              <span className="text-sm font-bold leading-none">{formatTime(apt.startTime)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{apt.patientName}</p>
              <p className="text-xs text-muted-foreground">{apt.modality === "online" ? "Online" : "Presencial"}</p>
            </div>
            <Badge variant={statusVariant(apt.status)} className="text-[10px]">{statusLabel(apt.status)}</Badge>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Visão geral da sua prática clínica</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {(["6", "12", "all"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >{p === "6" ? "6 meses" : p === "12" ? "12 meses" : "Todos"}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/relatorios"><BarChart3 className="mr-1.5 h-4 w-4" />Relatórios</Link>
          </Button>
        </div>
      </div>

      {!onboardingDone && <OnboardingChecklist />}

      <div data-tour="dashboard-stats"><StatsCards stats={stats} /></div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <div className="group relative overflow-hidden bg-card hover:bg-accent rounded-xl p-4 ring-1 ring-border transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5">
              <div className={cn("absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br", action.gradient)} />
              <div className="relative flex items-center gap-3">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-md transition-all group-hover:scale-110 group-hover:rotate-3 duration-300 shrink-0", action.gradient)}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">Visão Rápida</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Próximas Consultas: Hoje + Amanhã */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                Próximas Consultas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Hoje</span>
                  <Badge variant="secondary" className="text-[10px] ml-auto">{todaysAppointments.length}</Badge>
                </div>
                <AppointmentList items={todaysAppointments} emptyIcon={Sun} emptyText="Nenhuma consulta hoje" />
              </div>
              <div className="border-t pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amanhã</span>
                  <Badge variant="secondary" className="text-[10px] ml-auto">{tomorrowsAppointments.length}</Badge>
                </div>
                <AppointmentList items={tomorrowsAppointments} emptyIcon={Moon} emptyText="Nenhuma consulta amanhã" />
              </div>
            </CardContent>
          </Card>

          {/* Pacientes Recentes */}
          <RecentPatients patients={recentPatients} />

          {/* Atividade Recente */}
          <ActivityFeed activities={recentActivity} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Receita
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart data={filteredMonthlyData} />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  Agendamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AppointmentsChart data={filteredMonthlyData} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  Próximas Consultas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <UpcomingAppointments appointments={appointments} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-blue-200" />
                <span className="font-semibold text-sm">Meta do Mês</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-100">Progresso</span>
                  <span className="font-bold">{progressWidth}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full rounded-full bg-white transition-all duration-1000 ease-out" style={{ width: `${progressWidth}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-100">Recebido</span>
                  <span className="font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(financialSummary.received)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-100">Meta</span>
                  <span className="font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(financialSummary.goal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-500" />
                Indicadores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Ticket Médio", value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(indicators.averageTicket), icon: DollarSign },
                  { label: "Conclusão", value: `${Math.round(indicators.completionRate)}%`, icon: TrendingUp },
                  { label: "Cancelamento", value: `${Math.round(indicators.cancellationRate)}%`, icon: Activity },
                  { label: "Ocupação", value: `${Math.round(indicators.occupationRate)}%`, icon: Users },
                ].map((item) => (
                  <div key={item.label} className="bg-muted/50 rounded-xl p-3 text-center">
                    <item.icon className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-bold">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <FinancialSummaryCard summary={financialSummary} />
        </div>
      </div>
    </div>
  )
}
