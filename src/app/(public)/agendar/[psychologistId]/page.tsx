"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { Loader2, Calendar, Clock, User, Phone, Mail, CheckCircle, ArrowLeft, ChevronLeft, ChevronRight, Shield, Zap, Moon, Sun } from "lucide-react"
import toast from "react-hot-toast"
import { useTheme } from "next-themes"

interface TimeSlot {
  time: string
  startTime: string
  endTime: string
}

interface AvailableDay {
  date: string
  dayOfWeek: number
  slots: TimeSlot[]
}

interface PsychologistInfo {
  id: string
  name: string
  specialty: string | null
  bio: string | null
  avatarUrl: string | null
  publicName: string | null
  publicBio: string | null
  sessionPrice: number | null
  welcomeMessage: string | null
  clinicAddress: string | null
}

const DAY_NAMES_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

type Step = "date" | "time" | "info" | "confirm"

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split("-")
  return `${d}/${m}/${y}`
}

function getDayName(dayOfWeek: number): string {
  return ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"][dayOfWeek]
}

function BookingPage() {
  const params = useParams()
  const psychologistId = params.psychologistId as string
  const { theme, setTheme } = useTheme()

  const [step, setStep] = useState<Step>("date")
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())
  const [psychologist, setPsychologist] = useState<PsychologistInfo | null>(null)

  useEffect(() => {
    if (!psychologistId) return
    setLoading(true)

    Promise.all([
      fetch(`/api/disponibilidade/public?psychologistId=${psychologistId}`).then((r) => r.json()),
      fetch("/api/disponibilidade/public/psicologos").then((r) => r.json()),
    ])
      .then(([availData, psyList]) => {
        setAvailableDays(availData.availableDays || [])
        const psy = Array.isArray(psyList) ? psyList.find((p: PsychologistInfo) => p.id === psychologistId) : null
        if (psy) setPsychologist(psy)
      })
      .catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setLoading(false))
  }, [psychologistId])

  const availableDates = new Set(availableDays.map((d) => d.date))
  const selectedDay = availableDays.find((d) => d.date === selectedDate)

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr)
    setSelectedSlot(null)
    setStep("time")
  }

  const handleSelectSlot = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setStep("info")
  }

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      toast.error("Informe seu nome")
      return
    }
    if (!selectedSlot) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/agendamentos/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          startTime: selectedSlot.startTime,
          psychologistId,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Erro ao agendar")
      }

      setStep("confirm")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao agendar")
    } finally {
      setSubmitting(false)
    }
  }, [name, email, phone, selectedSlot, psychologistId])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 items-center justify-center transition-colors">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-white/60">Carregando horários disponíveis...</p>
        </div>
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Consulta agendada!</h1>
            <p className="text-slate-500 dark:text-white/60 mb-2">
              {selectedDate && formatDateBR(selectedDate)} às {selectedSlot?.time}
            </p>
            {psychologist && (
              <p className="text-blue-600 dark:text-blue-400 text-sm mb-8">com {psychologist.publicName || psychologist.name}</p>
            )}
            <div className="bg-white dark:bg-white/5 backdrop-blur rounded-2xl p-6 mb-6 text-left ring-1 ring-slate-200 dark:ring-white/10">
              <p className="text-slate-700 dark:text-white/80 text-sm mb-1">
                <User className="h-4 w-4 inline mr-2 text-blue-500 dark:text-blue-400" />
                {name}
              </p>
              {email && (
                <p className="text-slate-500 dark:text-white/60 text-sm mb-1">
                  <Mail className="h-4 w-4 inline mr-2 text-blue-500 dark:text-blue-400" />
                  {email}
                </p>
              )}
              {phone && (
                <p className="text-slate-500 dark:text-white/60 text-sm">
                  <Phone className="h-4 w-4 inline mr-2 text-blue-500 dark:text-blue-400" />
                  {phone}
                </p>
              )}
            </div>
            <p className="text-slate-400 dark:text-white/40 text-sm">
              Você receberá um lembrete por email/WhatsApp próximo ao horário da consulta.
            </p>
            <div className="mt-6 space-y-3">
              <Link href="/paciente/cadastro" className="block w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all text-center shadow-lg shadow-blue-500/25">
                Criar conta para gerenciar consultas
              </Link>
              <Link href="/agendar" className="block w-full py-3 px-4 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all text-center text-sm">
                Voltar à seleção de profissionais
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <Link href="/agendar" className="flex items-center gap-2 text-slate-500 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar à seleção
          </Link>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl bg-white dark:bg-white/10 ring-1 ring-slate-200 dark:ring-white/10 text-slate-500 dark:text-white/60 hover:text-slate-700 dark:hover:text-white transition-all"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
        <div className="mb-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.06] p-6 text-slate-900 dark:text-white shadow-xl shadow-slate-200/50 dark:shadow-2xl dark:shadow-black/20 backdrop-blur-xl">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
            <div className="relative">
              <div className="mb-5 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold shadow-lg shadow-blue-500/20 text-white">
                  {psychologist?.avatarUrl ? <Image src={psychologist.avatarUrl} alt={psychologist.publicName || psychologist.name} width={64} height={64} className="h-full w-full object-cover" /> : (psychologist?.publicName || psychologist?.name || "P").slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-200">Perfil profissional</p>
                  <h1 className="text-2xl font-bold">{psychologist?.publicName || psychologist?.name || "Agendamento"}</h1>
                  {psychologist?.specialty && <p className="text-sm text-slate-500 dark:text-blue-100/80">{psychologist.specialty}</p>}
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-600 dark:text-white/70">
                {psychologist?.publicBio || psychologist?.welcomeMessage || "Escolha o melhor dia e horário para iniciar seu cuidado com segurança e acolhimento."}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 dark:bg-white/10 p-3"><Shield className="mb-2 h-4 w-4 text-emerald-500 dark:text-emerald-300" /><p className="text-xs text-slate-600 dark:text-white/70">Ambiente seguro</p></div>
                <div className="rounded-2xl bg-slate-50 dark:bg-white/10 p-3"><Clock className="mb-2 h-4 w-4 text-blue-500 dark:text-blue-300" /><p className="text-xs text-slate-600 dark:text-white/70">Horários online</p></div>
                <div className="rounded-2xl bg-slate-50 dark:bg-white/10 p-3"><Zap className="mb-2 h-4 w-4 text-indigo-500 dark:text-indigo-300" /><p className="text-xs text-slate-600 dark:text-white/70">Confirmação rápida</p></div>
              </div>
              {(psychologist?.sessionPrice || psychologist?.clinicAddress) && (
                <div className="mt-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/10 p-4 text-sm text-slate-600 dark:text-white/70">
                  {psychologist.sessionPrice && <p className="font-semibold text-emerald-600 dark:text-emerald-300">Sessão: R$ {psychologist.sessionPrice.toFixed(2)}</p>}
                  {psychologist.clinicAddress && <p className="mt-1 text-xs text-slate-400 dark:text-white/50">{psychologist.clinicAddress}</p>}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col justify-center rounded-[2rem] border border-blue-200 dark:border-white/10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/15 dark:to-indigo-500/10 p-6 text-center text-slate-900 dark:text-white backdrop-blur-xl">
            <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 dark:bg-white/10">
              <Calendar className="h-8 w-8 text-blue-500 dark:text-blue-200" />
            </div>
            <h2 className="text-3xl font-bold">Agende sua consulta</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-white/60">Selecione data, horário e informe seus dados. O processo leva menos de 1 minuto.</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {["date", "time", "info"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === s ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" : ["date", "time", "info"].indexOf(step) > i ? "bg-blue-500/20 text-blue-600 dark:text-blue-300" : "bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-white/40"}`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`h-0.5 w-8 transition-colors ${["date", "time", "info"].indexOf(step) > i ? "bg-blue-500/50" : "bg-slate-200 dark:bg-white/10"}`} />}
            </div>
          ))}
        </div>

        {step === "date" && (
          <>
            <div className="bg-white dark:bg-white/5 backdrop-blur rounded-2xl p-6 ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
                <button onClick={nextMonth} className="p-2 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES_SHORT.map((d) => (
                  <div key={d} className="text-center text-xs text-slate-400 dark:text-white/40 font-medium py-2">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  const isAvailable = availableDates.has(dateStr)
                  const isToday = dateStr === new Date().toISOString().split("T")[0]

                  return (
                    <button
                      key={day}
                      disabled={!isAvailable}
                      onClick={() => handleSelectDate(dateStr)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                        isAvailable
                          ? "bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-500/25 cursor-pointer"
                          : "text-slate-300 dark:text-white/20 cursor-not-allowed"
                      } ${isToday ? "ring-1 ring-blue-500/40" : ""}`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {availableDays.length === 0 && (
              <p className="text-center text-slate-400 dark:text-white/40 mt-6">
                Nenhum horário disponível no momento. Tente novamente mais tarde.
              </p>
            )}
          </>
        )}

        {step === "time" && selectedDay && (
          <>
            <button
              onClick={() => setStep("date")}
              className="flex items-center gap-2 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 text-sm mb-4 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>

            <div className="bg-white dark:bg-white/5 backdrop-blur rounded-2xl p-6 ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {formatDateBR(selectedDay.date)}
              </h2>
              <p className="text-slate-400 dark:text-white/40 text-sm mb-6">{getDayName(selectedDay.dayOfWeek)}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedDay.slots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => handleSelectSlot(slot)}
                    className="bg-slate-50 dark:bg-white/5 hover:bg-blue-50 dark:hover:bg-blue-500/15 text-slate-700 dark:text-white/80 hover:text-blue-600 dark:hover:text-blue-300 rounded-xl py-3 px-4 text-sm font-medium transition-all ring-1 ring-slate-200 dark:ring-white/10 hover:ring-blue-500/30 hover:shadow-md hover:shadow-blue-500/5"
                  >
                    <Clock className="h-4 w-4 inline mr-1.5" />
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {step === "info" && selectedSlot && (
          <>
            <button
              onClick={() => setStep("time")}
              className="flex items-center gap-2 text-slate-400 dark:text-white/40 hover:text-slate-700 dark:hover:text-white/70 text-sm mb-4 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>

            <div className="bg-white dark:bg-white/5 backdrop-blur rounded-2xl p-6 ring-1 ring-slate-200 dark:ring-white/10 shadow-sm">
              <div className="mb-6 pb-4 border-b border-slate-200 dark:border-white/10">
                <p className="text-sm text-slate-400 dark:text-white/40">Agendamento para</p>
                <p className="text-slate-900 dark:text-white font-semibold">
                  {selectedDate && formatDateBR(selectedDate)} às {selectedSlot.time}
                </p>
                {psychologist && (
                  <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">com {psychologist.publicName || psychologist.name}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-white/60 text-sm">Nome completo *</Label>
                  <Input
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-slate-50 dark:bg-white/10 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-white/60 text-sm">Email</Label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-slate-50 dark:bg-white/10 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 dark:text-white/60 text-sm">WhatsApp</Label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-slate-50 dark:bg-white/10 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 h-12"
                  />
                </div>

                <Button
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-xl shadow-blue-500/25 rounded-xl transition-all"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={submitting || !name.trim()}
                >
                  {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {submitting ? "Agendando..." : "Confirmar Agendamento"}
                </Button>
              </div>
            </div>
          </>
        )}

        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 ring-1 ring-blue-500/30">
            <Image src="/logo.png" alt="PsiHumanis" width={28} height={28} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <p className="text-center text-xs text-slate-400 dark:text-white/20">
            PsiHumanis &mdash; Tecnologia a serviço da saúde mental
          </p>
        </div>
      </div>
    </div>
  )
}

export default BookingPage
