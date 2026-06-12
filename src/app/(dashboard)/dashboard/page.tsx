"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { RecentPatients } from "@/components/dashboard/recent-patients"
import { FinancialSummaryCard } from "@/components/dashboard/financial-summary"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { AppointmentsChart } from "@/components/dashboard/appointments-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, UserPlus, FileText, Video, Sparkles, ArrowRight, TrendingUp } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

const quickActions = [
  { label: "Nova Consulta", href: "/agenda", icon: Calendar, color: "from-blue-500 to-indigo-600", desc: "Agende um novo horário" },
  { label: "Novo Paciente", href: "/pacientes/novo", icon: UserPlus, color: "from-emerald-500 to-teal-600", desc: "Cadastre um paciente" },
  { label: "Nova Sessão", href: "/prontuarios/novo", icon: FileText, color: "from-violet-500 to-purple-600", desc: "Registre um prontuário" },
  { label: "Sala Virtual", href: "/sala-virtual", icon: Video, color: "from-rose-500 to-pink-600", desc: "Inicie uma videochamada" },
]

export default function DashboardHome() {
  const [data, setData] = useState<{
    stats: { totalPatients: number; appointmentsToday: number; monthlyRevenue: number; pendingPayments: number; appointmentChange: number; revenueChange: number }
    monthlyData: { month: string; appointments: number; receita: number }[]
    appointments: { id: string; patientName: string; startTime: string; status: string; modality: string }[]
    patients: { id: string; name: string; email: string | null; phone: string | null; createdAt: string }[]
    financialSummary: { totalRevenue: number; totalExpenses: number; balance: number; pending: number; overdue: number; received: number; goal: number }
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/dashboard", { signal: controller.signal })
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then(setData)
      .catch((err) => {
        if (err?.name === "AbortError") return
        toast.error("Erro ao carregar dados do dashboard")
        setData(null)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-72 bg-card rounded-xl animate-pulse" />
              <div className="h-72 bg-card rounded-xl animate-pulse" />
            </div>
            <div className="h-64 bg-card rounded-xl animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-44 bg-card rounded-xl animate-pulse" />
            <div className="h-44 bg-card rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="h-48 bg-card rounded-xl animate-pulse" />
      </div>
    )
  }

  const stats = data?.stats ?? { totalPatients: 0, appointmentsToday: 0, monthlyRevenue: 0, pendingPayments: 0, appointmentChange: 0, revenueChange: 0 }
  const appointments = (data?.appointments ?? []).map((a) => ({ ...a, startTime: new Date(a.startTime) }))
  const patients = (data?.patients ?? []).map((p) => ({ ...p, createdAt: new Date(p.createdAt) }))
  const financialSummary = data?.financialSummary ?? { totalRevenue: 0, totalExpenses: 0, balance: 0, pending: 0, overdue: 0, received: 0, goal: 10000 }

  const progressToGoal = financialSummary.goal > 0
    ? Math.min(100, Math.round((financialSummary.received / financialSummary.goal) * 100))
    : 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Visão geral da sua prática clínica</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/agenda"><Calendar className="mr-2 h-4 w-4" />Ver Agenda</Link>
          </Button>
          <Button asChild size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
            <Link href="/agenda"><Plus className="mr-2 h-4 w-4" />Nova Consulta</Link>
          </Button>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="group card-hover cursor-pointer overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br transition-transform group-hover:scale-110 duration-300 shadow-lg", action.color
                  )}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <RevenueChart data={data?.monthlyData || []} />
            <AppointmentsChart data={data?.monthlyData || []} />
          </div>
          <UpcomingAppointments appointments={appointments} />
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Meta do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{progressToGoal}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000 ease-out" style={{ width: `${progressToGoal}%` }} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Recebido</span>
                  <span className="font-medium text-emerald-500">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(financialSummary.received)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Meta</span>
                  <span className="font-medium">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(financialSummary.goal)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <FinancialSummaryCard summary={financialSummary} />
        </div>
      </div>

      <RecentPatients patients={patients} />
    </div>
  )
}
