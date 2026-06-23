"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  FileType,
  Trash2,
  Pencil,
  FileText,
  Printer,
  Sparkles,
  Loader2,
  Search,
  AlertCircle,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface DocumentTemplate {
  id: string
  name: string
  category: string
  content: string
  createdAt: string
  updatedAt: string
}

interface Patient {
  id: string
  name: string
  email: string | null
  phone: string | null
  cpf: string | null
  rg: string | null
  dateOfBirth: string | null
  profession: string | null
  address: string | null
  city: string | null
  state: string | null
}

const PLACEHOLDERS = [
  "{nome}", "{cpf}", "{rg}", "{crp}", "{data}", "{data_nascimento}",
  "{profissao}", "{endereco}", "{cidade}", "{estado}", "{email}",
  "{telefone}", "{data_extenso}",
]

const DEFAULT_TEMPLATES: Omit<DocumentTemplate, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Declaração de Comparecimento",
    category: "declaracao",
    content: `DECLARAÇÃO DE COMPARECIMENTO

Eu, {nome}, CPF nº {cpf}, declaro para os devidos fins que compareci a sessão de psicoterapia no dia {data}, sob atendimento psicológico.

A sessão foi realizada com o(a) psicólogo(a) responsável, CRP {crp}.

Para maiores informações, entro em contato através dos canais oficiais.

Data: {data}

___________________________________
Assinatura do Psicólogo`,
  },
  {
    name: "Encaminhamento Médico",
    category: "encaminhamento",
    content: `ENCAMINHAMENTO MÉDICO

À atenção do(a) médico(a) responsável,

Encaminho o(a) paciente {nome}, CPF nº {cpf}, para avaliação médica especializada, com vistas a complementar o acompanhamento psicológico em curso.

Justificativa: necessidade de avaliação clínica e eventual tratamento medicamentoso compatível com o quadro psicológico observado.

Dados do paciente:
- Nome: {nome}
- Data de nascimento: {data_nascimento}
- Profissão: {profissao}

Permaneço à disposição para eventuais esclarecimentos.

CRP: {crp}
Data: {data}

___________________________________
Assinatura do Psicólogo`,
  },
  {
    name: "Relatório Psicológico",
    category: "relatorio",
    content: `RELATÓRIO PSICOLÓGICO

1. IDENTIFICAÇÃO
- Nome: {nome}
- CPF: {cpf}
- Data de nascimento: {data_nascimento}
- Profissão: {profissao}
- Endereço: {endereco} - {cidade}/{estado}

2. DEMANDA
O(a) paciente {nome} iniciou acompanhamento psicológico buscando suporte emocional e desenvolvimento pessoal.

3. PROCESSO TERAPÊUTICO
O atendimento vem sendo conduzido em sessões regulares, com abordagem voltada à escuta acolhedora e à elaboração das questões apresentadas.

4. OBSERVAÇÕES
O presente relatório é emitido para os fins que se fizerem necessários, observado o sigilo profissional previsto no Código de Ética Profissional do Psicólogo.

5. CONCLUSÃO
Permanece em acompanhamento psicológico, evoluindo conforme plano terapêutico estabelecido.

Data de emissão: {data}

___________________________________
Psicólogo Responsável - CRP {crp}`,
  },
]

function fillPlaceholders(content: string, patient: Patient, crp: string): string {
  const today = new Date()
  const dataExtenso = today.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const map: Record<string, string> = {
    "{nome}": patient.name || "",
    "{cpf}": patient.cpf || "",
    "{rg}": patient.rg || "",
    "{crp}": crp || "",
    "{data}": formatDate(today),
    "{data_nascimento}": patient.dateOfBirth ? formatDate(patient.dateOfBirth) : "",
    "{profissao}": patient.profession || "",
    "{endereco}": patient.address || "",
    "{cidade}": patient.city || "",
    "{estado}": patient.state || "",
    "{email}": patient.email || "",
    "{telefone}": patient.phone || "",
    "{data_extenso}": dataExtenso,
  }
  return content.replace(/\{[^}]+\}/g, (match) => map[match] ?? match)
}

function printDocument(title: string, content: string) {
  const win = window.open("", "_blank", "width=800,height=900")
  if (!win) {
    toast.error("Habilite popups para imprimir o documento")
    return
  }
  win.document.write(`<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>${title}</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: Georgia, 'Times New Roman', serif; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 56px; line-height: 1.7; }
    h1, h2, h3 { color: #0f172a; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.8; }
    .doc-header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid #cbd5e1; padding-bottom: 16px; }
    .doc-title { font-size: 20px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; margin: 0; }
    .doc-footer { margin-top: 64px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
    @media print { body { padding: 24px; } @page { margin: 24mm; } }
  </style></head><body>
  <div class="doc-header"><p class="doc-title">${title}</p></div>
  <pre>${content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
  <div class="doc-footer">Documento gerado por PsicoFlow • ${formatDate(new Date())}</div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); }<\/script>
  </body></html>`)
  win.document.close()
}

