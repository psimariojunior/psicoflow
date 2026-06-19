"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { Loader2, Calendar, Clock, User, Phone, Mail, CheckCircle, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import toast from "react-hot-toast"

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

function AgendarPage() {
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

  useEffect(() => {
    fetch("/api/disponibilidade/public")
      .then((res) => res.json())
      .then((data) => {
        setAvailableDays(data.availableDays || [])
      })
      .catch(() => toast.error("Erro ao carregar horários"))
      .finally(() => setLoading(false))
  }, [])

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
  }, [name, email, phone, selectedSlot])

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-white/60">Carregando horários disponíveis...</p>
        </div>
      </div>
    )
  }

  if (step === "confirm") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-blue-500/20 mb-6">
              <CheckCircle className="h-10 w-10 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Consulta agendada!</h1>
            <p className="text-white/60 mb-8">
              {selectedDate && formatDateBR(selectedDate)} às {selectedSlot?.time}
            </p>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 mb-6 text-left">
              <p className="text-white/80 text-sm mb-1">
                  <User className="h-4 w-4 inline mr-2 text-blue-400" />
                {name}
              </p>
              {email && (
                <p className="text-white/60 text-sm mb-1">
                  <Mail className="h-4 w-4 inline mr-2 text-blue-400" />
                  {email}
                </p>
              )}
              {phone && (
                <p className="text-white/60 text-sm">
                  <Phone className="h-4 w-4 inline mr-2 text-blue-400" />
                  {phone}
                </p>
              )}
            </div>
            <p className="text-white/40 text-sm">
              Você receberá um lembrete por email/WhatsApp próximo ao horário da consulta.
            </p>
            <div className="mt-6 space-y-3">
              <Link href="/paciente/cadastro" className="block w-full py-3 px-4 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-xl transition-all text-center">
                Criar conta para gerenciar consultas
              </Link>
              <Link href="/" className="block w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all text-center text-sm">
                Voltar ao início
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-blue-500/30 to-indigo-500/30 mb-4">
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Agende sua consulta</h1>
          <p className="text-white/50">Escolha o melhor dia e horário para você</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["date", "time", "info"].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? "bg-blue-500 text-white" : ["date", "time", "info"].indexOf(step) > i ? "bg-blue-500/30 text-blue-300" : "bg-white/10 text-white/40"}`}>
                {i + 1}
              </div>
              {i < 2 && <div className={`h-0.5 w-8 ${["date", "time", "info"].indexOf(step) > i ? "bg-blue-500/50" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        {step === "date" && (
          <>
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-6">
                <button onClick={prevMonth} className="p-2 text-white/40 hover:text-white/70 transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold text-white">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
                <button onClick={nextMonth} className="p-2 text-white/40 hover:text-white/70 transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES_SHORT.map((d) => (
                  <div key={d} className="text-center text-xs text-white/40 font-medium py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
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
                          ? "bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 cursor-pointer"
                          : "text-white/20 cursor-not-allowed"
                      } ${isToday ? "ring-1 ring-blue-500/40" : ""}`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>

            {availableDays.length === 0 && (
              <p className="text-center text-white/40 mt-6">
                Nenhum horário disponível no momento. Tente novamente mais tarde.
              </p>
            )}
          </>
        )}

        {step === "time" && selectedDay && (
          <>
            <button
              onClick={() => setStep("date")}
              className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-4 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>

            <div className="bg-white/5 backdrop-blur rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-1">
                {formatDateBR(selectedDay.date)}
              </h2>
              <p className="text-white/40 text-sm mb-6">{getDayName(selectedDay.dayOfWeek)}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedDay.slots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => handleSelectSlot(slot)}
                    className="bg-white/5 hover:bg-blue-500/15 text-white/80 hover:text-blue-300 rounded-xl py-3 px-4 text-sm font-medium transition-all ring-1 ring-white/10 hover:ring-blue-500/30"
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
              className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mb-4 transition-all"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>

            <div className="bg-white/5 backdrop-blur rounded-2xl p-6">
              <div className="mb-6 pb-4 border-b border-white/10">
                <p className="text-sm text-white/40">Agendamento para</p>
                <p className="text-white font-semibold">
                  {selectedDate && formatDateBR(selectedDate)} às {selectedSlot.time}
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/60 text-sm">Nome completo *</Label>
                  <Input
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/60 text-sm">Email</Label>
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/60 text-sm">WhatsApp</Label>
                  <Input
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12"
                  />
                </div>

                <Button
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-xl shadow-blue-500/25 rounded-xl transition-all"
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
            <Image src="/logo.png" alt="PsicoFlow" width={28} height={28} className="w-full h-full object-cover" loading="lazy" />
          </div>
          <p className="text-center text-xs text-white/20">
            PsicoFlow &mdash; Tecnologia a serviço da saúde mental
          </p>
        </div>
      </div>
    </div>
  )
}

export default AgendarPage
