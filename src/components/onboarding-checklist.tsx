"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, PartyPopper, ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

const ONBOARDING_KEY = "psicoflow_onboarding_completed"

const steps = [
  { id: "conta", label: "Criar conta", href: "/configuracoes", done: true },
  { id: "paciente", label: "Cadastrar primeiro paciente", href: "/pacientes/novo" },
  { id: "agendar", label: "Agendar primeira consulta", href: "/agenda" },
  { id: "sala", label: "Testar sala virtual", href: "/sala-virtual" },
  { id: "horarios", label: "Configurar horários de atendimento", href: "/configuracoes" },
]

export function OnboardingChecklist() {
  const router = useRouter()
  const [completed, setCompleted] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const val = localStorage.getItem(ONBOARDING_KEY)
    if (val === "true") setCompleted(true)
  }, [])

  const completedCount = steps.filter(
    (s) => s.done || checkedSteps[s.id]
  ).length
  const progress = Math.round((completedCount / steps.length) * 100)

  const handleFinish = () => {
    localStorage.setItem(ONBOARDING_KEY, "true")
    setCompleted(true)
  }

  if (completed || dismissed) return null

  return (
    <Card className="overflow-hidden border-blue-200 dark:border-blue-800 shadow-sm">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PartyPopper className="h-5 w-5 text-blue-200" />
            <div>
              <h3 className="text-white font-semibold text-sm">
                Bem-vindo ao PsicoFlow!
              </h3>
              <p className="text-blue-100 text-xs mt-0.5">
                Complete os passos abaixo para começar
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-blue-200 hover:text-white transition-colors rounded-lg p-1"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <CardContent className="p-6 space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">{completedCount}/{steps.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-1">
          {steps.map((step) => {
            const isChecked = step.done || checkedSteps[step.id]
            return (
              <button
                key={step.id}
                onClick={() => {
                  if (!step.done) {
                    setCheckedSteps((prev) => ({
                      ...prev,
                      [step.id]: !prev[step.id],
                    }))
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                  isChecked
                    ? "bg-emerald-50 dark:bg-emerald-950/30"
                    : "hover:bg-accent/50"
                )}
              >
                {isChecked ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <span
                  className={cn(
                    "text-sm flex-1",
                    isChecked && "line-through text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                {!step.done && !isChecked && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button size="sm" onClick={handleFinish} className="flex-1">
            Concluir
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDismissed(true)}
          >
            Pular
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
