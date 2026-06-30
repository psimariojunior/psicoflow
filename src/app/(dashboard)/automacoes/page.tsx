"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import toast from "react-hot-toast"
import {
  Zap,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  Mail,
  MessageSquare,
  CheckCircle2,
  Bell,
  Calendar,
  UserPlus,
  AlertTriangle,
  Gift,
  Ban,
  BarChart3,
  ArrowRight,
  Power,
  PowerOff,
  Settings,
} from "lucide-react"

interface Automation {
  id: string
  name: string
  description: string | null
  triggerType: string
  actionType: string
  actionConfig: string
  enabled: boolean
  lastRunAt: string | null
  runCount: number
  createdAt: string
}

const TRIGGER_OPTIONS = [
  { value: "appointment_booked", label: "Consulta agendada", icon: Calendar, color: "text-teal-500" },
  { value: "appointment_cancelled", label: "Consulta cancelada", icon: Ban, color: "text-red-500" },
  { value: "session_completed", label: "Sessão concluída", icon: CheckCircle2, color: "text-green-500" },
  { value: "task_overdue", label: "Tarefa atrasada", icon: AlertTriangle, color: "text-amber-500" },
  { value: "new_patient", label: "Novo paciente", icon: UserPlus, color: "text-purple-500" },
  { value: "birthday", label: "Aniversário", icon: Gift, color: "text-pink-500" },
  { value: "no_show", label: "Paciente faltou", icon: Ban, color: "text-red-400" },
  { value: "weekly_summary", label: "Resumo semanal", icon: BarChart3, color: "text-indigo-500" },
]

const ACTION_OPTIONS = [
  { value: "send_email", label: "Enviar email", icon: Mail, color: "text-teal-500" },
  { value: "send_whatsapp", label: "Enviar WhatsApp", icon: MessageSquare, color: "text-green-500" },
  { value: "create_task", label: "Criar tarefa", icon: CheckCircle2, color: "text-purple-500" },
  { value: "notify_psychologist", label: "Notificar psicólogo", icon: Bell, color: "text-amber-500" },
  { value: "send_reminder", label: "Enviar lembrete", icon: Clock, color: "text-indigo-500" },
  { value: "update_status", label: "Atualizar status", icon: Settings, color: "text-gray-500" },
]

const TEMPLATE_AUTOMATIONS = [
  {
    name: "Lembrete 24h antes da consulta",
    description: "Envia email de lembrete 24h antes de cada consulta",
    triggerType: "appointment_booked",
    actionType: "send_reminder",
    actionConfig: { hoursBefore: 24, to: "patient", subject: "Lembrete de consulta", body: "Olá {{patient_name}},\n\nSua consulta é amanhã às {{appointment_time}}.\n\nAtenciosamente,\n{{psychologist_name}}" },
  },
  {
    name: "Notificar cancelamento",
    description: "Envia email quando paciente cancela",
    triggerType: "appointment_cancelled",
    actionType: "notify_psychologist",
    actionConfig: { message: "O paciente {{patient_name}} cancelou a consulta de {{appointment_date}} às {{appointment_time}}." },
  },
  {
    name: "Boas-vindas ao novo paciente",
    description: "Envia email de boas-vindas quando paciente se cadastra",
    triggerType: "new_patient",
    actionType: "send_email",
    actionConfig: { to: "patient", subject: "Bem-vindo(a)!", body: "Olá {{patient_name}},\n\nSeja bem-vindo(a)! Estou à disposição para ajudá-lo(a).\n\nAtenciosamente,\n{{psychologist_name}}" },
  },
  {
    name: "Feliz aniversário!",
    description: "Envia mensagem de parabéns no aniversário do paciente",
    triggerType: "birthday",
    actionType: "send_email",
    actionConfig: { to: "patient", subject: "Feliz aniversário!", body: "Olá {{patient_name}},\n\nFeliz aniversário! Desejo muito sucesso e saúde.\n\nAtenciosamente,\n{{psychologist_name}}" },
  },
  {
    name: "Tarefa automática pós-sessão",
    description: "Cria tarefa de reflexão após cada sessão",
    triggerType: "session_completed",
    actionType: "create_task",
    actionConfig: { taskTitle: "Reflexão pós-sessão: registrar insights" },
  },
]

