"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  UserCheck,
  RefreshCw,
  AlertCircle,
  Lock,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

interface Arrival {
  id: string
  patientName: string | null
  patientId: string | null
  psychologistId: string
  receptionistId: string
  status: string
  arrivedAt: string
  notifiedAt: string | null
  notes: string | null
}

interface TodayAppointment {
  id: string
  patient: { id: string; name: string }
  psychologist: { id: string; name: string }
  startTime: string
  endTime: string
  status: string
}

interface Psicologo {
  id: string
  name: string
}

export default function RecepcaoPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [arrivals, setArrivals] = useState<Arrival[]>([])
  const [todayAppts, setTodayAppts] = useState<TodayAppointment[]>([])
  const [psychologists, setPsychologists] = useState<Psicologo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPsych, setSelectedPsych] = useState<string>("all")
  const [planError, setPlanError] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (session?.user?.role !== "RECEPTIONIST" && session?.user?.role !== "ADMIN" && session?.user?.role !== "CLINIC_ADMIN") {
      router.push("/dashboard")
    }
  }, [session, status, router])

  const fetchData = useCallback(async () => {
    if (!session?.user) return
    if (session.user.role !== "RECEPTIONIST" && session.user.role !== "ADMIN" && session.user.role !== "CLINIC_ADMIN") return
    setLoading(true)
    try {
      const [arrivalsRes, dashboardRes] = await Promise.all([
        fetch("/api/recepcao/chegadas"),
        fetch("/api/clinica/dashboard"),
      ])
      if (arrivalsRes.status === 403) {
        const data = await arrivalsRes.json()
        if (data.upgradeRequired) {
          setPlanError(data.error)
          return
        }
      }
      if (arrivalsRes.ok) {
        const data = await arrivalsRes.json()
        setArrivals(data.arrivals || [])
      }
      if (dashboardRes.ok) {
        const data = await dashboardRes.json()
        setTodayAppts(data.todayAppointments || [])
        const psychs = (data.todayAppointments || [])
          .map((a: TodayAppointment) => a.psychologist)
          .filter((p: Psicologo, i: number, arr: Psicologo[]) => arr.findIndex(x => x.id === p.id) === i)
        setPsychologists(psychs)
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleNotify = async (arrivalId: string) => {
    await fetch(`/api/recepcao/chegadas/${arrivalId}/notificar`, { method: "PUT" })
    fetchData()
  }

  const handleMarkSessionStarted = async (arrivalId: string) => {
    await fetch(`/api/recepcao/chegadas/${arrivalId}/notificar`, { method: "PUT" })
    fetchData()
  }

  const handleDelete = async (arrivalId: string) => {
    if (!confirm("Remover este registro de chegada?")) return
    await fetch(`/api/recepcao/chegadas/${arrivalId}`, { method: "DELETE" })
    fetchData()
  }

  const filteredAppts = selectedPsych === "all"
    ? todayAppts
    : todayAppts.filter(a => a.psychologist.id === selectedPsych)

  const filteredArrivals = selectedPsych === "all"
    ? arrivals
    : arrivals.filter(a => a.psychologistId === selectedPsych)

  const statusIcon = (s: string) => {
    switch (s) {
      case "ARRIVED": return <Clock className="h-4 w-4 text-amber-500" />
      case "NOTIFIED": return <BellRing className="h-4 w-4 text-teal-500" />
      case "IN_SESSION": return <UserCheck className="h-4 w-4 text-green-500" />
      case "COMPLETED": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const statusLabel = (s: string) => {
    switch (s) {
      case "ARRIVED": return "Chegou"
      case "NOTIFIED": return "Notificado"
      case "IN_SESSION": return "Em sessão"
      case "COMPLETED": return "Concluído"
      default: return s
    }
  }

  const statusColor = (s: string) => {
    switch (s) {
      case "ARRIVED": return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
      case "NOTIFIED": return "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
      case "IN_SESSION": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "COMPLETED": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
      default: return "bg-gray-100 text-gray-800"
    }
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recepção</h1>
          <p className="text-muted-foreground">Gerencie as chegadas dos pacientes</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedPsych === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedPsych("all")}
        >
          Todos
        </Button>
        {psychologists.map(p => (
          <Button
            key={p.id}
            variant={selectedPsych === p.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPsych(p.id)}
          >
            {p.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
                <p className="text-2xl font-bold">{filteredAppts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pacientes Chegaram</p>
                <p className="text-2xl font-bold">{filteredArrivals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BellRing className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Notificados</p>
                <p className="text-2xl font-bold">{filteredArrivals.filter(a => a.status === "NOTIFIED" || a.status === "IN_SESSION").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agenda do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhum agendamento para hoje</p>
          ) : (
            <div className="space-y-2">
              {filteredAppts.map(appt => {
                const arrival = arrivals.find(a => a.patientId === appt.patient.id)
                return (
                  <div key={appt.id} className="flex items-center justify-between p-3 rounded-lg border dark:border-slate-800 hover:bg-muted/50 transition-colors">
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
                    <div className="flex items-center gap-2">
                      {arrival ? (
                        <Badge className={`${statusColor(arrival.status)} border-0`}>
                          {statusIcon(arrival.status)}
                          <span className="ml-1">{statusLabel(arrival.status)}</span>
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            fetch("/api/recepcao/chegadas", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                patientId: appt.patient.id,
                                psychologistId: appt.psychologist.id,
                                patientName: appt.patient.name,
                              }),
                            }).then(() => fetchData())
                          }}
                          className="text-xs"
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          Paciente Chegou
                        </Button>
                      )}
                      {arrival && arrival.status === "ARRIVED" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleNotify(arrival.id)}
                          className="text-xs bg-teal-600 hover:bg-teal-700"
                        >
                          <Bell className="h-3 w-3 mr-1" />
                          Notificar
                        </Button>
                      )}
                      {arrival && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(arrival.id)}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          Remover
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Chegadas Registradas Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredArrivals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma chegada registrada hoje</p>
          ) : (
            <div className="space-y-2">
              {filteredArrivals.map(arrival => (
                <div key={arrival.id} className="flex items-center justify-between p-3 rounded-lg border dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    {statusIcon(arrival.status)}
                    <div>
                      <p className="font-medium">{arrival.patientName || "Paciente"}</p>
                      <p className="text-sm text-muted-foreground">
                        Chegou às {new Date(arrival.arrivedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        {arrival.notifiedAt && ` · Notificado às ${new Date(arrival.notifiedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${statusColor(arrival.status)} border-0`}>
                    {statusLabel(arrival.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
