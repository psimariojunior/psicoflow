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
import { Plus, Calendar, UserPlus, FileText, Video, Sparkles, ArrowRight, Download, BarChart3, TrendingUp, Users, DollarSign, Clock, Activity, CalendarDays, Sun, Moon, Cake, AlertTriangle, Zap } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { cn, formatTime } from "@/lib/utils"
import { motion } from "framer-motion"
import { QuickNotesFab } from "@/components/dashboard/quick-notes-fab"

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
    birthdays: { id: string; name: string; day: number; age: number; phone: string | null }[]
    streak: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [progressWidth, setProgressWidth] = useState(0)
  const [period, setPeriod] = useState<"6" | "12" | "all">("12")
  const [onboardingDone, setOnboardingDone] = useState(true)
  const [hasAvailability, setHasAvailability] = useState(true)

  useEffect(() => {
    const val = localStorage.getItem("psihumanis_onboarding_completed")
    setOnboardingDone(val === "true")
  }, [])

  useEffect(() => {
    fetch("/api/disponibilidade")
      .then((r) => r.json())
      .then((data) => {
        const slots = data.slots || data || []
        setHasAvailability(Array.isArray(slots) && slots.length > 0)
      })
      .catch(() => {})
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
  const birthdays = data?.birthdays ?? []
  const streak = data?.streak ?? 0

  const filteredMonthlyData = (data?.monthlyData ?? []).slice(period === "6" ? -6 : period === "12" ? -12 : 0)
  const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })
  const nextAppointment = appointments[0]
  const remainingGoal = Math.max(0, financialSummary.goal - financialSummary.received)
  const clinicPulse = Math.round(
    Math.min(100, Math.max(0,
      indicators.completionRate * 0.35 +
      (100 - indicators.cancellationRate) * 0.25 +
      Math.min(100, progressWidth) * 0.25 +
      Math.min(100, indicators.occupationRate) * 0.15
    ))
  )
  const executiveInsights = [
    {
      label: "Pulso da clínica",
      value: `${clinicPulse}%`,
      helper: clinicPulse >= 75 ? "Operação saudável" : clinicPulse >= 50 ? "Acompanhe os indicadores" : "Priorize agenda e recebimentos",
      icon: Activity,
      tone: "from-blue-500 to-indigo-600",
    },
    {
      label: "Sequência",
      value: `${streak} dia${streak !== 1 ? "s" : ""}`,
      helper: streak === 0 ? "Agende consultas hoje para iniciar" : "Dias seguidos com atendimento",
      icon: Zap,
      tone: "from-amber-500 to-orange-600",
    },
    {
      label: "Meta restante",
      value: currency.format(remainingGoal),
      helper: remainingGoal === 0 ? "Meta batida este mês" : "Para alcançar a meta mensal",
      icon: Sparkles,
      tone: "from-emerald-500 to-teal-600",
    },
    {
      label: "Fila financeira",
      value: currency.format(financialSummary.pending + financialSummary.overdue),
      helper: financialSummary.overdue > 0 ? "Inclui valores em atraso" : "Valores ainda pendentes",
      icon: DollarSign,
      tone: "from-amber-500 to-orange-600",
    },
  ]
  const smartAlerts = [
    financialSummary.overdue > 0 ? {
      title: "Cobranças em atraso",
      desc: `${currency.format(financialSummary.overdue)} precisam de acompanhamento financeiro.`,
      href: "/financeiro",
      tone: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300",
    } : null,
    todaysAppointments.length === 0 ? {
      title: "Agenda livre hoje",
      desc: "Bom momento para revisar prontuários, tarefas e lembretes.",
      href: "/prontuarios",
      tone: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-blue-300",
    } : null,
    indicators.cancellationRate >= 20 ? {
      title: "Cancelamentos acima do ideal",
      desc: `${Math.round(indicators.cancellationRate)}% de cancelamento. Reforce confirmações e lembretes.`,
      href: "/notificacoes",
      tone: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300",
    } : null,
    birthdays.length > 0 ? {
      title: "Relacionamento com pacientes",
      desc: `${birthdays.length} aniversariante${birthdays.length > 1 ? "s" : ""} neste mês.`,
      href: "/pacientes",
      tone: "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-900/60 dark:bg-pink-950/20 dark:text-pink-300",
    } : null,
  ].filter(Boolean) as Array<{ title: string; desc: string; href: string; tone: string }>

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
      <section className="relative overflow-hidden rounded-[2rem] border bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-5 text-white shadow-2xl shadow-blue-950/20 sm:p-7">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-blue-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Central executiva PsiHumanis
            </div>
            <div>
              <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Sua clínica em tempo real, com decisões claras para hoje.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                Acompanhe agenda, receita, ocupação e próximos movimentos em uma visão premium e objetiva.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" asChild className="bg-white text-slate-950 hover:bg-blue-50">
                <Link href="/agenda"><Calendar className="mr-1.5 h-4 w-4" />Abrir agenda</Link>
              </Button>
              <Button size="sm" variant="outline" asChild className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="/relatorios"><BarChart3 className="mr-1.5 h-4 w-4" />Ver relatórios</Link>
              </Button>
              <Button size="sm" variant="outline" asChild className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <Link href="/sala-virtual"><Video className="mr-1.5 h-4 w-4" />Sala virtual</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Próximo foco</p>
                <p className="mt-1 text-lg font-semibold">
                  {nextAppointment ? nextAppointment.patientName : "Agenda livre"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Clock className="h-5 w-5 text-blue-100" />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-blue-200">Hoje</p>
                <p className="text-2xl font-bold">{todaysAppointments.length}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3">
                <p className="text-blue-200">Recebido</p>
                <p className="text-xl font-bold">{currency.format(financialSummary.received)}</p>
              </div>
            </div>
            {nextAppointment && (
              <p className="mt-4 text-xs text-blue-100">
                Próxima consulta às {formatTime(nextAppointment.startTime)} com status {statusLabel(nextAppointment.status).toLowerCase()}.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Availability Guidance Banner */}
      {!hasAvailability && (
        <div className="rounded-2xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">Configure seus horários de atendimento</p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Você ainda não definiu horários disponíveis. Pacientes não poderão agendar consultas até que você configure sua agenda.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0">
              <Link href="/disponibilidade">
                <Clock className="mr-2 h-4 w-4" /> Configurar Agora
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Painel de performance</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Métricas reais da sua prática clínica</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
            {(["6", "12", "all"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-all", period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >{p === "6" ? "6 meses" : p === "12" ? "12 meses" : "Todos"}</button>
            ))}
          </div>
        </div>
      </div>

      {!onboardingDone && <OnboardingChecklist />}

      <div data-tour="dashboard-stats"><StatsCards stats={stats} /></div>

      <div className="grid gap-4 lg:grid-cols-3">
        {executiveInsights.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", item.tone)} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">{item.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
              </div>
              <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform group-hover:scale-110", item.tone)}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {smartAlerts.length > 0 && (
        <div className="rounded-2xl border bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-semibold">Alertas inteligentes</h3>
            <Badge variant="secondary" className="ml-auto text-[10px]">{smartAlerts.length}</Badge>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {smartAlerts.map((alert) => (
              <Link key={alert.title} href={alert.href} className={cn("rounded-xl border p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm", alert.tone)}>
                <p className="text-sm font-semibold">{alert.title}</p>
                <p className="mt-1 text-xs opacity-80">{alert.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

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

          {/* Aniversariantes do mês */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Cake className="h-4 w-4 text-pink-500" />
                Aniversariantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {birthdays.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Cake className="h-6 w-6 text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">Nenhum aniversário este mês</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {birthdays.slice(0, 6).map((b) => {
                    const isToday = b.day === new Date().getDate()
                    return (
                      <div key={b.id} className="flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-accent/50">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-sm font-bold text-pink-600 dark:text-pink-400">
                          {b.day}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{b.name}</p>
                          <p className="text-xs text-muted-foreground">Faz {b.age} anos</p>
                        </div>
                        {isToday && (
                          <Badge variant="success" className="text-[10px]">Hoje!</Badge>
                        )}
                      </div>
                    )
                  })}
                  {birthdays.length > 6 && (
                    <p className="pt-1 text-center text-[11px] text-muted-foreground">
                      +{birthdays.length - 6} aniversariantes
                    </p>
                  )}
                </div>
              )}
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

      <QuickNotesFab />
    </div>
  )
}
