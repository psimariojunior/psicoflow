"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials, calculateAge, formatDateTime } from "@/lib/utils"
import { RichTextEditor } from "@/components/prontuario/rich-text-editor"
import { SessionTimeline } from "@/components/prontuario/session-timeline"
import toast from "react-hot-toast"
import { Play, Pause, Square, Clock, Save, User, FileText, Calendar, MapPin, Video, Loader2, ChevronLeft, CheckCircle, Sparkles, Heart, Activity, Brain, Quote, ListTodo, Target, Eye, Trash2, Briefcase } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const GESTALT_MARKER = "---GESTALT-DATA---"

function encodeNotes(generalNotes: string, gestalt: { awareness: string; techniques: string; cycle: string }): string {
  const gestaltJson = JSON.stringify(gestalt)
  return `${generalNotes}\n\n${GESTALT_MARKER}\n${gestaltJson}`
}

function decodeNotes(notes: string | null): { generalNotes: string; gestalt: { awareness: string; techniques: string; cycle: string } } {
  if (!notes) return { generalNotes: "", gestalt: { awareness: "", techniques: "", cycle: "" } }
  const idx = notes.indexOf(GESTALT_MARKER)
  if (idx === -1) return { generalNotes: notes, gestalt: { awareness: "", techniques: "", cycle: "" } }
  const generalNotes = notes.slice(0, idx).trim()
  const gestaltJson = notes.slice(idx + GESTALT_MARKER.length).trim()
  try {
    const gestalt = JSON.parse(gestaltJson)
    return {
      generalNotes,
      gestalt: {
        awareness: gestalt.awareness || "",
        techniques: gestalt.techniques || "",
        cycle: gestalt.cycle || "",
      },
    }
  } catch {
    return { generalNotes: notes, gestalt: { awareness: "", techniques: "", cycle: "" } }
  }
}

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

interface SessionListItem {
  id: string
  date: string
  createdAt: string
  status: string
  moodBefore?: number | null
  moodAfter?: number | null
  type?: string | null
  notes?: string | null
  tags?: string | null
}

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

