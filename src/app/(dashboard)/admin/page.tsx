"use client"

import { useEffect, useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const AdminMRRChart = dynamic(() => import("@/components/admin/mrr-chart"), { ssr: false })
import {
  Users,
  Calendar,
  Shield,
  ArrowLeft,
  TrendingUp,
  UserCheck,
  DollarSign,
  Activity,
  ExternalLink,
  Clock,
  BarChart3,
  Zap,
  Settings,
  List,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface AdminUser {
  id: string
  name: string
  email: string
  plan: string
  subscriptionStatus: string
  planExpiresAt: string | null
  createdAt: string
  _count: {
    patients: number
    appointments: number
  }
}

const PLAN_PRICES: Record<string, number> = {
  clinica: 197,
  pro: 97,
  trial: 0,
  free: 0,
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/admin/users")
        .then(r => {
          if (!r.ok) {
            throw new Error("Acesso negado")
          }
          return r.json()
        })
        .then(data => {
          setUsers(data.users || [])
          setLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
        })
    }
  }, [status])

  const metrics = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const totalPsychologists = users.length
    const totalPatients = users.reduce((acc, u) => acc + u._count.patients, 0)

    const currentMRR = users
      .filter(u => u.subscriptionStatus === "active")
      .reduce((acc, u) => acc + (PLAN_PRICES[u.plan] || 0), 0)

    const trialUsers = users.filter(u => u.plan === "trial")
    const projectedMRR = currentMRR + trialUsers.length * 97

    const recentRegistrations = [...users]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    const thisMonth = users.filter(u => {
      const c = new Date(u.createdAt)
      const now = new Date()
      return c.getMonth() === now.getMonth() && c.getFullYear() === now.getFullYear()
    }).length
    const lastMonth = users.filter(u => {
      const c = new Date(u.createdAt)
      const now = new Date()
      const last = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return c.getMonth() === last.getMonth() && c.getFullYear() === last.getFullYear()
    }).length
    const growthRate = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : thisMonth > 0 ? 100 : 0

    const cancelledCount = users.filter(u => u.subscriptionStatus === "canceled" || u.plan === "free").length
    const churnRate = users.length > 0 ? Math.round((cancelledCount / users.length) * 100) : 0

    const totalPatientsAll = users.reduce((acc, u) => acc + u._count.patients, 0)
    const totalApptsAll = users.reduce((acc, u) => acc + u._count.appointments, 0)

    return {
      totalPsychologists,
      totalPatients: totalPatientsAll,
      currentMRR,
      projectedMRR,
      trialCount: trialUsers.length,
      activeCount: users.filter(u => u.subscriptionStatus === "active").length,
      freeCount: users.filter(u => u.plan === "free").length,
      cancelledCount,
      churnRate,
      growthRate,
      totalAppointments: totalApptsAll,
      thisMonthRegistrations: thisMonth,
      recentRegistrations,
    }
  }, [users])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground mb-4">Você não tem permissão para acessar esta página.</p>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const planColors: Record<string, string> = {
    free: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    trial: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    pro: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    clinica: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    canceled: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Painel Admin
          </h1>
          <p className="text-muted-foreground">Visão geral da plataforma e gestão de usuários</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total de Psicólogos</CardTitle>
            <Users className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{metrics.totalPsychologists}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.activeCount} ativos · {metrics.trialCount} em trial
            </p>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Receita Mensal</CardTitle>
            <DollarSign className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-700">
              R$ {metrics.currentMRR.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.activeCount} assinaturas ativas
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-gradient-to-br from-purple-50/50 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Pacientes Ativos</CardTitle>
            <UserCheck className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{metrics.totalPatients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalPsychologists > 0
                ? Math.round(metrics.totalPatients / metrics.totalPsychologists)
                : 0} por psicólogo
            </p>
          </CardContent>
        </Card>

        <Card className="border-amber-100 bg-gradient-to-br from-amber-50/50 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Consultas Hoje</CardTitle>
            <Calendar className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-700">
              {metrics.totalAppointments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total em todos os psicólogos
            </p>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-gradient-to-br from-rose-50/50 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-700">Churn</CardTitle>
            <Activity className="h-5 w-5 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-700">{metrics.churnRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.cancelledCount} {metrics.cancelledCount === 1 ? "cancelou" : "cancelaram"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-teal-100 bg-gradient-to-br from-teal-50/50 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Crescimento</CardTitle>
            <TrendingUp className="h-5 w-5 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-700">{metrics.growthRate > 0 ? "+" : ""}{metrics.growthRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.thisMonthRegistrations} novos este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">Receita Projetada</CardTitle>
            <BarChart3 className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-700">
              R$ {metrics.projectedMRR.toLocaleString("pt-BR")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.trialCount} em trial · {metrics.freeCount} free
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MRR Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            MRR por plano
          </CardTitle>
          <CardDescription>Valor mensal por plano de assinatura</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminMRRChart />
        </CardContent>
      </Card>

      {/* Revenue + Quick Actions row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue Chart Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Receita Mensal Recorrente
                </CardTitle>
                <CardDescription>Estimativa de MRR com base nas assinaturas ativas</CardDescription>
              </div>
              <Badge variant="info">
                <TrendingUp className="mr-1 h-3 w-3" />
                MRR
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current MRR */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">MRR Atual</span>
                <span className="text-xl font-bold text-blue-700">
                  R$ {metrics.currentMRR.toLocaleString("pt-BR")}
                </span>
              </div>
              <Progress
                value={Math.min((metrics.currentMRR / Math.max(metrics.projectedMRR, 1)) * 100, 100)}
                className="h-3"
                indicatorClassName="bg-blue-600"
              />
            </div>

            {/* Projected MRR */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  MRR Projetado (com trials convertidos)
                </span>
                <span className="text-xl font-bold text-emerald-600">
                  R$ {metrics.projectedMRR.toLocaleString("pt-BR")}
                </span>
              </div>
              <Progress
                value={100}
                className="h-3"
                indicatorClassName="bg-emerald-500"
              />
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t">
              {Object.entries(PLAN_PRICES).filter(([, price]) => price > 0).map(([plan, price]) => {
                const count = users.filter(u => u.plan === plan && u.subscriptionStatus === "active").length
                return (
                  <div key={plan} className="text-center">
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-muted-foreground capitalize">{plan} (R${price}/mês)</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/pacientes" className="block">
              <Button variant="outline" className="w-full justify-start h-12">
                <Users className="mr-3 h-4 w-4 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium">Ver Todos os Pacientes</p>
                  <p className="text-xs text-muted-foreground">Gerenciar pacientes do sistema</p>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <Link href="/agenda" className="block">
              <Button variant="outline" className="w-full justify-start h-12">
                <Calendar className="mr-3 h-4 w-4 text-emerald-500" />
                <div className="text-left">
                  <p className="font-medium">Ver Agenda</p>
                  <p className="text-xs text-muted-foreground">Consultar agendamentos</p>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            <Link href="/configuracoes" className="block">
              <Button variant="outline" className="w-full justify-start h-12">
                <Settings className="mr-3 h-4 w-4 text-purple-500" />
                <div className="text-left">
                  <p className="font-medium">Configurações</p>
                  <p className="text-xs text-muted-foreground">Ajustes da plataforma</p>
                </div>
                <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Registrations + Users Table row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Recent Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Últimos Registros
            </CardTitle>
            <CardDescription>5 cadastros mais recentes</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.recentRegistrations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum registro encontrado</p>
            ) : (
              <div className="space-y-3">
                {metrics.recentRegistrations.map((user) => {
                  const created = new Date(user.createdAt)
                  const now = new Date()
                  const diffMs = now.getTime() - created.getTime()
                  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

                  let timeAgo: string
                  if (diffDays === 0) timeAgo = "Hoje"
                  else if (diffDays === 1) timeAgo = "Ontem"
                  else if (diffDays < 7) timeAgo = `${diffDays} dias atrás`
                  else if (diffDays < 30) timeAgo = `${Math.floor(diffDays / 7)} sem atrás`
                  else timeAgo = created.toLocaleDateString("pt-BR")

                  return (
                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700 shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Badge className={planColors[user.plan] || ""}>
                        {user.plan}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{timeAgo}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="h-5 w-5 text-blue-600" />
              Todos os Usuários
            </CardTitle>
            <CardDescription>{users.length} psicólogos cadastrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Nome</th>
                    <th className="text-left py-3 px-2 font-medium">Email</th>
                    <th className="text-left py-3 px-2 font-medium">Plano</th>
                    <th className="text-left py-3 px-2 font-medium">Status</th>
                    <th className="text-left py-3 px-2 font-medium">Expira em</th>
                    <th className="text-left py-3 px-2 font-medium">Criado em</th>
                    <th className="text-right py-3 px-2 font-medium">Pacientes</th>
                    <th className="text-right py-3 px-2 font-medium">Consultas</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{user.name}</td>
                      <td className="py-3 px-2 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-2">
                        <Badge className={planColors[user.plan] || ""}>{user.plan}</Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={statusColors[user.subscriptionStatus] || ""}>
                          {user.subscriptionStatus}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {user.planExpiresAt
                          ? new Date(user.planExpiresAt).toLocaleDateString("pt-BR")
                          : "-"}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-2 text-right">{user._count.patients}</td>
                      <td className="py-3 px-2 text-right">{user._count.appointments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
