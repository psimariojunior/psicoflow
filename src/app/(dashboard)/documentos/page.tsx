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
  FileType2,
  Trash2,
  Pencil,
  FileText,
  Send,
  ClipboardList,
  FileQuestion,
  Printer,
  Copy,
  Sparkles,
  Loader2,
  Search,
  Files,
  Layers,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Wand2,
} from "lucide-react"
import toast from "react-hot-toast"
import { formatDate, cn } from "@/lib/utils"

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

type CategoryKey = "declaracao" | "encaminhamento" | "relatorio" | "geral"

const CATEGORY_CONFIG: Record<string, {
  label: string
  icon: typeof FileText
  gradient: string
  badgeCls: string
  ring: string
}> = {
  declaracao: {
    label: "Declaração",
    icon: FileText,
    gradient: "from-blue-500 to-indigo-600",
    badgeCls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200",
    ring: "ring-blue-200/60 dark:ring-blue-800/40",
  },
  encaminhamento: {
    label: "Encaminhamento",
    icon: Send,
    gradient: "from-violet-500 to-purple-600",
    badgeCls: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200",
    ring: "ring-violet-200/60 dark:ring-violet-800/40",
  },
  relatorio: {
    label: "Relatório",
    icon: ClipboardList,
    gradient: "from-amber-500 to-orange-600",
    badgeCls: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
    ring: "ring-amber-200/60 dark:ring-amber-800/40",
  },
  geral: {
    label: "Geral",
    icon: FileQuestion,
    gradient: "from-slate-500 to-slate-700",
    badgeCls: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200",
    ring: "ring-slate-200/60 dark:ring-slate-800/40",
  },
}

