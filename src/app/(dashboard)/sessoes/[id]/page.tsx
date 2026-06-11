"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials, calculateAge, formatDateTime } from "@/lib/utils"
import toast from "react-hot-toast"
import { Play, Pause, Square, Clock, Save, User, FileText, Calendar, MapPin, Video, Loader2, ChevronLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

interface SessionData {
  id: string
  status: string
  startedAt: string | null
  endedAt: string | null
  duration: number | null
  pausedSeconds: number | null
  subjective: string | null
  objective: string | null
  assessment: string | null
  plan: string | null
  notes: string | null
  moodBefore: number | null
  moodAfter: number | null
  tags: string | null
  type: string | null
  isRemote: boolean
  createdAt: string
  patient: {
    id: string
    name: string
    cpf: string | null
    phone: string | null
    email: string | null
    dateOfBirth: string | null
    gender: string | null
    address: string | null
    neighborhood: string | null
    city: string | null
    state: string | null
    profession: string | null
    observations: string | null
  }
  appointment: {
    id: string
    startTime: string
    endTime: string
    modality: string | null
    status: string
  } | null
}

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [dirty, setDirty] = useState(false)

  const [subjective, setSubjective] = useState("")
  const [objective, setObjective] = useState("")
  const [assessment, setAssessment] = useState("")
  const [plan, setPlan] = useState("")
  const [notes, setNotes] = useState("")
  const [moodBefore, setMoodBefore] = useState("")
  const [moodAfter, setMoodAfter] = useState("")
  const [tags, setTags] = useState("")
  const [sessionType, setSessionType] = useState("")
  const [isRemote, setIsRemote] = useState(false)

  const autoSaveRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/sessoes/${params.id}`)
        if (!res.ok) throw new Error()
        const data: SessionData = await res.json()
        setSession(data)
        setSubjective(data.subjective || "")
        setObjective(data.objective || "")
        setAssessment(data.assessment || "")
        setPlan(data.plan || "")
        setNotes(data.notes || "")
        setMoodBefore(data.moodBefore ? String(data.moodBefore) : "")
        setMoodAfter(data.moodAfter ? String(data.moodAfter) : "")
        setTags(data.tags || "")
        setSessionType(data.type || "")
        setIsRemote(data.isRemote)

        // Reconstruct elapsed time for IN_PROGRESS sessions
        if (data.status === "IN_PROGRESS" && data.startedAt) {
          const paused = data.pausedSeconds ?? 0
          const sinceStart = Math.floor((Date.now() - new Date(data.startedAt).getTime()) / 1000)
          setElapsed(paused + sinceStart)
        } else if (data.duration) {
          setElapsed(data.duration)
        }
      } catch {
        toast.error("Erro ao carregar sessão")
        router.push("/agenda")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id, router])

  // Timer tick
  useEffect(() => {
    if (session?.status === "IN_PROGRESS") {
      timerRef.current = setInterval(() => {
        const paused = session.pausedSeconds ?? 0
        const sinceStart = Math.floor((Date.now() - new Date(session.startedAt!).getTime()) / 1000)
        setElapsed(paused + sinceStart)
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [session?.status, session?.startedAt, session?.pausedSeconds])

  // Auto-save draft
  const saveDraft = useCallback(async () => {
    if (!dirty || !session) return
    setSaving(true)
    try {
      await fetch(`/api/sessoes/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjective, objective, assessment, plan, notes, moodBefore: moodBefore ? parseInt(moodBefore) : null, moodAfter: moodAfter ? parseInt(moodAfter) : null, tags, type: sessionType, isRemote }),
      })
      setDirty(false)
    } catch {
      // silent auto-save failure
    } finally {
      setSaving(false)
    }
  }, [dirty, session, subjective, objective, assessment, plan, notes, moodBefore, moodAfter, tags, sessionType, isRemote])

  useEffect(() => {
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(saveDraft, 3000)
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current) }
  }, [subjective, objective, assessment, plan, notes, moodBefore, moodAfter, tags, sessionType, isRemote, saveDraft])

  function markDirty() {
    if (!dirty) setDirty(true)
  }

  async function handleAction(action: string) {
    if (!session) return
    setSaving(true)
    try {
      const res = await fetch(`/api/sessoes/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...(action === "end" ? { subjective, objective, assessment, plan, notes, moodBefore: moodBefore ? parseInt(moodBefore) : null, moodAfter: moodAfter ? parseInt(moodAfter) : null, tags, type: sessionType, isRemote } : {}),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      const updated: SessionData = await res.json()
      setSession(updated)
      setDirty(false)

      if (action === "start") {
        setElapsed(0)
        toast.success("Sessão iniciada!")
      } else if (action === "pause") {
        toast.success("Sessão pausada")
      } else if (action === "resume") {
        toast.success("Sessão retomada!")
      } else if (action === "end") {
        toast.success("Sessão concluída!")
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  if (!session) return null

  const isActive = session.status === "IN_PROGRESS"
  const isPaused = session.status === "PAUSED"
  const isCompleted = session.status === "COMPLETED"
  const isScheduled = session.status === "SCHEDULED"
  const canEdit = isActive || isScheduled || isPaused
  const patient = session.patient
  const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/agenda">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Sessão Terapêutica</h2>
            <p className="text-gray-400 text-sm">
              {session.appointment ? formatDateTime(session.appointment.startTime) : formatDateTime(session.createdAt)}
            </p>
          </div>
        </div>

        {/* Timer + Controls */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl ring-1 ${
            isActive ? "bg-emerald-500/10 ring-emerald-500/30" : isPaused ? "bg-amber-500/10 ring-amber-500/30" : isCompleted ? "bg-slate-800 ring-slate-700" : "bg-slate-800 ring-slate-700"
          }`}>
            <Clock className={`h-5 w-5 ${isActive ? "text-emerald-400" : isPaused ? "text-amber-400" : "text-gray-400"}`} />
            <span className={`text-2xl font-mono font-bold tabular-nums ${
              isActive ? "text-emerald-300" : isPaused ? "text-amber-300" : "text-white"
            }`}>
              {formatTimer(elapsed)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isScheduled && (
              <Button onClick={() => handleAction("start")} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-5 rounded-xl">
                <Play className="h-4 w-4 mr-1.5" /> Iniciar
              </Button>
            )}
            {isActive && (
              <>
                <Button onClick={() => handleAction("pause")} disabled={saving} variant="outline" className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 h-11 px-4 rounded-xl">
                  <Pause className="h-4 w-4 mr-1.5" /> Pausar
                </Button>
                <Button onClick={() => handleAction("end")} disabled={saving} className="bg-red-600 hover:bg-red-500 text-white h-11 px-5 rounded-xl">
                  <Square className="h-4 w-4 mr-1.5" /> Encerrar
                </Button>
              </>
            )}
            {isPaused && (
              <>
                <Button onClick={() => handleAction("resume")} disabled={saving} className="bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-5 rounded-xl">
                  <Play className="h-4 w-4 mr-1.5" /> Retomar
                </Button>
                <Button onClick={() => handleAction("end")} disabled={saving} className="bg-red-600 hover:bg-red-500 text-white h-11 px-5 rounded-xl">
                  <Square className="h-4 w-4 mr-1.5" /> Encerrar
                </Button>
              </>
            )}
            {isCompleted && (
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Concluída</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Patient Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/50 rounded-2xl p-5 ring-1 ring-slate-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12 ring-2 ring-slate-700">
                <AvatarFallback className="bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                  {getInitials(patient.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white font-semibold text-lg">{patient.name}</h3>
                {age && <p className="text-gray-400 text-xs">{age} anos</p>}
              </div>
            </div>

            <div className="space-y-2.5 text-sm">
              {patient.cpf && (
                <div className="flex items-center gap-2 text-gray-400">
                  <FileText className="h-3.5 w-3.5 text-gray-500" />
                  <span>CPF: <span className="text-gray-300">{patient.cpf}</span></span>
                </div>
              )}
              {patient.phone && (
                <div className="flex items-center gap-2 text-gray-400">
                  <User className="h-3.5 w-3.5 text-gray-500" />
                  <span>{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="text-gray-400 truncate">{patient.email}</div>
              )}
              {patient.profession && (
                <div className="text-gray-400">Profissão: <span className="text-gray-300">{patient.profession}</span></div>
              )}
              {patient.address && (
                <div className="text-gray-400 text-xs leading-relaxed">
                  {patient.address}
                  {patient.neighborhood && `, ${patient.neighborhood}`}
                  {patient.city && ` - ${patient.city}`}
                  {patient.state && `/${patient.state}`}
                </div>
              )}
              {session.appointment && (
                <div className={`flex items-center gap-2 text-xs mt-3 pt-3 border-t border-slate-700/50 ${
                  session.appointment.modality === "online" ? "text-blue-400" : "text-emerald-400"
                }`}>
                  {session.appointment.modality === "online" ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  <span>{session.appointment.modality === "online" ? "Online" : "Presencial"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Mood */}
          <div className="bg-slate-900/50 rounded-2xl p-5 ring-1 ring-slate-700/50">
            <h4 className="text-sm font-semibold text-white mb-3">Avaliação de Humor</h4>
            <div className="space-y-3">
              <div>
                <Label className="text-gray-400 text-xs">Pré-sessão (1-10)</Label>
                <Select value={moodBefore} onValueChange={(v) => { setMoodBefore(v); markDirty() }} disabled={!canEdit}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-10 mt-1">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-400 text-xs">Pós-sessão (1-10)</Label>
                <Select value={moodAfter} onValueChange={(v) => { setMoodAfter(v); markDirty() }} disabled={!canEdit}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-10 mt-1">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-slate-900/50 rounded-2xl p-5 ring-1 ring-slate-700/50">
            <h4 className="text-sm font-semibold text-white mb-3">Informações da Sessão</h4>
            <div className="space-y-3">
              <div>
                <Label className="text-gray-400 text-xs">Tipo</Label>
                <Select value={sessionType} onValueChange={(v) => { setSessionType(v); markDirty() }} disabled={!canEdit}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-10 mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="casal">Casal</SelectItem>
                    <SelectItem value="familia">Família</SelectItem>
                    <SelectItem value="grupo">Grupo</SelectItem>
                    <SelectItem value="supervisao">Supervisão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-400 text-xs">Tags (separadas por vírgula)</Label>
                <Input value={tags} onChange={(e) => { setTags(e.target.value); markDirty() }} placeholder="ansiedade, TCC, autoestima" disabled={!canEdit}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-500 h-10 mt-1" />
              </div>
              {session.appointment && (
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-3 pt-3 border-t border-slate-700/50">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Agendamento vinculado</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right — SOAP Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/50 rounded-2xl p-5 ring-1 ring-slate-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-400" />
                Prontuário SOAP
              </h3>
              {dirty && <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">NÃO SALVO</span>}
            </div>

            <div className="space-y-5">
              {/* Subjective */}
              <div>
                <Label className="text-gray-300 text-sm font-medium flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-bold">S</span>
                  Subjetivo — Relato do paciente
                </Label>
                <Textarea value={subjective} onChange={(e) => { setSubjective(e.target.value); markDirty() }}
                  placeholder="O que o paciente relatou? Queixas, sentimentos, percepções..."
                  rows={4} disabled={!canEdit}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-500 resize-none" />
              </div>

              {/* Objective */}
              <div>
                <Label className="text-gray-300 text-sm font-medium flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded bg-green-500/20 text-green-400 text-xs flex items-center justify-center font-bold">O</span>
                  Objetivo — Observações do psicólogo
                </Label>
                <Textarea value={objective} onChange={(e) => { setObjective(e.target.value); markDirty() }}
                  placeholder="O que você observou? Comportamento, aparência, interação..."
                  rows={4} disabled={!canEdit}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-500 resize-none" />
              </div>

              {/* Assessment */}
              <div>
                <Label className="text-gray-300 text-sm font-medium flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-bold">A</span>
                  Avaliação — Análise clínica
                </Label>
                <Textarea value={assessment} onChange={(e) => { setAssessment(e.target.value); markDirty() }}
                  placeholder="Sua análise clínica: diagnóstico, progresso, insights..."
                  rows={4} disabled={!canEdit}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-500 resize-none" />
              </div>

              {/* Plan */}
              <div>
                <Label className="text-gray-300 text-sm font-medium flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-bold">P</span>
                  Plano — Próximos passos
                </Label>
                <Textarea value={plan} onChange={(e) => { setPlan(e.target.value); markDirty() }}
                  placeholder="Plano terapêutico: intervenções, tarefas, encaminhamentos..."
                  rows={4} disabled={!canEdit}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-500 resize-none" />
              </div>

              {/* Notes */}
              <div>
                <Label className="text-gray-300 text-sm font-medium mb-1.5">Observações Gerais</Label>
                <Textarea value={notes} onChange={(e) => { setNotes(e.target.value); markDirty() }}
                  placeholder="Informações adicionais relevantes..."
                  rows={3} disabled={!canEdit}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-gray-500 resize-none" />
              </div>
            </div>
          </div>

          {/* Save button */}
          {canEdit && (
            <div className="flex justify-end">
              <Button onClick={() => handleAction("save")} disabled={saving || !dirty}
                className="bg-slate-700 hover:bg-slate-600 text-white h-11 px-6 rounded-xl">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Salvar Rascunho
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
