"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { usePatientAuth } from "../layout"
import toast from "react-hot-toast"
import { Loader2, Calendar, Clock, Video, ChevronLeft, ChevronRight } from "lucide-react"

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  modality: string | null
  onlineRoomUrl: string | null
  psychologist: { name: string }
}

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

const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
const DAY_NAMES_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]

function formatDateBR(dateStr: string): string {
  const [y, m, d] = dateStr.split("T")[0].split("-")
  return `${d}/${m}/${y}`
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export default function AgendaPacientePage() {
  const { patient, token } = usePatientAuth()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loadingAppts, setLoadingAppts] = useState(true)
  const [showBooking, setShowBooking] = useState(false)
  const [availableDays, setAvailableDays] = useState<AvailableDay[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear())

  useEffect(() => {
    if (!token) return
    fetch("/api/pacientes/agendamentos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAppointments)
      .catch(() => toast.error("Erro ao carregar agendamentos"))
      .finally(() => setLoadingAppts(false))
  }, [token])

  const loadAvailability = useCallback(async () => {
    try {
      const res = await fetch("/api/disponibilidade/public")
      const data = await res.json()
      setAvailableDays(data.availableDays || [])
    } catch {
      toast.error("Erro ao carregar horários")
    }
  }, [])

  const handleStartBooking = () => {
    setShowBooking(true)
    loadAvailability()
  }

  const availableDates = new Set(availableDays.map((d) => d.date))
  const selectedDay = availableDays.find((d) => d.date === selectedDate)

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()

  const handleBook = useCallback(async () => {
    if (!selectedSlot || !token) return
    setBookingLoading(true)
    try {
      const res = await fetch("/api/agendamentos/public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: patient?.name || "",
          email: patient?.email || undefined,
          phone: patient?.phone || undefined,
          startTime: selectedSlot.startTime,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao agendar")

      toast.success("Consulta agendada!")
      setShowBooking(false)
      setSelectedDate(null)
      setSelectedSlot(null)

      const res2 = await fetch("/api/pacientes/agendamentos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const appts = await res2.json()
      setAppointments(appts)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao agendar")
    } finally {
      setBookingLoading(false)
    }
  }, [selectedSlot, token, patient])

  const upcoming = appointments.filter((a) => new Date(a.startTime) > new Date() && a.status !== "CANCELLED")
  const past = appointments.filter((a) => new Date(a.startTime) <= new Date() || a.status === "CANCELLED")

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Minha Agenda</h1>
          <p className="text-white/50 text-sm mt-1">Bem-vindo, {patient?.name}</p>
        </div>
        <Button
          onClick={handleStartBooking}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Agendar consulta
        </Button>
      </div>

      {loadingAppts ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : !showBooking ? (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Próximas consultas</h2>
              <div className="space-y-3">
                {upcoming.map((a) => (
                  <div key={a.id} className="bg-white/5 rounded-xl p-4 ring-1 ring-white/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-medium">{formatDateBR(a.startTime)}</p>
                        <p className="text-white/50 text-sm mt-1">
                          <Clock className="h-3.5 w-3.5 inline mr-1" />
                          {formatTime(a.startTime)} — {formatTime(a.endTime)}
                        </p>
                        <p className="text-white/30 text-xs mt-1">
                          <Video className="h-3 w-3 inline mr-1" />
                          {a.modality === "online" ? "Online" : "Presencial"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {upcoming.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/50">Nenhuma consulta agendada</p>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Histórico</h2>
              <div className="space-y-2">
                {past.slice(0, 5).map((a) => (
                  <div key={a.id} className="bg-white/[0.03] rounded-xl p-3 ring-1 ring-white/5">
                    <p className="text-white/40 text-sm">{formatDateBR(a.startTime)} — {formatTime(a.startTime)}</p>
                    <p className="text-white/20 text-xs">{a.status === "CANCELLED" ? "Cancelada" : "Realizada"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => { setShowBooking(false); setSelectedDate(null); setSelectedSlot(null) }}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-all"
          >
            <ChevronLeft className="h-4 w-4" /> Voltar
          </button>

          {!selectedDate ? (
            <div className="bg-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1) } else { setCurrentMonth(currentMonth - 1) } }} className="p-2 text-white/40 hover:text-white/70">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="text-lg font-semibold text-white">{MONTH_NAMES[currentMonth]} {currentYear}</h2>
                <button onClick={() => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1) } else { setCurrentMonth(currentMonth + 1) } }} className="p-2 text-white/40 hover:text-white/70">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAY_NAMES_SHORT.map((d) => (
                  <div key={d} className="text-center text-xs text-white/40 font-medium py-2">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfWeek }, (_, i) => (<div key={`e-${i}`} />))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  const isAvail = availableDates.has(dateStr)
                  return (
                    <button key={day} disabled={!isAvail} onClick={() => setSelectedDate(dateStr)}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                        isAvail ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 cursor-pointer" : "text-white/20 cursor-not-allowed"
                      }`}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : !selectedSlot ? (
            <div className="bg-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-1">{formatDateBR(selectedDate)}</h2>
              <p className="text-white/40 text-sm mb-6">
                {["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][new Date(selectedDate).getDay()]}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedDay?.slots.map((s) => (
                  <button key={s.time} onClick={() => setSelectedSlot(s)}
                    className="bg-white/5 hover:bg-emerald-500/15 text-white/80 hover:text-emerald-300 rounded-xl py-3 px-4 text-sm font-medium transition-all ring-1 ring-white/10 hover:ring-emerald-500/30"
                  >
                    <Clock className="h-4 w-4 inline mr-1.5" />{s.time}
                  </button>
                ))}
              </div>
              <button onClick={() => setSelectedDate(null)} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm mt-4 transition-all">
                <ChevronLeft className="h-4 w-4" /> Outro dia
              </button>
            </div>
          ) : (
            <div className="bg-white/5 rounded-2xl p-6 text-center">
              <Calendar className="h-10 w-10 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-white mb-1">{formatDateBR(selectedDate)}</h2>
              <p className="text-white/50 text-lg mb-6">às {selectedSlot.time}</p>
              <div className="space-y-3 mb-6 text-left bg-white/[0.03] rounded-xl p-4">
                <p className="text-white/60 text-sm"><span className="text-white/80">{patient?.name}</span></p>
                {patient?.email && <p className="text-white/60 text-sm">{patient.email}</p>}
                {patient?.phone && <p className="text-white/60 text-sm">{patient.phone}</p>}
              </div>
              <Button onClick={handleBook} disabled={bookingLoading}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl">
                {bookingLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {bookingLoading ? "Agendando..." : "Confirmar Agendamento"}
              </Button>
              <button onClick={() => setSelectedSlot(null)} className="text-sm text-white/40 hover:text-white/60 mt-4 transition-colors">
                Escolher outro horário
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
