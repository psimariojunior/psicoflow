"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { X, ChevronRight, ChevronLeft, Check, LayoutDashboard, Users, Calendar, Video, BarChart3, Settings, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    icon: Sparkles,
    title: "Bem-vindo ao PsicoFlow!",
    description: "Vamos te mostrar os principais recursos para gerenciar sua prática clínica de forma eficiente.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "Aqui você vê um resumo completo: pacientes, consultas do dia, receitas mensais e indicadores de desempenho.",
  },
  {
    icon: BarChart3,
    title: "Métricas e Gráficos",
    description: "Acompanhe a evolução do seu consultório com gráficos de receita, agendamentos, métodos de pagamento e crescimento de pacientes.",
  },
  {
    icon: Calendar,
    title: "Agenda de Consultas",
    description: "Gerencie seus horários, confirme presenças, registre faltas e visualize seus compromissos do dia.",
  },
  {
    icon: Users,
    title: "Pacientes",
    description: "Cadastre novos pacientes, acesse prontuários, histórico de sessões e diário de emoções de cada um.",
  },
  {
    icon: Video,
    title: "Sala Virtual",
    description: "Inicie videochamadas com seus pacientes pela plataforma LiveKit. Compartilhe o código da sala para acesso rápido.",
  },
  {
    icon: Settings,
    title: "Personalize",
    description: "Nas Configurações, você pode integrar Google Calendar, Stripe, configurar lembretes automáticos e muito mais.",
  },
]

const STORAGE_KEY = "psicoflow-onboarding-done"

export function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [closing, setClosing] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done && pathname === "/dashboard") {
      const timer = setTimeout(() => setOpen(true), 600)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  const complete = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "true")
      setOpen(false)
      setClosing(false)
    }, 200)
  }, [])

  const skip = useCallback(() => {
    setClosing(true)
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, "true")
      setOpen(false)
      setClosing(false)
      setStep(0)
    }, 200)
  }, [])

  const next = useCallback(() => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1)
    } else {
      complete()
    }
  }, [step, complete])

  const prev = useCallback(() => {
    if (step > 0) {
      setStep((s) => s - 1)
    }
  }, [step])

  if (!open) return null

  const s = steps[step]
  const isLast = step === steps.length - 1
  const progress = ((step + 1) / steps.length) * 100

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center p-4",
        closing ? "animate-out fade-out zoom-out-95 duration-200" : "animate-in fade-in zoom-in-95 duration-300"
      )}
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={skip} />
      <div
        className={cn(
          "relative bg-background rounded-2xl border shadow-2xl w-full max-w-lg mx-auto overflow-hidden",
          closing ? "animate-out fade-out zoom-out-95 duration-200" : "animate-in fade-in zoom-in-95 duration-300"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={skip}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Pular tour"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25 mb-5">
            <s.icon className="h-8 w-8 text-white" />
          </div>

          {/* Step counter */}
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Passo {step + 1} de {steps.length}
          </p>

          {/* Title */}
          <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed">{s.description}</p>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 my-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === step
                    ? "w-6 bg-emerald-500"
                    : i < step
                    ? "w-1.5 bg-emerald-300"
                    : "w-1.5 bg-muted-foreground/20"
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={skip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Pular tour
            </button>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="inline-flex items-center justify-center h-9 px-3 rounded-lg text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </button>
              )}

              <button
                onClick={next}
                className={cn(
                  "inline-flex items-center justify-center h-9 px-4 rounded-lg text-sm font-medium text-white shadow-sm transition-all",
                  isLast
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/25"
                    : "bg-primary hover:bg-primary/90"
                )}
              >
                {isLast ? (
                  <>
                    <Check className="h-4 w-4 mr-1.5" />
                    Concluir
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
