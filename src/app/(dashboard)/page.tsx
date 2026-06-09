"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { RecentPatients } from "@/components/dashboard/recent-patients"
import { FinancialSummaryCard } from "@/components/dashboard/financial-summary"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, UserPlus, FileText, Video, Loader2 } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

const quickActions = [
  { label: "Nova Consulta", href: "/agenda", icon: Calendar, color: "bg-blue-500" },
  { label: "Novo Paciente", href: "/pacientes/novo", icon: UserPlus, color: "bg-emerald-500" },
  { label: "Nova Sessão", href: "/prontuarios/novo", icon: FileText, color: "bg-violet-500" },
  { label: "Sala Virtual", href: "/sala-virtual", icon: Video, color: "bg-rose-500" },
]

export default function DashboardPage() {
  const [data, setData] = useState<{
    stats: { totalPatients: number; appointmentsToday: number; monthlyRevenue: number; pendingPayments: number; appointmentChange: number; revenueChange: number }
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
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const stats = data?.stats ?? { totalPatients: 0, appointmentsToday: 0, monthlyRevenue: 0, pendingPayments: 0, appointmentChange: 0, revenueChange: 0 }
  const appointments = (data?.appointments ?? []).map((a) => ({ ...a, startTime: new Date(a.startTime) }))
  const patients = (data?.patients ?? []).map((p) => ({ ...p, createdAt: new Date(p.createdAt) }))
  const financialSummary = data?.financialSummary ?? { totalRevenue: 0, totalExpenses: 0, balance: 0, pending: 0, overdue: 0, received: 0, goal: 10000 }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral da sua prática clínica
          </p>
        </div>
        <Button asChild>
          <Link href="/agenda">
            <Plus className="mr-2 h-4 w-4" />
            Nova Consulta
          </Link>
        </Button>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-4">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="card-hover cursor-pointer">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-medium text-sm">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingAppointments appointments={appointments} />
        </div>
        <FinancialSummaryCard summary={financialSummary} />
      </div>

      <RecentPatients patients={patients} />
    </div>
  )
}
