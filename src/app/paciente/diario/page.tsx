"use client"

import { useState, useEffect } from "react"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { Loader2, Heart, Smile, Meh, Frown, Angry, Sun, Moon, CloudSun, Brain, Activity, BookHeart, Sparkles } from "lucide-react"

const MOODS = [
  { value: 1, icon: Angry, label: "Muito ruim", color: "text-red-400", bg: "bg-red-500/10", ring: "ring-red-500/30" },
  { value: 2, icon: Frown, label: "Ruim", color: "text-orange-400", bg: "bg-orange-500/10", ring: "ring-orange-500/30" },
  { value: 3, icon: Meh, label: "Neutro", color: "text-yellow-400", bg: "bg-yellow-500/10", ring: "ring-yellow-500/30" },
  { value: 4, icon: Smile, label: "Bom", color: "text-primary", bg: "bg-emerald-500/10", ring: "ring-primary/30" },
  { value: 5, icon: Heart, label: "Ótimo", color: "text-green-400", bg: "bg-green-500/10", ring: "ring-green-500/30" },
]

const EMOTIONS = [
  "Ansiedade", "Tristeza", "Alegria", "Raiva", "Calma", "Medo",
  "Esperança", "Gratidão", "Solidão", "Motivação", "Cansaço", "Paz"
]

const ACTIVITIES = [
  "Trabalho", "Estudo", "Exercício", "Leitura", "Meditação",
  "Família", "Amigos", "Lazer", "Natureza", "Música"
]

interface DiaryEntry {
  id: string
  date: string
  mood: number
  emotions: string | null
  activities: string | null
  notes: string | null
  sleepHours: number | null
  sleepQuality: string | null
  anxietyLevel: string | null
}

export default function DiarioPage() {
  const { token } = usePatientAuth()
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mood, setMood] = useState<number>(0)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [todayEntry, setTodayEntry] = useState<DiaryEntry | null>(null)

  useEffect(() => {
    if (!token) return
    fetch("/api/pacientes/diario", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error()
        const data = await r.json()
        if (!Array.isArray(data)) { setEntries([]); return }
        setEntries(data)
        const today = data.find((e: DiaryEntry) => {
          const d = new Date(e.date).toISOString().split("T")[0]
          return d === new Date().toISOString().split("T")[0]
        })
        if (today) {
          setTodayEntry(today)
          setMood(today.mood)
          try {
            setSelectedEmotions(today.emotions ? JSON.parse(today.emotions) : [])
          } catch { setSelectedEmotions([]) }
          try {
            setSelectedActivities(today.activities ? JSON.parse(today.activities) : [])
          } catch { setSelectedActivities([]) }
          setNotes(today.notes || "")
        }
      })
      .catch(() => toast.error("Erro ao carregar diário"))
      .finally(() => setLoading(false))
  }, [token])

  const toggleArray = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((a) => a !== item) : [...arr, item]

  const handleSave = async () => {
    if (mood === 0) { toast.error("Selecione seu humor"); return }
    if (!token) return
    setSaving(true)
    try {
      const res = await fetch("/api/pacientes/diario", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          emotions: JSON.stringify(selectedEmotions),
          activities: JSON.stringify(selectedActivities),
          notes: notes.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTodayEntry(data)
      setEntries((prev) => {
        const filtered = prev.filter((e) => {
          const d = new Date(e.date).toISOString().split("T")[0]
          return d !== new Date().toISOString().split("T")[0]
        })
        return [data, ...filtered]
      })
      toast.success("Diário atualizado!")
    } catch {
      toast.error("Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })
  }

  const getMoodIcon = (v: number) => {
    const m = MOODS.find((m) => m.value === v)
    if (!m) return null
    const Icon = m.icon
    return <Icon className={`h-5 w-5 ${m.color}`} />
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 ring-1 ring-primary/20 mb-4">
          <BookHeart className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Diário de Emoções</h1>
        <p className="text-foreground text-sm mt-1">Registre como está se sentindo hoje</p>
      </div>

      <div className="bg-card rounded-2xl p-6 ring-1 ring-border mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-5">
          {todayEntry ? "Seu registro de hoje" : "Como você está se sentindo hoje?"}
        </h2>

        <div className="flex justify-center gap-3 mb-6">
          {MOODS.map(({ value, icon: Icon, label, color, bg, ring }) => (
            <button key={value} onClick={() => setMood(value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                mood === value ? `${bg} ${ring} ring-1` : "bg-muted ring-1 ring-border hover:bg-accent"
              }`}
            >
              <Icon className={`h-7 w-7 ${mood === value ? color : "text-muted-foreground"}`} />
              <span className={`text-[10px] ${mood === value ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
            </button>
          ))}
        </div>

        <div className="mb-5">
          <p className="text-xs text-muted-foreground font-medium mb-2">Emoções</p>
          <div className="flex flex-wrap gap-1.5">
            {EMOTIONS.map((e) => (
              <button key={e} onClick={() => setSelectedEmotions(toggleArray(selectedEmotions, e))}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                  selectedEmotions.includes(e)
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "bg-muted text-foreground ring-1 ring-border hover:bg-accent"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs text-muted-foreground font-medium mb-2">Atividades</p>
          <div className="flex flex-wrap gap-1.5">
            {ACTIVITIES.map((a) => (
              <button key={a} onClick={() => setSelectedActivities(toggleArray(selectedActivities, a))}
                className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                  selectedActivities.includes(a)
                    ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                    : "bg-muted text-foreground ring-1 ring-border hover:bg-accent"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs text-muted-foreground font-medium mb-2">Anotações</p>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Como foi seu dia? Algum pensamento que gostaria de registrar?"
            className="w-full bg-muted rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground ring-1 ring-border resize-none h-24 focus:outline-none focus:ring-primary/30 transition-all"
          />
        </div>

        <Button onClick={handleSave} disabled={saving || mood === 0}
          className="w-full h-12 font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-xl shadow-emerald-500/25"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Sparkles className="h-5 w-5 mr-2" />}
          {saving ? "Salvando..." : todayEntry ? "Atualizar" : "Salvar"}
        </Button>
      </div>

      {entries.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Histórico</h2>
          <div className="space-y-2">
            {entries.map((e) => {
              const emotions = e.emotions ? JSON.parse(e.emotions) : []
              const activities = e.activities ? JSON.parse(e.activities) : []
              return (
                <div key={e.id} className="bg-card rounded-xl p-4 ring-1 ring-border">
                  <div className="flex items-center gap-3 mb-2">
                    {getMoodIcon(e.mood)}
                    <span className="text-sm text-foreground">{formatDate(e.date)}</span>
                  </div>
                  {emotions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {emotions.map((em: string) => (
                        <span key={em} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{em}</span>
                      ))}
                    </div>
                  )}
                  {activities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {activities.map((a: string) => (
                        <span key={a} className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  )}
                  {e.notes && <p className="text-xs text-muted-foreground mt-1">{e.notes}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum registro ainda.<br />Comece registrando como você se sente hoje!</p>
        </div>
      )}
    </div>
  )
}