export default function DocumentosPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [crp, setCrp] = useState("")

  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<DocumentTemplate | null>(null)
  const [form, setForm] = useState({ name: "", category: "geral", content: "" })
  const [saving, setSaving] = useState(false)

  const [generateOpen, setGenerateOpen] = useState(false)
  const [generateTemplate, setGenerateTemplate] = useState<DocumentTemplate | null>(null)
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [preview, setPreview] = useState("")

  const filtered = useMemo(
    () => templates.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    ),
    [templates, search]
  )

  useEffect(() => {
    Promise.all([
      fetch("/api/documentos").then((r) => r.json()),
      fetch("/api/pacientes?limit=100").then((r) => r.json()),
      fetch("/api/configuracoes").then((r) => r.json()),
    ])
      .then(([tpls, pats, cfg]) => {
        setTemplates(tpls.templates || [])
        setPatients(pats.patients || [])
        setCrp(cfg?.crp || "")
      })
      .catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setLoading(false))
  }, [])

  function openCreate() {
    setEditing(null)
    setForm({ name: "", category: "geral", content: "" })
    setEditorOpen(true)
  }

  function openEdit(t: DocumentTemplate) {
    setEditing(t)
    setForm({ name: t.name, category: t.category, content: t.content })
    setEditorOpen(true)
  }

  async function saveTemplate() {
    if (!form.name.trim() || !form.content.trim()) {
      toast.error("Nome e conteúdo são obrigatórios")
      return
    }
    setSaving(true)
    try {
      const res = await fetch(
        editing ? `/api/documentos/${editing.id}` : "/api/documentos",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      )
      if (!res.ok) throw new Error()
      const saved = await res.json()
      if (editing) {
        setTemplates((prev) => prev.map((t) => (t.id === saved.id ? saved : t)))
        toast.success("Modelo atualizado")
      } else {
        setTemplates((prev) => [saved, ...prev])
        toast.success("Modelo criado")
      }
      setEditorOpen(false)
    } catch {
      toast.error("Erro ao salvar modelo")
    } finally {
      setSaving(false)
    }
  }

  async function removeTemplate(t: DocumentTemplate) {
    if (!confirm(`Remover o modelo "${t.name}"?`)) return
    try {
      const res = await fetch(`/api/documentos/${t.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      setTemplates((prev) => prev.filter((x) => x.id !== t.id))
      toast.success("Modelo removido")
    } catch {
      toast.error("Erro ao remover modelo")
    }
  }

  async function loadDefaults() {
    setSaving(true)
    try {
      await Promise.all(
        DEFAULT_TEMPLATES.map((t) =>
          fetch("/api/documentos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(t),
          }).then((r) => r.json())
        )
      )
      const res = await fetch("/api/documentos")
      const data = await res.json()
      setTemplates(data.templates || [])
      toast.success("Modelos padrão carregados")
    } catch {
      toast.error("Erro ao carregar modelos padrão")
    } finally {
      setSaving(false)
    }
  }

  function openGenerate(t: DocumentTemplate) {
    setGenerateTemplate(t)
    setSelectedPatientId("")
    setPreview(t.content)
    setGenerateOpen(true)
  }

  useEffect(() => {
    if (!generateTemplate) return
    const patient = patients.find((p) => p.id === selectedPatientId)
    if (patient) {
      setPreview(fillPlaceholders(generateTemplate.content, patient, crp))
    } else {
      setPreview(generateTemplate.content)
    }
  }, [selectedPatientId, generateTemplate, patients, crp])

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documentos</h2>
          <p className="text-muted-foreground text-sm mt-0.5">
            Modelos profissionais com preenchimento automático por paciente
          </p>
        </div>
        <div className="flex items-center gap-2">
          {templates.length === 0 && (
            <Button variant="outline" onClick={loadDefaults} disabled={saving}>
              <Sparkles className="mr-2 h-4 w-4" />
              Carregar modelos padrão
            </Button>
          )}
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Modelo
          </Button>
        </div>
      </div>

      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileType className="h-4 w-4" />
            <span>Placeholders disponíveis:</span>
            <div className="flex flex-wrap gap-1.5">
              {PLACEHOLDERS.map((p) => (
                <Badge key={p} variant="secondary" className="font-mono text-[11px]">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar modelo..."
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {templates.length === 0
                ? "Nenhum modelo cadastrado. Crie um novo ou carregue os modelos padrão."
                : "Nenhum modelo encontrado para a busca."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Card key={t.id} className="group flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{t.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1 text-[10px]">{t.category}</Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <p className="text-xs text-muted-foreground line-clamp-4 whitespace-pre-line flex-1">
                  {t.content}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <Button size="sm" className="flex-1" onClick={() => openGenerate(t)}>
                    <Printer className="mr-1.5 h-3.5 w-3.5" />
                    Gerar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(t)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => removeTemplate(t)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Modelo" : "Novo Modelo de Documento"}</DialogTitle>
            <DialogDescription>
              Use placeholders entre chaves (ex: {"{nome}"}) para preenchimento automático.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tpl-name">Nome</Label>
                <Input
                  id="tpl-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Ex.: Declaração de Comparecimento"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tpl-category">Categoria</Label>
                <Input
                  id="tpl-category"
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="geral"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tpl-content">Conteúdo</Label>
              <Textarea
                id="tpl-content"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Escreva o conteúdo do documento usando {nome}, {cpf}, {data}..."
                rows={14}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancelar</Button>
            <Button onClick={saveTemplate} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Salvar" : "Criar Modelo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerar Documento</DialogTitle>
            <DialogDescription>
              {generateTemplate?.name} — selecione um paciente para preenchimento automático.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Paciente</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger><SelectValue placeholder="Selecione um paciente (opcional)" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pré-visualização</Label>
              <div className="rounded-lg border bg-muted/30 p-6 max-h-[50vh] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-foreground">
                  {preview}
                </pre>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>Fechar</Button>
            <Button
              onClick={() => generateTemplate && printDocument(generateTemplate.name, preview)}
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir / PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
