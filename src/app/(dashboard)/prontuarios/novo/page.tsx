"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, Loader2, FileText, AlertTriangle } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

interface PatientOption {
  id: string
  name: string
}

export default function NewRecordPage({ searchParams }: { searchParams?: { paciente?: string } }) {
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<PatientOption[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [formData, setFormData] = useState({
    patientId: searchParams?.paciente || "",
    type: "SESSION_NOTE",
    title: "",
    content: "",
    isConfidential: false,
  })

  useEffect(() => {
    fetch("/api/pacientes?limit=100")
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then((data) => setPatients(data.patients || []))
      .catch(() => toast.error("Erro ao carregar pacientes"))
      .finally(() => setLoadingPatients(false))
  }, [])

  function handleChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error("Erro ao salvar")
      toast.success("Prontuário salvo com sucesso!")
    } catch {
      toast.error("Erro ao salvar prontuário")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/prontuarios">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Novo Prontuário</h2>
          <p className="text-muted-foreground">Registre uma nova nota clínica</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Prontuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select value={formData.patientId} onValueChange={(v) => handleChange("patientId", v)}>
                  <SelectTrigger><SelectValue placeholder={loadingPatients ? "Carregando..." : "Selecione um paciente"} /></SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formData.type} onValueChange={(v) => handleChange("type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SESSION_NOTE">Nota de Sessão</SelectItem>
                    <SelectItem value="ANAMNESIS">Anamnese</SelectItem>
                    <SelectItem value="EVOLUTION">Evolução</SelectItem>
                    <SelectItem value="DISCHARGE_SUMMARY">Resumo de Alta</SelectItem>
                    <SelectItem value="REPORT">Relatório</SelectItem>
                    <SelectItem value="THERAPEUTIC_PLAN">Plano Terapêutico</SelectItem>
                    <SelectItem value="CONTRACT">Contrato</SelectItem>
                    <SelectItem value="OTHER">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} required placeholder="Título do prontuário" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange("content", e.target.value)}
                required
                rows={12}
                placeholder="Descreva o registro clínico aqui..."
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-4">
              <Switch
                checked={formData.isConfidential}
                onCheckedChange={(v) => handleChange("isConfidential", v)}
              />
              <div>
                <p className="text-sm font-medium">Prontuário Confidencial</p>
                <p className="text-xs text-muted-foreground">
                  Apenas você terá acesso a este prontuário
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                  <p className="font-semibold">Responsabilidade Profissional (CFP)</p>
                  <p>
                    Este prontuário é de sua inteira responsabilidade, conforme o Código de Ética
                    Profissional do Psicólogo (Resolução CFP nº 010/2005). Mantenha registros
                    objetivos, baseados em observação clínica, sem juízos de valor. Prontuários
                    devem ser armazenados por no mínimo 5 anos (Resolução CFP nº 06/2019).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" asChild>
                <Link href="/prontuarios">Cancelar</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Salvar Prontuário</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
