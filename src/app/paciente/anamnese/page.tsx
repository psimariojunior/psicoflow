"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { Loader2, Save, CheckCircle2, Brain, Heart, Pill, Users, Leaf, Target, AlertCircle, Lock, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"

interface Anamnese {
  complaints?: string
  history?: string
  medications?: string
  allergies?: string
  familyHistory?: string
  lifestyle?: string
  expectations?: string
  previousTherapy?: string
  completed: boolean
  updatedAt: string
  [key: string]: string | boolean | undefined
}

const sections = [
  { key: "complaints", label: "Queixa Principal", placeholder: "O que o trouxe aqui hoje? Descreva seus principais sintomas ou preocupações...", icon: AlertCircle },
  { key: "history", label: "Histórico da Doença Atual", placeholder: "Quando começou? Como evoluiu? O que melhora ou piora?...", icon: Brain },
  { key: "medications", label: "Medicações em Uso", placeholder: "Liste todos os medicamentos, doses e frequência...", icon: Pill },
  { key: "allergies", label: "Alergias", placeholder: "Medicamentos, alimentos, látex, etc. Se nenhuma, escreva 'Nenhuma conhecida'...", icon: Heart },
  { key: "familyHistory", label: "Histórico Familiar", placeholder: "Histórico de doenças psiquiátricas, neurológicas ou outras na família...", icon: Users },
  { key: "lifestyle", label: "Estilo de Vida", placeholder: "Sono, exercícios, alimentação, álcool, tabaco, drogas, rotina diária...", icon: Leaf },
  { key: "expectations", label: "Expectativas com a Terapia", placeholder: "O que espera alcançar? Quais são seus objetivos?...", icon: Target },
  { key: "previousTherapy", label: "Terapia Anterior", placeholder: "Já fez terapia antes? Como foi a experiência? Por que parou?...", icon: Brain },
]

export default function AnamnesePage() {
  const router = useRouter()
  const [anamnese, setAnamnese] = useState<Anamnese>({
    complaints: "", history: "", medications: "", allergies: "",
    familyHistory: "", lifestyle: "", expectations: "", previousTherapy: "",
    completed: false, updatedAt: ""
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { token, loading: authLoading } = usePatientAuth()

  useEffect(() => {
    async function fetchAnamnese() {
      if (authLoading || !token) { setLoading(false); return }
      try {
        const res = await fetch("/api/pacientes/anamnese", { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) {
          const data = await res.json()
          if (data) setAnamnese(data)
        }
      } catch (error) {
        console.error("Erro:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnamnese()
  }, [token, authLoading])

  const handleChange = (key: string, value: string) => {
    setAnamnese(prev => ({ ...prev, [key]: value, completed: true }))
  }

  const handleSave = async () => {
    if (!token) { toast.error("Faça login para salvar"); return }
    setSaving(true)
    try {
      const res = await fetch("/api/pacientes/anamnese", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(anamnese),
      })
      if (res.ok) {
        const data = await res.json()
        setAnamnese(prev => ({ ...prev, ...data, updatedAt: data.updatedAt }))
        toast.success("Anamnese salva com sucesso!")
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } else {
        toast.error("Erro ao salvar")
      }
    } catch (error) {
      toast.error("Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 w-1/4 bg-muted rounded mb-2" />
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!token) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <Lock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground">Faça login para preencher sua anamnese.</p>
        <Button asChild className="mt-4"><Link href="/paciente/login">Entrar</Link></Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
            Anamnese Digital
          </h1>
          <p className="text-muted-foreground mt-1">
            Preencha suas informações para que seu psicólogo tenha um histórico completo antes da primeira sessão.
          </p>
        </div>
        {anamnese.completed && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            Concluída em {new Date(anamnese.updatedAt).toLocaleDateString("pt-BR")}
          </span>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Informações Clínicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {sections.map(({ key, label, placeholder, icon: Icon }) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-teal-600" />
                {label}
              </Label>
              <Textarea
                id={key}
                value={typeof anamnese[key] === "string" ? anamnese[key] as string : ""}
                onChange={e => handleChange(key, e.target.value)}
                placeholder={placeholder}
                rows={4}
                className="resize-none"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-teal-200 bg-teal-50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none"
              size="lg"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Anamnese
                </>
              )}
            </Button>
            {anamnese.completed && (
              <Button variant="outline" size="lg">
                <Brain className="mr-2 h-4 w-4" />
                Ver Prévia para Psicólogo
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            Estas informações são confidenciais e acessíveis apenas ao seu psicólogo responsável.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}