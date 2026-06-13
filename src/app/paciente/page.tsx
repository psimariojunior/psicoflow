"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { CalendarDays, BookHeart, History, User, ChevronRight, Clock, MapPin } from "lucide-react"

interface Appointment {
  id: string
  startTime: string
  status: string
  modalidade: string | null
  psychologist: { name: string }
}

export default function PacienteDashboard() {
  const { patient, token } = usePatientAuth()
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null)
  const [loadingAppt, setLoadingAppt] = useState(true)

  useEffect(() => {
    if (!token) return
    fetch("/api/pacientes/agendamentos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: Appointment[]) => {
        const upcoming = data
          .filter((a) => a.status !== "CANCELLED" && new Date(a.startTime) > new Date())
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        setNextAppointment(upcoming[0] || null)
      })
      .catch(() => {})
      .finally(() => setLoadingAppt(false))
  }, [token])

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Olá, {patient?.name?.split(" ")[0]}</h1>
        <p className="text-muted-foreground text-sm mt-1">Bem-vindo ao PsicoFlow</p>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Próxima consulta</h2>
        {loadingAppt ? (
          <div className="bg-card rounded-2xl p-6 ring-1 ring-border animate-pulse h-28" />
        ) : nextAppointment ? (
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 ring-1 ring-primary/20">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <CalendarDays className="h-4 w-4" />
                  <span className="font-medium">{formatDate(nextAppointment.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(nextAppointment.startTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <User className="h-4 w-4" />
                  <span>{nextAppointment.psychologist.name}</span>
                </div>
              </div>
              <Link
                href="/paciente/agenda"
                className="text-primary hover:text-primary/80 transition-colors"
                aria-label="Ver agenda completa"
              >
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-2xl p-6 ring-1 ring-border text-center">
            <p className="text-muted-foreground text-sm">Nenhuma consulta agendada</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Entre em contato com seu psicólogo</p>
          </div>
        )}
      </div>

      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Acesso rápido</h2>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/paciente/agenda" className="bg-card hover:bg-accent rounded-2xl p-5 ring-1 ring-border transition-all group">
          <CalendarDays className="h-6 w-6 text-primary mb-3" />
          <h3 className="text-foreground font-medium text-sm">Agenda</h3>
          <p className="text-muted-foreground text-xs mt-1">Ver consultas</p>
        </Link>
        <Link href="/paciente/diario" className="bg-card hover:bg-accent rounded-2xl p-5 ring-1 ring-border transition-all group">
          <BookHeart className="h-6 w-6 text-primary mb-3" />
          <h3 className="text-foreground font-medium text-sm">Diário</h3>
          <p className="text-muted-foreground text-xs mt-1">Registre emoções</p>
        </Link>
        <Link href="/paciente/historico" className="bg-card hover:bg-accent rounded-2xl p-5 ring-1 ring-border transition-all group">
          <History className="h-6 w-6 text-primary mb-3" />
          <h3 className="text-foreground font-medium text-sm">Histórico</h3>
          <p className="text-muted-foreground text-xs mt-1">Consultas anteriores</p>
        </Link>
        <Link href="/paciente/meus-dados" className="bg-card hover:bg-accent rounded-2xl p-5 ring-1 ring-border transition-all group">
          <User className="h-6 w-6 text-primary mb-3" />
          <h3 className="text-foreground font-medium text-sm">Meus Dados</h3>
          <p className="text-muted-foreground text-xs mt-1">Editar perfil</p>
        </Link>
      </div>
    </div>
  )
}
