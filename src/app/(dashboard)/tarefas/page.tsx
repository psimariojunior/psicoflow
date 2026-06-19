"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate, cn } from "@/lib/utils"
import { CheckCircle2, Circle, XCircle, Search, User, BookOpen, Filter, Calendar, ExternalLink } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"
import { motion } from "framer-motion"

interface TaskResource {
  id: string
  name: string
  type: string
  category: string | null
}

interface PatientInfo {
  id: string
  name: string
}

interface Task {
  id: string
  status: "PENDING" | "COMPLETED" | "CANCELLED"
  notes: string | null
  assignedAt: string
  completedAt: string | null
  resource: TaskResource
  patient: PatientInfo
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon: typeof Circle }> = {
  PENDING: { label: "Pendente", variant: "default", icon: Circle },
  COMPLETED: { label: "Concluída", variant: "secondary", icon: CheckCircle2 },
  CANCELLED: { label: "Cancelada", variant: "outline", icon: XCircle },
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
}

export default function TarefasPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("")
  const [filterPatient, setFilterPatient] = useState<string>("")
  const [patients, setPatients] = useState<PatientInfo[]>([])
  const [completing, setCompleting] = useState<Set<string>>(new Set())

  async function loadTasks() {
    try {
      const params = new URLSearchParams()
      if (filterStatus) params.set("status", filterStatus)
      if (filterPatient) params.set("patientId", filterPatient)
      const res = await fetch(`/api/tarefas?${params}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTasks(Array.isArray(data) ? data : data.data || [])
    } catch {
      toast.error("Erro ao carregar tarefas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus) params.set("status", filterStatus)
    if (filterPatient) params.set("patientId", filterPatient)
    fetch(`/api/tarefas?${params}`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setTasks(d))
      .catch(() => toast.error("Erro ao carregar tarefas"))
      .finally(() => setLoading(false))
  }, [filterStatus, filterPatient])

  useEffect(() => {
    fetch("/api/pacientes")
      .then(r => r.json())
      .then(data => setPatients(data.patients || []))
      .catch(() => {})
  }, [])

  async function handleComplete(taskId: string) {
    setCompleting(prev => new Set(prev).add(taskId))
    try {
      const res = await fetch(`/api/tarefas/${taskId}`, { method: "PUT" })
      if (!res.ok) throw new Error()
      toast.success("Tarefa concluída com sucesso")
      loadTasks()
    } catch {
      toast.error("Erro ao concluir tarefa")
    } finally {
      setCompleting(prev => { const next = new Set(prev); next.delete(taskId); return next })
    }
  }

  const filtered = tasks.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return t.resource.name.toLowerCase().includes(q) || t.patient.name.toLowerCase().includes(q)
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 animate-shimmer rounded-lg" />
            <div className="h-4 w-56 animate-shimmer rounded-lg" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-48 animate-shimmer rounded-lg" />
          <div className="h-9 w-36 animate-shimmer rounded-lg" />
          <div className="h-9 w-36 animate-shimmer rounded-lg" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg animate-shimmer" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-3/4 animate-shimmer rounded" />
                  <div className="h-3 w-1/2 animate-shimmer rounded" />
                </div>
              </div>
              <div className="h-3 w-full animate-shimmer rounded" />
              <div className="h-3 w-2/3 animate-shimmer rounded" />
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
          <h2 className="text-2xl font-bold tracking-tight">Tarefas dos Pacientes</h2>
          <p className="text-muted-foreground">Acompanhe os recursos atribuídos a cada paciente</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} className="pl-9" placeholder="Buscar por paciente ou recurso..." />
        </div>
        <Select value={filterStatus} onValueChange={v => setFilterStatus(v)}>
          <SelectTrigger className="w-[150px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            <SelectItem value="PENDING">Pendentes</SelectItem>
            <SelectItem value="COMPLETED">Concluídas</SelectItem>
            <SelectItem value="CANCELLED">Canceladas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterPatient} onValueChange={v => setFilterPatient(v)}>
          <SelectTrigger className="w-[180px]">
            <User className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Paciente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {patients.map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <BookOpen className="mx-auto h-12 w-12 mb-3 opacity-30" />
            <p className="text-lg font-medium mb-1">Nenhuma tarefa encontrada</p>
            <p className="text-sm mb-4">
              {tasks.length === 0
                ? "Atribua recursos terapêuticos a um paciente para começar"
                : "Nenhuma tarefa corresponde aos filtros aplicados"}
            </p>
            <Button asChild>
              <Link href="/recursos-terapeuticos">
                <BookOpen className="mr-2 h-4 w-4" />Ir para Recursos Terapêuticos
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-3 md:grid-cols-2">
          {filtered.map(task => {
            const cfg = statusConfig[task.status] || statusConfig.PENDING
            const StatusIcon = cfg.icon
            return (
              <motion.div key={task.id} variants={itemVariants}>
                <Card className="card-hover">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-md shrink-0">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold truncate">{task.resource.name}</h3>
                          <div className="flex items-center gap-1 mt-0.5">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <Link href={`/pacientes/${task.patient.id}`} className="text-sm text-muted-foreground hover:text-primary hover:underline truncate">
                              {task.patient.name}
                            </Link>
                            <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                          </div>
                        </div>
                      </div>
                      <Badge variant={cfg.variant} className={cn(
                        "shrink-0 gap-1 capitalize",
                        task.status === "PENDING" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30",
                        task.status === "COMPLETED" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30",
                        task.status === "CANCELLED" && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                      )}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Atribuída em {formatDate(task.assignedAt)}</span>
                      </div>
                      {task.completedAt && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          <span>Concluída em {formatDate(task.completedAt)}</span>
                        </div>
                      )}
                    </div>

                    {task.notes && (
                      <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3 mb-3">{task.notes}</p>
                    )}

                    {task.resource.category && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{task.resource.category}</span>
                        <span className="text-[11px] bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">{task.resource.type}</span>
                      </div>
                    )}

                    {task.status === "PENDING" && (
                      <Button
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={() => handleComplete(task.id)}
                        disabled={completing.has(task.id)}
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        {completing.has(task.id) ? "Concluindo..." : "Marcar como Concluída"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
