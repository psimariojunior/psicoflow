"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Users,
  UserPlus,
  Building2,
  RefreshCw,
  Trash2,
  Shield,
  Stethoscope,
  BellRing,
  Calendar,
  AlertCircle,
  Lock,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

interface Clinic {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  members: Member[]
  _count: { arrivals: number; members: number }
}

interface Member {
  id: string
  role: string
  user: { id: string; name: string; email: string; role: string; crp: string | null; specialty: string | null }
  joinedAt: string
}

interface DashboardData {
  members: number
  psychologists: number
  receptionists: number
  todayAppointments: Array<{
    id: string
    patient: { name: string }
    psychologist: { name: string }
    startTime: string
    status: string
  }>
  todayArrivals: Array<{ id: string; status: string }>
  totalPatients: number
  totalAppointmentsToday: number
}

export default function ClinicaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberName, setNewMemberName] = useState("")
  const [newMemberRole, setNewMemberRole] = useState<"RECEPTIONIST" | "PSYCHOLOGIST">("RECEPTIONIST")
  const [newMemberPassword, setNewMemberPassword] = useState("")
  const [newMemberCrp, setNewMemberCrp] = useState("")
  const [adding, setAdding] = useState(false)
  const [newClinicName, setNewClinicName] = useState("")
  const [creating, setCreating] = useState(false)
  const [planError, setPlanError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [clinicRes, dashRes] = await Promise.all([
        fetch("/api/clinica"),
        fetch("/api/clinica/dashboard"),
      ])
      if (clinicRes.status === 403) {
        const data = await clinicRes.json()
        if (data.upgradeRequired) {
          setPlanError(data.error)
          return
        }
      }
      if (clinicRes.ok) {
        const data = await clinicRes.json()
        setClinic(data.clinic)
      }
      if (dashRes.ok) {
        const data = await dashRes.json()
        setDashboard(data)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreateClinic = async () => {
    if (!newClinicName.trim()) return
    setCreating(true)
    try {
      await fetch("/api/clinica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newClinicName }),
      })
      fetchData()
    } finally {
      setCreating(false)
    }
  }

  const handleAddMember = async () => {
    if (!newMemberEmail.trim() || !newMemberName.trim()) return
    setAdding(true)
    try {
      const res = await fetch("/api/clinica/membros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newMemberEmail,
          name: newMemberName,
          role: newMemberRole,
          crp: newMemberCrp || undefined,
          password: newMemberPassword || undefined,
        }),
      })
      if (res.ok) {
        setNewMemberEmail("")
        setNewMemberName("")
        setNewMemberPassword("")
        setNewMemberCrp("")
        setShowAddMember(false)
        fetchData()
      }
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remover este membro da clínica?")) return
    await fetch(`/api/clinica/membros/${memberId}`, { method: "DELETE" })
    fetchData()
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  if (planError) {
    return (
      <div className="flex items-center justify-center h-96 p-6">
        <Card className="max-w-md dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-8 text-center space-y-4">
            <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-full w-fit mx-auto">
              <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold">Plano Clínica Necessário</h2>
            <p className="text-muted-foreground">{planError}</p>
            <Link href="/pricing">
              <Button className="mt-4">
                Ver Planos <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!clinic) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Criar Clínica</h1>
          <p className="text-muted-foreground">Crie uma clínica para gerenciar múltiplos profissionais</p>
        </div>
        <Card className="max-w-lg dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Clínica</label>
              <Input
                placeholder="Ex: Clínica PsiHumanis"
                value={newClinicName}
                onChange={e => setNewClinicName(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={handleCreateClinic} disabled={creating || !newClinicName.trim()}>
              {creating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Building2 className="h-4 w-4 mr-2" />}
              Criar Clínica
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{clinic.name}</h1>
          <p className="text-muted-foreground">Painel de gestão da clínica</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Membros</p>
                <p className="text-2xl font-bold">{dashboard?.members || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Stethoscope className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Psicólogos</p>
                <p className="text-2xl font-bold">{dashboard?.psychologists || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <BellRing className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recepcionistas</p>
                <p className="text-2xl font-bold">{dashboard?.receptionists || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Consultas Hoje</p>
                <p className="text-2xl font-bold">{dashboard?.totalAppointmentsToday || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membros da Clínica
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddMember(!showAddMember)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddMember && (
            <div className="mb-4 p-4 border rounded-lg dark:border-slate-700 space-y-3 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input placeholder="Nome *" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} />
                <Input placeholder="Email *" value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} type="email" />
                <Input placeholder="Senha (para novos usuários)" value={newMemberPassword} onChange={e => setNewMemberPassword(e.target.value)} type="password" />
                <Input placeholder="CRP (opcional)" value={newMemberCrp} onChange={e => setNewMemberCrp(e.target.value)} />
                <select
                  value={newMemberRole}
                  onChange={e => setNewMemberRole(e.target.value as "RECEPTIONIST" | "PSYCHOLOGIST")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="RECEPTIONIST">Recepcionista</option>
                  <option value="PSYCHOLOGIST">Psicólogo(a)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMember} disabled={adding} size="sm">
                  {adding ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Adicionar
                </Button>
                <Button onClick={() => setShowAddMember(false)} variant="outline" size="sm">Cancelar</Button>
              </div>
            </div>
          )}

          {clinic.members.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum membro cadastrado</p>
          ) : (
            <div className="space-y-2">
              {clinic.members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      {member.user.role === "PSYCHOLOGIST" || member.user.role === "ADMIN" ? (
                        <Stethoscope className="h-4 w-4 text-green-600" />
                      ) : (
                        <BellRing className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.user.email}
                        {member.user.crp && ` · CRP ${member.user.crp}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.user.role === "PSYCHOLOGIST" || member.user.role === "ADMIN" ? "default" : "secondary"}>
                      {member.user.role === "PSYCHOLOGIST" || member.user.role === "ADMIN" ? "Psicólogo(a)" :
                       member.user.role === "RECEPTIONIST" ? "Recepcionista" : "Admin Clínica"}
                    </Badge>
                    {member.user.id !== session?.user?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agenda de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(!dashboard?.todayAppointments || dashboard.todayAppointments.length === 0) ? (
            <p className="text-muted-foreground text-center py-8">Nenhum agendamento para hoje</p>
          ) : (
            <div className="space-y-2">
              {dashboard.todayAppointments.map(appt => (
                <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg border dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[60px]">
                      <p className="text-sm font-mono font-medium">
                        {new Date(appt.startTime).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">{appt.patient.name}</p>
                      <p className="text-sm text-muted-foreground">Dr(a). {appt.psychologist.name}</p>
                    </div>
                  </div>
                  <Badge variant={appt.status === "CONFIRMED" ? "default" : appt.status === "COMPLETED" ? "secondary" : "outline"}>
                    {appt.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Informações da Clínica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Nome</p>
              <p className="font-medium">{clinic.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Slug</p>
              <p className="font-medium">{clinic.slug}</p>
            </div>
            {clinic.phone && (
              <div>
                <p className="text-muted-foreground">Telefone</p>
                <p className="font-medium">{clinic.phone}</p>
              </div>
            )}
            {clinic.address && (
              <div>
                <p className="text-muted-foreground">Endereço</p>
                <p className="font-medium">{clinic.address}</p>
              </div>
            )}
            {clinic.city && clinic.state && (
              <div>
                <p className="text-muted-foreground">Cidade/Estado</p>
                <p className="font-medium">{clinic.city}/{clinic.state}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Total de Pacientes</p>
              <p className="font-medium">{dashboard?.totalPatients || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
