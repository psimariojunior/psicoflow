"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
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
    free: "bg-gray-100 text-gray-800",
    trial: "bg-yellow-100 text-yellow-800",
    pro: "bg-blue-100 text-blue-800",
    clinica: "bg-purple-100 text-purple-800",
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    expired: "bg-red-100 text-red-800",
    canceled: "bg-gray-100 text-gray-800",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin - Todos os Usuários</h1>
          <p className="text-muted-foreground">Visão geral de todos os usuários do sistema</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((acc, u) => acc + u._count.patients, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.reduce((acc, u) => acc + u._count.appointments, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
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
  )
}
