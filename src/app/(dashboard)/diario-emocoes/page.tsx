"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate } from "@/lib/utils"
import { Smile, Meh, Frown, Sun, Cloud, CloudRain, Brain, Heart, Activity, Plus } from "lucide-react"
import toast from "react-hot-toast"

const moodIcons = [
  { value: 1, icon: Frown, label: "Muito Ruim", color: "text-red-500 bg-red-50 dark:bg-red-950/20" },
  { value: 2, icon: CloudRain, label: "Ruim", color: "text-orange-500 bg-orange-50 dark:bg-orange-950/20" },
  { value: 3, icon: Cloud, label: "Neutro", color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20" },
  { value: 4, icon: Sun, label: "Bom", color: "text-lime-500 bg-lime-50 dark:bg-lime-950/20" },
  { value: 5, icon: Smile, label: "Muito Bom", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" },
]

const emotions = [
  "Ansiedade", "Tristeza", "Alegria", "Raiva", "Medo", "Calma",
  "Esperança", "Gratidão", "Solidão", "Confiança", "Vergonha", "Culpa",
]

interface DiaryEntry {
  id: string
  patientName: string
  date: string
  mood: number
  emotions: string
  notes: string | null
}

export default function EmotionDiaryPage() {
  const [selectedPatient, setSelectedPatient] = useState("")
  const [mood, setMood] = useState(3)
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [notes, setNotes] = useState("")
  const [sleepHours, setSleepHours] = useState("7")
  const [anxietyLevel, setAnxietyLevel] = useState(3)
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/diario").then(r => r.ok ? r.json() : []),
      fetch("/api/pacientes").then(r => r.ok ? r.json() : { patients: [] }),
    ])
      .then(([entries, patientData]) => {
        const mapped = (entries || []).map((e: { id: string; patient: { name: string }; date: string; mood: number; emotions: string | null; notes: string | null }) => ({
          id: e.id,
          patientName: e.patient?.name || "Paciente",
          date: e.date,
          mood: e.mood,
          emotions: e.emotions || "",
          notes: e.notes,
        }))
        setDiaryEntries(mapped)
        setPatients((patientData.patients || []).map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })))
      })
      .catch(() => { setDiaryEntries([]); setPatients([]) })
      .finally(() => setLoading(false))
  }, [])

  function toggleEmotion(emotion: string) {
    setSelectedEmotions(prev =>
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedPatient) { toast.error("Selecione um paciente"); return }
    try {
      const res = await fetch("/api/diario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: selectedPatient, mood, emotions: selectedEmotions.join(", "), notes, sleepHours: parseFloat(sleepHours), anxietyLevel }),
      })
      if (!res.ok) throw new Error()
      toast.success("Registro salvo com sucesso!")
      setSelectedEmotions([])
      setNotes("")
      const entriesRes = await fetch("/api/diario")
      if (entriesRes.ok) {
        const entries = await entriesRes.json()
        setDiaryEntries((entries || []).map((e: { id: string; patient: { name: string }; date: string; mood: number; emotions: string | null; notes: string | null }) => ({
          id: e.id,
          patientName: e.patient?.name || "Paciente",
          date: e.date,
          mood: e.mood,
          emotions: e.emotions || "",
          notes: e.notes,
        })))
      }
    } catch {
      toast.error("Erro ao salvar registro")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-shimmer rounded-lg" />
            <div className="h-4 w-56 animate-shimmer rounded-lg" />
          </div>
          <div className="h-9 w-32 animate-shimmer rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 animate-shimmer rounded-lg" />
          <div className="h-9 w-28 animate-shimmer rounded-lg" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl animate-shimmer" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-28 animate-shimmer rounded" />
                  <div className="h-3 w-20 animate-shimmer rounded" />
                </div>
              </div>
              <div className="flex gap-1.5">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-6 w-14 animate-shimmer rounded-full" />
                ))}
              </div>
              <div className="h-12 w-full animate-shimmer rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Diário de Emoções</h2>
          <p className="text-muted-foreground">
            Acompanhe o estado emocional dos seus pacientes
          </p>
        </div>
      </div>

      <Tabs defaultValue="register">
        <TabsList>
          <TabsTrigger value="register">
            <Plus className="mr-2 h-4 w-4" />
            Novo Registro
          </TabsTrigger>
          <TabsTrigger value="history">
            <Heart className="mr-2 h-4 w-4" />
            Histórico
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Activity className="mr-2 h-4 w-4" />
            Análises
          </TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Registrar Emoções</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Paciente</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                      <SelectContent>
                        {patients.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Humor</Label>
                    <div className="flex gap-2">
                      {moodIcons.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => setMood(item.value)}
                          className={`flex flex-1 flex-col items-center gap-1 rounded-lg p-3 transition-all ${
                            mood === item.value
                              ? `${item.color} ring-2 ring-primary scale-105`
                              : "hover:bg-accent"
                          }`}
                        >
                          <item.icon className="h-8 w-8" />
                          <span className="text-xs">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Emoções</Label>
                    <div className="flex flex-wrap gap-2">
                      {emotions.map((emotion) => (
                        <button
                          key={emotion}
                          type="button"
                          onClick={() => toggleEmotion(emotion)}
                          className={`rounded-full px-3 py-1.5 text-sm transition-all ${
                            selectedEmotions.includes(emotion)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-accent"
                          }`}
                        >
                          {emotion}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Horas de Sono</Label>
                      <Input
                        type="number"
                        step="0.5"
                        value={sleepHours}
                        onChange={(e) => setSleepHours(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nível de Ansiedade (1-10)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={anxietyLevel}
                        onChange={(e) => setAnxietyLevel(parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Anotações</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={4}
                      placeholder="Como foi o dia do paciente? Algum evento relevante?"
                    />
                  </div>

                  <Button type="submit" className="w-full">Salvar Registro</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Escala de Humor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodIcons.map((item) => (
                    <div key={item.value} className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${item.color.split(" ")[0]}`} />
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.label}</span>
                          <span className="text-muted-foreground">{item.value}/5</span>
                        </div>
                        <div className="mt-1 h-2 rounded-full bg-muted">
                          <div
                            className={`h-full rounded-full ${
                              item.value <= 2 ? "bg-red-500" : item.value === 3 ? "bg-yellow-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${(item.value / 5) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                {diaryEntries.map((entry) => {
                  const moodConfig = moodIcons.find(m => m.value === entry.mood)
                  const MoodIcon = moodConfig?.icon || Meh
                  return (
                    <div key={entry.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{entry.patientName}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(entry.date)}</p>
                        </div>
                        <MoodIcon className={`h-8 w-8 ${moodConfig?.color.split(" ")[0] || ""}`} />
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {(typeof entry.emotions === "string" ? entry.emotions.split(", ").filter(Boolean) : entry.emotions || []).map((emotion: string) => (
                          <span key={emotion} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                            {emotion}
                          </span>
                        ))}
                      </div>
                      {entry.notes && <p className="text-sm text-muted-foreground">{entry.notes}</p>}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Activity className="mx-auto h-8 w-8 mb-2" />
              <p>Gráficos e análises de evolução emocional em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