const moodEmoji = (m: number | null | undefined) => {
  if (m == null) return "—"
  if (m <= 3) return "😔"
  if (m <= 5) return "😐"
  if (m <= 7) return "🙂"
  return "😊"
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [allSessions, setAllSessions] = useState<SessionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [dirty, setDirty] = useState(false)
  const [tab, setTab] = useState<"soap" | "timeline" | "gestalt">("soap")

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

  const [gestaltTechniques, setGestaltTechniques] = useState("")
  const [gestaltAwareness, setGestaltAwareness] = useState("")
  const [gestaltCycle, setGestaltCycle] = useState("")

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
        const decoded = decodeNotes(data.notes)
        setNotes(decoded.generalNotes)
        setGestaltAwareness(decoded.gestalt.awareness)
        setGestaltTechniques(decoded.gestalt.techniques)
        setGestaltCycle(decoded.gestalt.cycle)
        setMoodBefore(data.moodBefore ? String(data.moodBefore) : "")
        setMoodAfter(data.moodAfter ? String(data.moodAfter) : "")
        setTags(data.tags || "")
        setSessionType(data.type || "")
        setIsRemote(data.isRemote)
        if (data.status === "IN_PROGRESS" && data.startedAt) {
          const paused = data.pausedSeconds ?? 0
          const sinceStart = Math.floor((Date.now() - new Date(data.startedAt).getTime()) / 1000)
          setElapsed(paused + sinceStart)
        } else if (data.duration) {
          setElapsed(data.duration)
        }

        const hist = await fetch(`/api/sessoes?patientId=${data.patient.id}`)
        if (hist.ok) {
          const list = await hist.json()
          setAllSessions(
            (Array.isArray(list) ? list : list.data || [])
              .filter((s: SessionListItem) => s.id !== data.id)
          )
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

  const saveDraft = useCallback(async () => {
    if (!dirty || !session) return
    setSaving(true)
    try {
      const encodedNotes = encodeNotes(notes, {
        awareness: gestaltAwareness,
        techniques: gestaltTechniques,
        cycle: gestaltCycle,
      })
      const body: Record<string, unknown> = {
        subjective, objective, assessment, plan,
        notes: encodedNotes,
        moodBefore: moodBefore ? parseInt(moodBefore) : null,
        moodAfter: moodAfter ? parseInt(moodAfter) : null,
        tags, type: sessionType, isRemote,
      }
      await fetch(`/api/sessoes/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      setDirty(false)
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }, [dirty, session, subjective, objective, assessment, plan, notes, moodBefore, moodAfter, tags, sessionType, isRemote, gestaltTechniques, gestaltAwareness, gestaltCycle])

  function markDirty() {
    if (!dirty) setDirty(true)
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current)
    autoSaveRef.current = setTimeout(saveDraft, 3000)
  }

  useEffect(() => {
    return () => { if (autoSaveRef.current) clearTimeout(autoSaveRef.current) }
  }, [saveDraft])

  async function handleAction(action: string) {
    if (!session) return
    setSaving(true)
    try {
      const encodedNotes = encodeNotes(notes, {
        awareness: gestaltAwareness,
        techniques: gestaltTechniques,
        cycle: gestaltCycle,
      })
      const res = await fetch(`/api/sessoes/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...(action === "end" ? {
            subjective, objective, assessment, plan,
            notes: encodedNotes,
            moodBefore: moodBefore ? parseInt(moodBefore) : null,
            moodAfter: moodAfter ? parseInt(moodAfter) : null,
            tags, type: sessionType, isRemote,
          } : {}),
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
      } else if (action === "save") {
        toast.success("Rascunho salvo!")
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
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
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

  const statusConfig = {
    SCHEDULED: { label: "Agendada", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
    IN_PROGRESS: { label: "Em andamento", color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
    PAUSED: { label: "Pausada", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
    COMPLETED: { label: "Concluída", color: "text-slate-600 bg-slate-100 dark:bg-slate-900/30 dark:text-slate-400", border: "border-slate-200 dark:border-slate-800" },
  }[session.status] || { label: session.status, color: "", border: "" }

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/sessoes">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">Sessão Terapêutica</h2>
              <Badge variant="outline" className={cn("text-xs font-normal", statusConfig.color, statusConfig.border)}>
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {session.appointment ? formatDateTime(session.appointment.startTime) : formatDateTime(session.createdAt)}
            </p>
          </div>
        </div>

          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-xl border transition-all",
              isActive ? "border-emerald-500/30 bg-emerald-500/10 shadow-lg shadow-emerald-500/10" :
              isPaused ? "border-amber-500/30 bg-amber-500/10" :
              "border bg-card"
            )}>
              <Clock className={cn("h-5 w-5", isActive ? "text-emerald-500 animate-pulse" : isPaused ? "text-amber-500" : "text-muted-foreground")} />
              <span className={cn("text-2xl font-mono font-bold tabular-nums",
                isActive ? "text-emerald-600 dark:text-emerald-400" : isPaused ? "text-amber-600 dark:text-amber-400" : "text-foreground"
              )}>
                {formatTimer(elapsed)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isScheduled && (
                <Button onClick={() => handleAction("start")} disabled={saving}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 gap-1.5 shadow-lg shadow-emerald-500/20">
                  <Play className="h-4 w-4" /> Iniciar
                </Button>
              )}
              {isActive && (
                <>
                  <Button onClick={() => handleAction("pause")} disabled={saving} variant="outline" className="gap-1.5">
                    <Pause className="h-4 w-4" /> Pausar
                  </Button>
                  <Button onClick={() => handleAction("end")} disabled={saving} variant="destructive" className="gap-1.5">
                    <Square className="h-4 w-4" /> Encerrar
                  </Button>
                </>
              )}
              {isPaused && (
                <>
                  <Button onClick={() => handleAction("resume")} disabled={saving}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-emerald-700 gap-1.5">
                    <Play className="h-4 w-4" /> Retomar
                  </Button>
                  <Button onClick={() => handleAction("end")} disabled={saving} variant="destructive" className="gap-1.5">
                    <Square className="h-4 w-4" /> Encerrar
                  </Button>
                </>
              )}
              {isCompleted && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Concluída</span>
                </div>
              )}
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Excluir sessão?</DialogTitle>
                  <DialogDescription>
                    Esta ação não pode ser desfeita. A sessão e seus dados serão removidos permanentemente.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/sessoes/${session.id}`, { method: "DELETE" })
                          if (!res.ok) throw new Error()
                          toast.success("Sessão excluída")
                          router.push("/sessoes")
                        } catch {
                          toast.error("Erro ao excluir sessão")
                        }
                      }}
                    >
                      Excluir
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <motion.div className="bg-card rounded-xl border overflow-hidden" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 ring-2 ring-white/30 shadow-lg">
                  <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-white">
                  <h3 className="font-semibold text-lg leading-tight">{patient.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-emerald-100 mt-0.5">
                    {age && <span>{age} anos</span>}
                    {patient.gender && <span>• {patient.gender === "M" ? "Masculino" : patient.gender === "F" ? "Feminino" : patient.gender}</span>}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-2.5 text-sm">
              {patient.cpf && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  <span>CPF: <span className="text-foreground font-medium">{patient.cpf}</span></span>
                </div>
              )}
              {patient.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span className="text-foreground font-medium">{patient.phone}</span>
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="truncate text-foreground font-medium">{patient.email}</span>
                </div>
              )}
              {patient.profession && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span className="text-foreground font-medium">{patient.profession}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mt-0.5" />
                  <span className="text-xs leading-relaxed text-foreground">
                    {patient.address}
                    {patient.neighborhood && `, ${patient.neighborhood}`}
                    {patient.city && ` - ${patient.city}`}
                    {patient.state && `/${patient.state}`}
                  </span>
                </div>
              )}
              {patient.observations && (
                <div className="pt-2 border-t mt-3">
                  <p className="text-xs text-muted-foreground mb-1">Observações</p>
                  <p className="text-xs text-foreground">{patient.observations}</p>
                </div>
              )}
              {session.appointment && (
                <div className={cn(
                  "flex items-center gap-2 text-xs pt-3 border-t mt-3",
                  session.appointment.modality === "online" ? "text-blue-600 dark:text-blue-400" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {session.appointment.modality === "online" ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                  <span>{session.appointment.modality === "online" ? "Online" : "Presencial"}</span>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div className="bg-card rounded-xl border p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-rose-400" />
              <h4 className="text-sm font-semibold">Humor</h4>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  Pré-sessão {moodBefore && <span className="text-lg">{moodEmoji(parseInt(moodBefore))}</span>}
                </Label>
                <Select value={moodBefore} onValueChange={(v) => { setMoodBefore(v); markDirty() }} disabled={!canEdit}>
                  <SelectTrigger className="h-10 mt-1">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: n <= 3 ? "#f87171" : n <= 5 ? "#fbbf24" : n <= 7 ? "#a3e635" : "#34d399" }} />
                          {n} - {n <= 3 ? "Muito baixo" : n <= 5 ? "Baixo" : n <= 7 ? "Bom" : "Ótimo"}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs flex items-center gap-1">
                  Pós-sessão {moodAfter && <span className="text-lg">{moodEmoji(parseInt(moodAfter))}</span>}
                </Label>
                <Select value={moodAfter} onValueChange={(v) => { setMoodAfter(v); markDirty() }} disabled={!canEdit}>
                  <SelectTrigger className="h-10 mt-1">
                    <SelectValue placeholder="--" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: n <= 3 ? "#f87171" : n <= 5 ? "#fbbf24" : n <= 7 ? "#a3e635" : "#34d399" }} />
                          {n} - {n <= 3 ? "Muito baixo" : n <= 5 ? "Baixo" : n <= 7 ? "Bom" : "Ótimo"}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {moodBefore && moodAfter && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Evolução</span>
                    <span className={cn(
                      "font-medium",
                      parseInt(moodAfter) > parseInt(moodBefore) ? "text-emerald-500" :
                      parseInt(moodAfter) < parseInt(moodBefore) ? "text-rose-500" : "text-muted-foreground"
                    )}>
                      {parseInt(moodAfter) > parseInt(moodBefore) ? "↑ Melhora" :
                       parseInt(moodAfter) < parseInt(moodBefore) ? "↓ Piora" : "→ Estável"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div className="bg-card rounded-xl border p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-4 w-4 text-violet-400" />
              <h4 className="text-sm font-semibold">Sessão</h4>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground text-xs">Tipo</Label>
                <Select value={sessionType} onValueChange={(v) => { setSessionType(v); markDirty() }} disabled={!canEdit}>
                  <SelectTrigger className="h-10 mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INDIVIDUAL">Individual</SelectItem>
                    <SelectItem value="COUPLE">Casal</SelectItem>
                    <SelectItem value="FAMILY">Família</SelectItem>
                    <SelectItem value="GROUP">Grupo</SelectItem>
                    <SelectItem value="SUPERVISION">Supervisão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Tags</Label>
                <Input value={tags} onChange={(e) => { setTags(e.target.value); markDirty() }}
                  placeholder="ansiedade, autoestima, luto"
                  disabled={!canEdit} className="h-10 mt-1" />
              </div>
              {session.appointment && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                  <Calendar className="h-3 w-3" />
                  <span>Vinculado ao agendamento</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border">
            {[
              { id: "soap" as const, label: "SOAP", icon: FileText },
              { id: "gestalt" as const, label: "Gestalt", icon: Brain },
              { id: "timeline" as const, label: "Histórico", icon: Activity },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  tab === t.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
            <div className="flex-1" />
            {dirty && (
              <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Não salvo
              </span>
            )}
          </div>

          {tab === "soap" && (
            <motion.div className="bg-card rounded-xl border p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Prontuário SOAP</h3>
                  <p className="text-xs text-muted-foreground">Subjetivo • Objetivo • Avaliação • Plano</p>
                </div>
              </div>

              <div className="space-y-5">
                {[
                  { letter: "S", label: "Subjetivo", desc: "Relato do paciente", hint: "O que o paciente trouxe? Queixas, sentimentos, percepções...", color: "from-blue-500 to-indigo-600", value: subjective, set: setSubjective },
                  { letter: "O", label: "Objetivo", desc: "Observações do psicólogo", hint: "O que você observou? Comportamento, aparência, interação...", color: "from-emerald-500 to-teal-600", value: objective, set: setObjective },
                  { letter: "A", label: "Avaliação", desc: "Análise clínica", hint: "Diagnóstico, progresso, insights, interpretação...", color: "from-amber-500 to-orange-600", value: assessment, set: setAssessment },
                  { letter: "P", label: "Plano", desc: "Próximos passos", hint: "Intervenções, tarefas, encaminhamentos, conduta...", color: "from-purple-500 to-violet-600", value: plan, set: setPlan },
                ].map((field) => (
                  <div key={field.letter}>
                    <Label className="text-sm font-medium flex items-center gap-2 mb-1.5">
                      <span className={cn(
                        "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm",
                        field.color.replace("from-", "bg-").replace(" to-*", "").split(" ")[0]
                      )}>
                        {field.letter}
                      </span>
                      {field.label}
                      <span className="text-xs text-muted-foreground font-normal">— {field.desc}</span>
                    </Label>
                    <RichTextEditor
                      value={field.value}
                      onChange={(v) => { field.set(v); markDirty() }}
                      placeholder={field.hint}
                      minHeight="120px"
                    />
                  </div>
                ))}

                <div>
                  <Label className="text-sm font-medium mb-1.5">Observações Gerais</Label>
                  <RichTextEditor
                    value={notes}
                    onChange={(v) => { setNotes(v); markDirty() }}
                    placeholder="Informações adicionais relevantes..."
                    minHeight="100px"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {tab === "gestalt" && (
            <motion.div className="bg-card rounded-xl border p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Anotações Gestalt-Terapia</h3>
                  <p className="text-xs text-muted-foreground">Abordagem fenomenológica • Aqui e agora • Consciência</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-1.5">
                    <Eye className="h-4 w-4 text-emerald-500" />
                    Consciência (Awareness) — O que emergiu no campo
                  </Label>
                  <RichTextEditor
                    value={gestaltAwareness}
                    onChange={(v) => { setGestaltAwareness(v); markDirty() }}
                    placeholder="Figuras que emergiram • Contato • Fronteira • Resistências • Sensações corporais • Emoções presentes..."
                    minHeight="120px"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-1.5">
                    <Target className="h-4 w-4 text-violet-500" />
                    Técnicas e Intervenções
                  </Label>
                  <RichTextEditor
                    value={gestaltTechniques}
                    onChange={(v) => { setGestaltTechniques(v); markDirty() }}
                    placeholder="Cadeira vazia • Polaridades • Amplificação • Corpo • Sonhos • Experimentos • Diálogo..."
                    minHeight="120px"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium flex items-center gap-2 mb-1.5">
                    <ListTodo className="h-4 w-4 text-amber-500" />
                    Ciclo de Contato e Fechamento
                  </Label>
                  <RichTextEditor
                    value={gestaltCycle}
                    onChange={(v) => { setGestaltCycle(v); markDirty() }}
                    placeholder="Onde o ciclo de contato foi interrompido? • Ajustamentos criativos • Suporte necessário • Encaminhamentos..."
                    minHeight="120px"
                  />
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="h-4 w-4" />
                    Lembretes Gestálticos
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <li>• Focar no <strong>aqui e agora</strong> — o que está acontecendo agora?</li>
                    <li>• Atentar para a <strong>linguagem corporal</strong> — o corpo não mente</li>
                    <li>• Observar <strong>polaridades</strong> — &ldquo;por um lado... por outro lado...&rdquo;</li>
                    <li>• Identificar <strong>figuras</strong> — o que emerge como mais significativo?</li>
                    <li>• Notar <strong>evitações</strong> — onde o contato é interrompido?</li>
                    <li>• Validar os <strong>ajustamentos criativos</strong> do paciente</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {tab === "timeline" && (
            <motion.div className="bg-card rounded-xl border p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Histórico de Sessões</h3>
                  <p className="text-xs text-muted-foreground">{allSessions.length} sessões anteriores</p>
                </div>
              </div>

              <SessionTimeline
                sessions={[
                  ...allSessions.map((s) => ({ ...s, date: s.date || s.createdAt })),
                  {
                    id: session.id,
                    date: session.createdAt,
                    status: session.status,
                    moodBefore: session.moodBefore,
                    moodAfter: session.moodAfter,
                    type: session.type,
                    notes: session.notes,
                    tags: session.tags,
                  },
                ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                currentId={session.id}
                onSelect={(id) => id !== session.id && router.push(`/sessoes/${id}`)}
              />
            </motion.div>
          )}

          {canEdit && (
            <motion.div className="flex justify-end gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button onClick={() => handleAction("save")} disabled={saving || !dirty} variant="secondary" className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar Rascunho
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}


