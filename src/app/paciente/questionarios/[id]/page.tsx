"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Save, CheckCircle2, Brain } from "lucide-react"

interface Question {
  id: string
  questionText: string
  questionOrder: number
  options: string
  category?: string
}

interface Questionnaire {
  id: string
  title: string
  description?: string
  type: string
  questions: Question[]
}

export default function QuestionnaireDetail() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ totalScore: number; severity: string } | null>(null)

  useEffect(() => {
    const tk = localStorage.getItem("patient_token")
    if (!tk) { router.push("/paciente/login"); return }
    fetch(`/api/pacientes/questionarios/${id}`, { headers: { Authorization: `Bearer ${tk}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setQuestionnaire(d); else router.push("/paciente/questionarios") })
      .catch(() => router.push("/paciente/questionarios"))
      .finally(() => setLoading(false))
  }, [id, router])

  const handleSubmit = async () => {
    if (!questionnaire) return
    const allAnswered = questionnaire.questions.every(q => answers[q.id] !== undefined)
    if (!allAnswered) return
    setSubmitting(true)
    try {
      const tk = localStorage.getItem("patient_token")
      const ans = questionnaire.questions.map(q => ({ questionId: q.id, value: answers[q.id] || 0 }))
      const res = await fetch(`/api/pacientes/questionarios/${id}/responder`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tk}` },
        body: JSON.stringify({ answers: ans }),
      })
      if (res.ok) setResult(await res.json())
    } catch (e) { console.error(e) } finally { setSubmitting(false) }
  }

  if (loading) {
    return <div className="p-4"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
  }

  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Questionário Concluído</h1>
          <p className="text-lg mb-4">Pontuação: {result.totalScore} — {result.severity}</p>
        </div>
        <div className="flex gap-4">
          <Button asChild variant="outline"><Link href="/paciente/questionarios"><ArrowLeft className="mr-2 h-4 w-4" />Voltar</Link></Button>
          <Button asChild><Link href="/paciente/diario"><Brain className="mr-2 h-4 w-4" />Diário</Link></Button>
        </div>
      </div>
    )
  }

  if (!questionnaire) return null

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-5 w-5" />Voltar</Button>
      <h1 className="text-2xl font-bold">{questionnaire.title}</h1>
      <p className="text-muted-foreground">{questionnaire.description}</p>

      {questionnaire.questions.map(q => {
        const options = JSON.parse(q.options || "[]") as { value: number; label: string }[]
        return (
          <Card key={q.id}>
            <CardHeader>
              {q.category && <span className="text-xs font-medium text-emerald-600 mb-1">{q.category}</span>}
              <CardTitle className="text-base">{q.questionText}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={answers[q.id]?.toString() || ""}
                onValueChange={v => setAnswers(prev => ({ ...prev, [q.id]: parseInt(v) }))}
              >
                {options.map(opt => (
                  <div key={opt.value} className="flex items-center gap-3 py-2">
                    <RadioGroupItem value={opt.value.toString()} id={`q${q.id}-${opt.value}`} />
                    <Label htmlFor={`q${q.id}-${opt.value}`}>{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )
      })}

      <Button onClick={handleSubmit} disabled={submitting} className="w-full">
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        Finalizar Questionário
      </Button>
    </div>
  )
}