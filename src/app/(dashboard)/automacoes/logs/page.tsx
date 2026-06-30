"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Calendar,
  Mail,
  MessageSquare,
  Bell,
  Clock,
  UserPlus,
  AlertTriangle,
  Gift,
  Ban,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface AutomationLogEntry {
  id: string
  triggerType: string
  actionType: string
  status: string
  error: string | null
  context: Record<string, string> | null
  createdAt: string
  automation: { id: string; name: string } | null
}

const TRIGGER_ICONS: Record<string, typeof Calendar> = {
  appointment_booked: Calendar,
  appointment_cancelled: Ban,
  session_completed: CheckCircle2,
  task_overdue: AlertTriangle,
  new_patient: UserPlus,
  birthday: Gift,
  no_show: Ban,
  weekly_summary: BarChart3,
}

const TRIGGER_COLORS: Record<string, string> = {
  appointment_booked: "text-teal-500",
  appointment_cancelled: "text-red-500",
  session_completed: "text-green-500",
  task_overdue: "text-amber-500",
  new_patient: "text-purple-500",
  birthday: "text-pink-500",
  no_show: "text-red-400",
  weekly_summary: "text-indigo-500",
}

const TRIGGER_LABELS: Record<string, string> = {
  appointment_booked: "Consulta agendada",
  appointment_cancelled: "Consulta cancelada",
  session_completed: "Sessão concluída",
  task_overdue: "Tarefa atrasada",
  new_patient: "Novo paciente",
  birthday: "Aniversário",
  no_show: "Paciente faltou",
  weekly_summary: "Resumo semanal",
}

const ACTION_LABELS: Record<string, string> = {
  send_email: "Email",
  send_whatsapp: "WhatsApp",
  create_task: "Tarefa",
  notify_psychologist: "Notificação",
  send_reminder: "Lembrete",
  update_status: "Status",
}

export default function AutomacoesLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AutomationLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [filterTrigger, setFilterTrigger] = useState<string>("")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (filterStatus) params.set("status", filterStatus)
      if (filterTrigger) params.set("triggerType", filterTrigger)
      const res = await fetch(`/api/automations/logs?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
        setTotalPages(data.pagination?.pages || 1)
        setTotal(data.pagination?.total || 0)
      }
    } catch {} finally {
      setLoading(false)
    }
  }, [page, filterStatus, filterTrigger])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/automacoes" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Histórico de Automações</h1>
            <p className="text-muted-foreground text-sm">{total} execuções registradas</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLogs}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="SUCCESS">Sucesso</option>
          <option value="FAILED">Falha</option>
        </select>
        <select
          value={filterTrigger}
          onChange={(e) => { setFilterTrigger(e.target.value); setPage(1) }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todos os triggers</option>
          {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {logs.length === 0 ? (
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma execução registrada</h3>
            <p className="text-muted-foreground text-sm">Os logs aparecerão aqui quando suas automações rodarem</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const Icon = TRIGGER_ICONS[log.triggerType] || Bell
            const color = TRIGGER_COLORS[log.triggerType] || "text-gray-500"
            return (
              <Card key={log.id} className="dark:bg-slate-900 dark:border-slate-800 transition-all duration-200 hover:shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${log.status === "SUCCESS" ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                        {log.status === "SUCCESS"
                          ? <CheckCircle2 className="h-4 w-4 text-green-600" />
                          : <XCircle className="h-4 w-4 text-red-500" />
                        }
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${color}`} />
                          <span className="font-medium text-sm">{TRIGGER_LABELS[log.triggerType] || log.triggerType}</span>
                          <span className="text-muted-foreground text-xs">→</span>
                          <Badge variant="outline" className="text-xs">{ACTION_LABELS[log.actionType] || log.actionType}</Badge>
                          {log.automation && (
                            <span className="text-xs text-muted-foreground">({log.automation.name})</span>
                          )}
                        </div>
                        {log.context && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {String((log.context as Record<string, string>).patientName || "") && `Paciente: ${(log.context as Record<string, string>).patientName}`}
                            {String((log.context as Record<string, string>).patientName || "") && String((log.context as Record<string, string>).automationName || "") && " · "}
                            {String((log.context as Record<string, string>).automationName || "") && `${(log.context as Record<string, string>).automationName}`}
                          </p>
                        )}
                        {log.error && (
                          <p className="text-xs text-red-500 mt-0.5 max-w-md truncate">{log.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground shrink-0 ml-4">
                      <p>{new Date(log.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</p>
                      <p>{new Date(log.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Página {page} de {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
