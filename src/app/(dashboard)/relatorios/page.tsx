"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Download } from "lucide-react"
import toast from "react-hot-toast"

interface MonthlySession {
  month: string
  sessoes: number
  receita: number
}

interface TopPatient {
  name: string
  sessions: number
  revenue: number
}

export default function ReportsPage() {
  const [period, setPeriod] = useState("monthly")
  const [summary, setSummary] = useState({ totalPatients: 0, monthlyAppointments: 0, monthlyRevenue: 0 })
  const [monthlyData, setMonthlyData] = useState<MonthlySession[]>([])
  const [topPatients, setTopPatients] = useState<TopPatient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/relatorios")
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then((data) => {
        if (data.summary) setSummary(data.summary)
        if (data.monthlySessions) setMonthlyData(data.monthlySessions)
        if (data.topPatients) setTopPatients(data.topPatients)
      })
      .catch(() => toast.error("Erro ao carregar relatórios"))
      .finally(() => setLoading(false))
  }, [])

  const maxSessions = monthlyData.length > 0 ? Math.max(...monthlyData.map(d => d.sessoes)) : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 animate-shimmer rounded-lg" />
            <div className="h-4 w-72 animate-shimmer rounded-lg" />
          </div>
          <div className="h-9 w-28 animate-shimmer rounded-lg" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-3">
              <div className="h-4 w-24 animate-shimmer rounded" />
              <div className="h-8 w-16 animate-shimmer rounded" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border p-6 space-y-4">
          <div className="h-5 w-36 animate-shimmer rounded" />
          <div className="flex items-end gap-3 h-48">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="flex-1 animate-shimmer rounded-t" style={{ height: `${20 + Math.random() * 60}%` }} />
            ))}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-6 space-y-3">
            <div className="h-5 w-28 animate-shimmer rounded" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-32 animate-shimmer rounded" />
                <div className="h-4 w-16 animate-shimmer rounded ml-auto" />
              </div>
            ))}
          </div>
          <div className="rounded-xl border p-6 space-y-3">
            <div className="h-5 w-36 animate-shimmer rounded" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-32 animate-shimmer rounded" />
                <div className="h-4 w-16 animate-shimmer rounded ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground">
            Análise detalhada da sua prática clínica
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart3 className="mr-2 h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="patients">
            <Users className="mr-2 h-4 w-4" />
            Pacientes
          </TabsTrigger>
          <TabsTrigger value="financial">
            <DollarSign className="mr-2 h-4 w-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Calendar className="mr-2 h-4 w-4" />
            Atendimentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {(() => {
              const items = [
                { label: "Total de Pacientes", value: String(summary.totalPatients), change: "", icon: Users, bg: "bg-blue-600/10", color: "text-blue-600" },
                { label: "Sessões no Mês", value: String(summary.monthlyAppointments), change: "", icon: Calendar, bg: "bg-emerald-600/10", color: "text-emerald-600" },
                { label: "Receita Mensal", value: new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(summary.monthlyRevenue), change: "", icon: TrendingUp, bg: "bg-primary/10", color: "text-primary" },
              ]
              return items.map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.bg}`}>
                        <item.icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-xl font-bold">{item.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            })()}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sessões por Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {monthlyData.map((data) => (
                  <div key={data.month} className="flex items-center gap-4">
                    <span className="w-10 text-sm font-medium">{data.month}</span>
                    <div className="flex-1">
                      <Progress value={(data.sessoes / maxSessions) * 100} className="h-6" />
                    </div>
                    <span className="w-16 text-sm text-right">{data.sessoes} sess</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top 5 Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPatients.map((patient, index) => (
                    <div key={patient.name} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">{patient.sessions} sessões</p>
                      </div>
                      <span className="text-sm font-medium">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(patient.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Receita por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyData.map((data) => {
                    const maxRevenue = Math.max(...monthlyData.map(d => d.receita))
                    return (
                      <div key={data.month} className="flex items-center gap-4">
                        <span className="w-10 text-sm font-medium">{data.month}</span>
                        <div className="flex-1">
                          <Progress
                            value={(data.receita / maxRevenue) * 100}
                            className="h-6"
                            indicatorClassName="bg-emerald-500"
                          />
                        </div>
                        <span className="w-20 text-sm text-right">
                          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(data.receita)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patients" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Users className="mx-auto h-8 w-8 mb-2" />
              <p>Gráficos detalhados de pacientes em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <DollarSign className="mx-auto h-8 w-8 mb-2" />
              <p>Relatórios financeiros detalhados em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Calendar className="mx-auto h-8 w-8 mb-2" />
              <p>Relatórios de atendimento em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
