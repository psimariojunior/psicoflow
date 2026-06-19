"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { Brain, CheckCircle2, Clock, BookOpen, Sparkles, Loader2, Lock, ArrowLeft, ListTodo, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface TaskResource {
  id: string
  name: string
  description?: string
  type: string
  content?: string
}

interface PatientTask {
  id: string
  status: string
  notes?: string
  assignedAt: string
  completedAt?: string
  resource: TaskResource
}

const typeLabels: Record<string, { label: string; icon: any; color: string }> = {
  CBT_EXERCISE: { label: "Exercício CBT", icon: Brain, color: "from-blue-500 to-blue-600" },
  PSYCHOEDUCATION: { label: "Psicoeducação", icon: BookOpen, color: "from-violet-500 to-purple-600" },
  MEDITATION: { label: "Meditação", icon: Sparkles, color: "from-emerald-500 to-teal-600" },
  WORKSHEET: { label: "Ficha de Trabalho", icon: FileText, color: "from-amber-500 to-orange-600" },
  OTHER: { label: "Recurso", icon: ListTodo, color: "from-slate-500 to-slate-600" },
}

export default function TarefasPage() {
  const { token, loading: authLoading } = usePatientAuth()
  const [tasks, setTasks] = useState<PatientTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading || !token) { setLoading(false); return }
    fetch("/api/pacientes/tarefas", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(setTasks)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, authLoading])

  const handleComplete = async (taskId: string) => {
    try {
      const res = await fetch(`/api/pacientes/tarefas/${taskId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: "COMPLETED", completedAt: new Date().toISOString() } : t))
        toast.success("Tarefa concluída!")
      } else {
        toast.error("Erro ao concluir tarefa")
      }
    } catch {
      toast.error("Erro ao concluir tarefa")
    }
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        {[1, 2, 3].map(i => <Card key={i} className="animate-pulse"><CardContent className="pt-6"><div className="h-4 w-3/4 bg-muted rounded" /></CardContent></Card>)}
      </div>
    )
  }

  if (!token) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <Lock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">Faça login para ver suas tarefas.</p>
        <Button asChild><Link href="/paciente/login">Entrar</Link></Button>
      </div>
    )
  }

  const pendingTasks = tasks.filter(t => t.status === "PENDING")
  const completedTasks = tasks.filter(t => t.status === "COMPLETED")

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
          Minhas Tarefas
        </h1>
        <p className="text-muted-foreground mt-1">Recursos e exercícios recomendados pelo seu psicólogo</p>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ListTodo className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">Nenhuma tarefa ainda</h3>
            <p className="text-muted-foreground text-sm">Seu psicólogo pode atribuir recursos terapêuticos para você. Eles aparecerão aqui.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {pendingTasks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Pendentes ({pendingTasks.length})
              </h2>
              {pendingTasks.map(task => {
                const typeInfo = typeLabels[task.resource.type] || typeLabels.OTHER
                const Icon = typeInfo.icon
                return (
                  <Card key={task.id} className="border-blue-200/50 dark:border-blue-800/30">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg shrink-0", typeInfo.color)}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-foreground">{task.resource.name}</h3>
                              <Badge variant="outline" className="mt-1 text-[10px]">{typeInfo.label}</Badge>
                            </div>
                            <Button
                              onClick={() => handleComplete(task.id)}
                              size="sm"
                              className="shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20"
                            >
                              <CheckCircle2 className="mr-1.5 h-4 w-4" />
                              Concluir
                            </Button>
                          </div>
                          {task.resource.description && (
                            <p className="text-sm text-muted-foreground mt-2">{task.resource.description}</p>
                          )}
                          <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-900 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                            {task.resource.content || "Sem conteúdo adicional."}
                          </div>
                          <p className="text-xs text-muted-foreground mt-3">
                            Atribuído em {new Date(task.assignedAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Concluídas ({completedTasks.length})
              </h2>
              {completedTasks.map(task => {
                const typeInfo = typeLabels[task.resource.type] || typeLabels.OTHER
                const Icon = typeInfo.icon
                return (
                  <Card key={task.id} className="opacity-70">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-400 to-slate-500 shadow-lg shrink-0">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-muted-foreground line-through">{task.resource.name}</h3>
                            <Badge variant="success" className="text-[10px]">Concluída</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Concluída em {task.completedAt ? new Date(task.completedAt).toLocaleDateString("pt-BR") : ""}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}