function categoryConfig(cat: string) {
  return CATEGORY_CONFIG[cat as CategoryKey] ?? CATEGORY_CONFIG.geral
}

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
  <div class="doc-footer">Documento gerado por PsiHumanis • ${formatDate(new Date())}</div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); }<\/script>
  </body></html>`)
  win.document.close()
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.success("Documento copiado para a área de transferência")
  } catch {
    toast.error("Não foi possível copiar o documento")
  }
}

export default function DocumentosPage() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [crp, setCrp] = useState("")
  const [placeholdersOpen, setPlaceholdersOpen] = useState(false)

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

  const categoriesCount = useMemo(
    () => new Set(templates.map((t) => t.category)).size,
    [templates]
  )

  const lastUpdate = useMemo(() => {
    if (!templates.length) return null
    return templates.reduce((acc, t) => {
      const ts = new Date(t.updatedAt || t.createdAt).getTime()
      return ts > acc ? ts : acc
    }, 0)
  }, [templates])

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

  const stats = [
    {
      label: "Modelos",
      value: templates.length,
      icon: Files,
      color: "from-blue-500 to-indigo-600",
    },
    {
      label: "Categorias",
      value: categoriesCount,
      icon: Layers,
      color: "from-violet-500 to-purple-600",
    },
    {
      label: "Última atualização",
      value: lastUpdate ? formatDate(new Date(lastUpdate)) : "—",
      icon: CalendarClock,
      color: "from-amber-500 to-orange-600",
      isText: true,
    },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-900 p-8 sm:p-10 text-white shadow-xl shadow-violet-500/10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur-sm">
                <FileType2 className="h-7 w-7" />
              </div>
              <Badge variant="info" className="bg-white/20 text-white border-none text-xs">
                Modelos profissionais
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              Documentos
            </h1>
            <p className="text-violet-100 text-base sm:text-lg max-w-2xl">
              Modelos profissionais com preenchimento automático por paciente — declarações,
              encaminhamentos e relatórios prontos para impressão.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {templates.length === 0 && (
              <Button
                variant="secondary"
                onClick={loadDefaults}
                disabled={saving}
                className="bg-white/15 text-white border border-white/20 hover:bg-white/25 backdrop-blur-sm"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Carregar modelos padrão
              </Button>
            )}
            <Button
              onClick={openCreate}
              className="bg-white text-violet-700 hover:bg-violet-50 shadow-lg shadow-violet-900/20"
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Modelo
            </Button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="overflow-hidden border-0 shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shrink-0 text-white shadow-md",
                  s.color
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    {s.label}
                  </p>
                  <p className={cn("font-semibold text-foreground truncate", s.isText ? "text-base" : "text-2xl")}>
                    {s.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search + collapsible placeholders */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar modelo por nome ou categoria..."
            className="pl-9"
          />
        </div>
        <button
          onClick={() => setPlaceholdersOpen((v) => !v)}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors self-start"
          aria-expanded={placeholdersOpen}
        >
          <FileType2 className="h-4 w-4" />
          Placeholders disponíveis
          {placeholdersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {placeholdersOpen && (
        <Card className="border-dashed border-violet-200/60 dark:border-violet-800/40 bg-violet-50/40 dark:bg-violet-950/10">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3">
              Use estes marcadores no conteúdo do documento. Eles serão substituídos
              automaticamente pelos dados do paciente selecionado na geração.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PLACEHOLDERS.map((p) => (
                <Badge
                  key={p}
                  variant="secondary"
                  className="font-mono text-[11px] bg-white dark:bg-slate-800 border border-violet-100 dark:border-violet-900/40"
                >
                  {p}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Templates grid OR empty state */}
      {filtered.length === 0 ? (
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 blur-2xl rounded-full" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-xl shadow-violet-500/30">
                <FileText className="h-10 w-10" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Comece criando seu primeiro modelo
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-8">
              Você pode carregar um conjunto de modelos padrão prontos para uso ou
              criar um documento totalmente personalizado do zero.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Button
                onClick={loadDefaults}
                disabled={saving}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-500/25"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Carregar modelos padrão
              </Button>
              <Button variant="outline" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Criar do zero
              </Button>
            </div>

            <div className="w-full max-w-2xl">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">
                Os modelos padrão incluem
              </p>
              <div className="grid gap-3 sm:grid-cols-3 text-left">
                {DEFAULT_TEMPLATES.map((t) => {
                  const cfg = categoryConfig(t.category)
                  const Icon = cfg.icon
                  return (
                    <div
                      key={t.name}
                      className="rounded-xl border border-border/60 bg-muted/30 p-3"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                          cfg.gradient
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <Badge variant="secondary" className={cn("text-[10px]", cfg.badgeCls)}>
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-foreground leading-tight">{t.name}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const cfg = categoryConfig(t.category)
            const Icon = cfg.icon
            return (
              <Card
                key={t.id}
                className={cn(
                  "group flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/5 border-border/60 ring-1 ring-transparent hover:ring-violet-200/50",
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br shrink-0 text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300",
                      cfg.gradient
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base leading-snug line-clamp-2">{t.name}</CardTitle>
                      <Badge variant="secondary" className={cn("mt-1.5 text-[10px]", cfg.badgeCls)}>
                        {cfg.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="relative flex-1 mb-4">
                    <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-line leading-relaxed">
                      {t.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/20"
                      onClick={() => openGenerate(t)}
                    >
                      <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                      Gerar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openEdit(t)} aria-label="Editar modelo">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                      onClick={() => removeTemplate(t)}
                      aria-label="Remover modelo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger id="tpl-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="declaracao">Declaração</SelectItem>
                    <SelectItem value="encaminhamento">Encaminhamento</SelectItem>
                    <SelectItem value="relatorio">Relatório</SelectItem>
                    <SelectItem value="geral">Geral</SelectItem>
                  </SelectContent>
                </Select>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-violet-600" />
              Gerar Documento
            </DialogTitle>
            <DialogDescription>
              {generateTemplate?.name} — selecione um paciente para preenchimento automático.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-0 overflow-hidden">
            {/* Left column — options */}
            <div className="p-6 space-y-5 overflow-y-auto max-h-[60vh] lg:max-h-[65vh] border-b lg:border-b-0 lg:border-r">
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
                <p className="text-[11px] text-muted-foreground">
                  Sem paciente selecionado, os placeholders permanecem visíveis para conferência.
                </p>
              </div>

              {generateTemplate && (
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3 space-y-1.5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                    Modelo
                  </p>
                  <p className="text-sm font-medium text-foreground">{generateTemplate.name}</p>
                  <Badge variant="secondary" className={cn("text-[10px]", categoryConfig(generateTemplate.category).badgeCls)}>
                    {categoryConfig(generateTemplate.category).label}
                  </Badge>
                </div>
              )}
            </div>

            {/* Right column — preview */}
            <div className="bg-muted/30 p-6 overflow-y-auto max-h-[60vh] lg:max-h-[65vh]">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Pré-visualização
                </Label>
                <span className="text-[11px] text-muted-foreground">Documento real</span>
              </div>
              <div className="bg-white shadow-lg shadow-slate-300/40 rounded-sm mx-auto max-w-[520px] px-10 py-12 min-h-[420px]">
                <div className="text-center mb-6 pb-4 border-b-2 border-slate-200">
                  <p className="font-serif text-base font-bold uppercase tracking-widest text-slate-800">
                    {generateTemplate?.name}
                  </p>
                </div>
                <pre className="whitespace-pre-wrap font-serif text-[13px] leading-relaxed text-slate-700">
                  {preview}
                </pre>
                <div className="mt-10 pt-3 border-t border-slate-200 text-center">
                  <p className="font-serif text-[10px] text-slate-400">
                    Gerado por PsiHumanis • {formatDate(new Date())}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-background">
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>Fechar</Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(preview)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
            <Button
              onClick={() => generateTemplate && printDocument(generateTemplate.name, preview)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-violet-500/20"
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