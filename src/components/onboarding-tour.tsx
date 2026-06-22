"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { X, ChevronRight, ChevronLeft, Check, LayoutDashboard, Users, Calendar, Video, FileText, Settings, Sparkles, Rocket, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Step {
  icon: any
  title: string
  description: string
  action?: string
  href?: string
  color: string
}

const steps: Step[] = [
  {
    icon: Sparkles,
    title: "Bem-vindo ao PsicoFlow!",
    description: "Vamos te mostrar como usar a plataforma para gerenciar sua prática clínica. Leva apenas 2 minutos.",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: Users,
    title: "1. Cadastre seu primeiro paciente",
    description: "Comece cadastrando um paciente. Vá em 'Pacientes' → 'Novo Paciente' e preencha os dados básicos.",
    action: "Ir para Pacientes",
    href: "/pacientes/novo",
    color: "from-emerald-500 to-emerald-700",
  },
  {
    icon: Calendar,
    title: "2. Agende uma consulta",
    description: "Após cadastrar o paciente, agende uma consulta. Vá em 'Agenda' e selecione o horário disponível.",
    action: "Ir para Agenda",
    href: "/agenda",
    color: "from-violet-500 to-violet-700",
  },
  {
    icon: Video,
    title: "3. Inicie uma videochamada",
    description: "Na hora da consulta, clique em 'Sala Virtual' e compartilhe o link com o paciente. A videochamada é criptografada e segura.",
    action: "Testar Sala Virtual",
    href: "/sala-virtual",
    color: "from-cyan-500 to-cyan-700",
  },
  {
    icon: FileText,
    title: "4. Registre a sessão",
    description: "Após a consulta, registre as principais observações no prontuário do paciente. Mantenha seu histórico organizado.",
    action: "Ver Prontuários",
    href: "/prontuarios",
    color: "from-amber-500 to-amber-700",
  },
  {
    icon: Settings,
    title: "5. Configure seu perfil",
    description: "Complete seus dados profissionais, foto e informações de contato. Isso aparece na página pública de agendamento.",
    action: "Ir para Configurações",
    href: "/configuracoes",
    color: "from-rose-500 to-rose-700",
  },
  {
    icon: Rocket,
    title: "Tudo pronto!",
    description: "Você já sabe o básico! Explore as outras funcionalidades: relatórios, finanças, lembretes automáticos e muito mais.",
    color: "from-blue-500 to-blue-700",
  },
]

const STORAGE_KEY = "psicoflow-onboarding-v2"

export function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [closing, setClosing] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done && pathname === "/dashboard") {
      const timer = setTimeout(() => setOpen(true), 800)
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
  }, [])

  const handleAction = useCallback(() => {
    const currentStep = steps[step]
    if (currentStep.href) {
      complete()
      router.push(currentStep.href)
    }
  }, [step, complete, router])

  if (!open) return null

  const s = steps[step]
  const isLast = step === steps.length - 1
  const progress = ((step + 1) / steps.length) * 100

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center p-4",
        closing ? "animate-out fade-out duration-200" : "animate-in fade-in duration-300"
      )}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={skip} />
      <div
        className={cn(
          "relative bg-background rounded-3xl border border-border/50 shadow-2xl w-full max-w-md mx-auto overflow-hidden",
          closing ? "animate-out fade-out zoom-out-95 duration-200" : "animate-in fade-in zoom-in-95 duration-300"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div
            className={cn("h-full transition-all duration-700 ease-out bg-gradient-to-r", s.color)}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8">
          {/* Close button */}
          <button
            onClick={skip}
            className="absolute right-4 top-4 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Pular tour"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon */}
          <div className={cn("flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-xl mx-auto mb-6", s.color)}>
            <s.icon className="h-10 w-10 text-white" />
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  i === step
                    ? "w-8 bg-gradient-to-r " + s.color
                    : i < step
                    ? "w-2 bg-blue-400"
                    : "w-2 bg-muted-foreground/20"
                )}
              />
            ))}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-center text-foreground mb-3">{s.title}</h3>

          {/* Description */}
          <p className="text-muted-foreground text-center leading-relaxed mb-6">{s.description}</p>

          {/* Action button */}
          {s.href && (
            <button
              onClick={handleAction}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-accent hover:bg-accent/80 text-foreground font-medium text-sm transition-colors mb-6"
            >
              {s.action}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={skip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Pular
            </button>

            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-xl text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar
                </button>
              )}

              <button
                onClick={next}
                className={cn(
                  "inline-flex items-center justify-center h-10 px-5 rounded-xl text-sm font-medium text-white shadow-lg transition-all",
                  isLast
                    ? "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 shadow-blue-500/25"
                    : "bg-gradient-to-r " + s.color + " shadow-lg"
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