export default function AutomacoesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [automations, setAutomations] = useState<Automation[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newTrigger, setNewTrigger] = useState("")
  const [newAction, setNewAction] = useState("")
  const [newEmailTo, setNewEmailTo] = useState("patient")
  const [newEmailSubject, setNewEmailSubject] = useState("")
  const [newEmailBody, setNewEmailBody] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/automations")
      if (res.ok) {
        const data = await res.json()
        setAutomations(data.automations || [])
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreate = async () => {
    if (!newName.trim() || !newTrigger || !newAction) return
    setCreating(true)
    try {
      let actionConfig: Record<string, unknown> = {}
      if (newAction === "send_email") {
        actionConfig = { to: newEmailTo, subject: newEmailSubject, body: newEmailBody }
      } else if (newAction === "notify_psychologist") {
        actionConfig = { message: newMessage }
      } else if (newAction === "send_reminder") {
        actionConfig = { hoursBefore: 24, to: "patient", subject: newEmailSubject, body: newEmailBody }
      } else if (newAction === "create_task") {
        actionConfig = { taskTitle: newMessage }
      }

      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          description: newDesc || undefined,
          triggerType: newTrigger,
          actionType: newAction,
          actionConfig,
        }),
      })
      if (res.ok) {
        toast.success("Automação criada!")
        setShowCreate(false)
        setNewName(""); setNewDesc(""); setNewTrigger(""); setNewAction("")
        setNewEmailSubject(""); setNewEmailBody(""); setNewMessage("")
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || "Erro ao criar")
      }
    } finally {
      setCreating(false)
    }
  }

  const handleToggle = async (id: string, enabled: boolean) => {
    await fetch(`/api/automations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !enabled }),
    })
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Remover esta automação?")) return
    await fetch(`/api/automations/${id}`, { method: "DELETE" })
    fetchData()
  }

  const handleApplyTemplate = async (template: typeof TEMPLATE_AUTOMATIONS[0]) => {
    setCreating(true)
    try {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          triggerType: template.triggerType,
          actionType: template.actionType,
          actionConfig: template.actionConfig,
        }),
      })
      if (res.ok) {
        toast.success(`Automação "${template.name}" criada!`)
        fetchData()
      }
    } finally {
      setCreating(false)
    }
  }

  const getTriggerInfo = (type: string) => TRIGGER_OPTIONS.find(t => t.value === type)
  const getActionInfo = (type: string) => ACTION_OPTIONS.find(a => a.value === type)

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-amber-500" />
            Automações
          </h1>
          <p className="text-muted-foreground text-sm">Automatize tarefas repetitivas com triggers inteligentes</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/automacoes/logs">
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Histórico
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
            Templates
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar
          </Button>
        </div>
      </div>

      {showTemplates && (
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg">Templates Prontos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {TEMPLATE_AUTOMATIONS.map((t, i) => {
                const trigger = getTriggerInfo(t.triggerType)
                const action = getActionInfo(t.actionType)
                return (
                  <div key={i} className="p-4 rounded-lg border dark:border-slate-800 hover:bg-muted/50 hover:shadow-sm transition-all duration-200 space-y-2">
                    <p className="font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                    <div className="flex items-center gap-2 text-xs">
                      {trigger && <span className={trigger.color}>{trigger.label}</span>}
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      {action && <span className={action.color}>{action.label}</span>}
                    </div>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => handleApplyTemplate(t)} disabled={creating}>
                      Aplicar
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {automations.length === 0 ? (
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-12 text-center">
            <Zap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma automação criada</h3>
            <p className="text-muted-foreground text-sm mb-4">Crie automações para economizar tempo em tarefas repetitivas</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => setShowTemplates(true)}>Ver Templates</Button>
              <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />Criar Primeira</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {automations.map(a => {
            const trigger = getTriggerInfo(a.triggerType)
            const action = getActionInfo(a.actionType)
            return (
              <Card key={a.id} className={`dark:bg-slate-900 dark:border-slate-800 transition-all duration-200 ${!a.enabled ? "opacity-60" : "hover:shadow-md"}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${a.enabled ? "bg-green-100 dark:bg-green-900/30" : "bg-gray-100 dark:bg-gray-900/30"}`}>
                        {a.enabled ? <Power className="h-5 w-5 text-green-600" /> : <PowerOff className="h-5 w-5 text-gray-400" />}
                      </div>
                      <div>
                        <p className="font-medium">{a.name}</p>
                        {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          {trigger && (
                            <Badge variant="outline" className={`text-xs ${trigger.color}`}>{trigger.label}</Badge>
                          )}
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          {action && (
                            <Badge variant="outline" className={`text-xs ${action.color}`}>{action.label}</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-xs text-muted-foreground hidden sm:block">
                        <p>{a.runCount} execuções</p>
                        {a.lastRunAt && <p>Última: {new Date(a.lastRunAt).toLocaleDateString("pt-BR")}</p>}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleToggle(a.id, a.enabled)}>
                        {a.enabled ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Automação</DialogTitle>
            <DialogDescription>Configure um trigger e uma ação automática</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome *</label>
              <Input placeholder="Ex: Lembrete antes da consulta" value={newName} onChange={e => setNewName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição</label>
              <Input placeholder="O que esta automação faz" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Quando dispara (Trigger) *</label>
              <div className="grid grid-cols-2 gap-2">
                {TRIGGER_OPTIONS.map(t => {
                  const Icon = t.icon
                  return (
                    <button key={t.value} onClick={() => setNewTrigger(t.value)}
                      className={`p-3 rounded-lg border text-left text-sm transition-all ${
                        newTrigger === t.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:bg-muted/50"
                      }`}>
                      <Icon className={`h-4 w-4 mb-1 ${t.color}`} />
                      <p className="font-medium">{t.label}</p>
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">O que fazer (Ação) *</label>
              <div className="grid grid-cols-2 gap-2">
                {ACTION_OPTIONS.map(a => {
                  const Icon = a.icon
                  return (
                    <button key={a.value} onClick={() => setNewAction(a.value)}
                      className={`p-3 rounded-lg border text-left text-sm transition-all ${
                        newAction === a.value
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:bg-muted/50"
                      }`}>
                      <Icon className={`h-4 w-4 mb-1 ${a.color}`} />
                      <p className="font-medium">{a.label}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {newAction === "send_email" && (
              <div className="space-y-3 p-4 rounded-lg border">
                <div>
                  <label className="text-sm font-medium">Enviar para</label>
                  <select value={newEmailTo} onChange={e => setNewEmailTo(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1">
                    <option value="patient">Paciente</option>
                    <option value="psychologist">Eu (psicólogo)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Assunto</label>
                  <Input placeholder="Assunto do email" value={newEmailSubject} onChange={e => setNewEmailSubject(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Corpo</label>
                  <textarea placeholder="Use {{patient_name}}, {{appointment_date}}, {{appointment_time}}" value={newEmailBody} onChange={e => setNewEmailBody(e.target.value)}
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" />
                </div>
              </div>
            )}

            {newAction === "notify_psychologist" && (
              <div className="p-4 rounded-lg border">
                <label className="text-sm font-medium">Mensagem</label>
                <textarea placeholder="Use {{patient_name}}, {{appointment_date}}" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" />
              </div>
            )}

            {newAction === "send_reminder" && (
              <div className="space-y-3 p-4 rounded-lg border">
                <div>
                  <label className="text-sm font-medium">Assunto</label>
                  <Input placeholder="Lembrete de consulta" value={newEmailSubject} onChange={e => setNewEmailSubject(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Mensagem</label>
                  <textarea placeholder="Use {{patient_name}}, {{appointment_date}}, {{appointment_time}}" value={newEmailBody} onChange={e => setNewEmailBody(e.target.value)}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" />
                </div>
              </div>
            )}

            {newAction === "create_task" && (
              <div className="p-4 rounded-lg border">
                <label className="text-sm font-medium">Título da tarefa</label>
                <Input placeholder="Ex: Preencher prontuário" value={newMessage} onChange={e => setNewMessage(e.target.value)} className="mt-1" />
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Variáveis disponíveis: {"{{patient_name}}"}, {"{{appointment_date}}"}, {"{{appointment_time}}"}, {"{{psychologist_name}}"}, {"{{task_title}}"}
            </p>

            <div className="flex gap-3">
              <DialogClose asChild>
                <Button variant="outline" className="flex-1">Cancelar</Button>
              </DialogClose>
              <Button className="flex-1" disabled={!newName.trim() || !newTrigger || !newAction || creating} onClick={handleCreate}>
                {creating && <RefreshCw className="h-4 w-4 animate-spin mr-2" />}
                Criar Automação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
