"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { RecentPatients } from "@/components/dashboard/recent-patients"
import { FinancialSummaryCard } from "@/components/dashboard/financial-summary"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { AppointmentsChart } from "@/components/dashboard/appointments-chart"
import { PaymentMethodsPie } from "@/components/dashboard/payment-methods-pie"
import { KeyIndicators } from "@/components/dashboard/key-indicators"
import { PatientGrowthChart } from "@/components/dashboard/patient-growth-chart"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { ExportModal } from "@/components/dashboard/export-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, UserPlus, FileText, Video, Sparkles, ArrowRight, Download, BarChart3, Activity } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

const quickActions = [
  { label: "Nova Consulta", href: "/agenda", icon: Calendar, gradient: "from-blue-500 to-indigo-600", desc: "Agende um novo horário" },
  { label: "Novo Paciente", href: "/pacientes/novo", icon: UserPlus, gradient: "from-emerald-500 to-teal-600", desc: "Cadastre um paciente" },
  { label: "Nova Sessão", href: "/sessoes", icon: FileText, gradient: "from-violet-500 to-purple-600", desc: "Registre um prontuário" },
  { label: "Sala Virtual", href: "/sala-virtual", icon: Video, gradient: "from-rose-500 to-pink-600", desc: "Inicie uma videochamada" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
}

export default function DashboardHome() {
  const [data, setData] = useState<{
    stats: { totalPatients: number; appointmentsToday: number; monthlyRevenue: number; pendingPayments: number; appointmentChange: number; revenueChange: number }
    monthlyData: { month: string; appointments: number; receita: number }[]
    appointments: { id: string; patientName: string; startTime: string; status: string; modality: string }[]
    patients: { id: string; name: string; email: string | null; phone: string | null; createdAt: string }[]
    financialSummary: { totalRevenue: number; totalExpenses: number; balance: number; pending: number; overdue: number; received: number; goal: number }
    indicators: { averageTicket: number; completionRate: number; cancellationRate: number; occupationRate: number }
    paymentsByMethod: { name: string; value: number }[]
    newPatientsByMonth: { month: string; count: number }[]
    appointmentsPerMonth: { month: string; count: number }[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [progressWidth, setProgressWidth] = useState(0)
  const [exportOpen, setExportOpen] = useState(false)

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

  useEffect(() => {
    if (!data?.financialSummary) return
    const pct = data.financialSummary.goal > 0
      ? Math.min(100, Math.round((data.financialSummary.received / data.financialSummary.goal) * 100))
      : 0
    const timer = setTimeout(() => setProgressWidth(pct), 200)
    return () => clearTimeout(timer)
  }, [data])

  if (loading) {
    return (
      <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
        <div className="h-8 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-card rounded-xl animate-pulse" />)}
        </div>
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-72 bg-card rounded-xl animate-pulse" />
              <div className="h-72 bg-card rounded-xl animate-pulse" />
            </div>
            <div className="h-64 bg-card rounded-xl animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-44 bg-card rounded-xl animate-pulse" />
            <div className="h-64 bg-card rounded-xl animate-pulse" />
          </div>
        </div>
      </motion.div>
    )
  }

  const stats = data?.stats ?? { totalPatients: 0, appointmentsToday: 0, monthlyRevenue: 0, pendingPayments: 0, appointmentChange: 0, revenueChange: 0 }
  const appointments = (data?.appointments ?? []).map((a) => ({ ...a, startTime: new Date(a.startTime) }))
  const patients = (data?.patients ?? []).map((p) => ({ ...p, createdAt: new Date(p.createdAt) }))
  const financialSummary = data?.financialSummary ?? { totalRevenue: 0, totalExpenses: 0, balance: 0, pending: 0, overdue: 0, received: 0, goal: 10000 }
  const indicators = data?.indicators ?? { averageTicket: 0, completionRate: 0, cancellationRate: 0, occupationRate: 0 }

  return (
    <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">Visão geral da sua prática clínica</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setExportOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button asChild size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25">
            <Link href="/agenda"><Plus className="mr-2 h-4 w-4" />Nova Consulta</Link>
          </Button>
        </div>
      </div>

      <motion.div variants={itemVariants}>
        <StatsCards stats={stats} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <KeyIndicators indicators={indicators} />
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="group cursor-pointer overflow-hidden border-0 bg-gradient-to-br from-card to-muted/50 card-hover">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br transition-all group-hover:scale-110 group-hover:rotate-3 duration-300 shadow-lg", action.gradient
                  )}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div variants={itemVariants}>
              <RevenueChart data={data?.monthlyData || []} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <AppointmentsChart data={data?.monthlyData || []} />
            </motion.div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div variants={itemVariants}>
              <PaymentMethodsPie data={data?.paymentsByMethod || []} />
            </motion.div>
            <motion.div variants={itemVariants}>
              <PatientGrowthChart data={data?.newPatientsByMonth || []} />
            </motion.div>
          </div>
          <motion.div variants={itemVariants}>
            <UpcomingAppointments appointments={appointments} />
          </motion.div>
        </div>
        <div className="space-y-4">
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-emerald-200" />
                  <span className="font-semibold">Meta do Mês</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-100">Progresso</span>
                    <span className="font-bold text-white">{progressWidth}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-1000 ease-out"
                      style={{ width: `${progressWidth}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-100">Recebido</span>
                    <span className="font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(financialSummary.received)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-100">Meta</span>
                    <span className="font-bold">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(financialSummary.goal)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <FinancialSummaryCard summary={financialSummary} />
          </motion.div>
          <motion.div variants={itemVariants}>
            <ActivityFeed activities={[]} />
          </motion.div>
        </div>
      </div>

      <motion.div variants={itemVariants}>
        <RecentPatients patients={patients} />
      </motion.div>

      <ExportModal open={exportOpen} onOpenChange={setExportOpen} />
    </motion.div>
  )
}
