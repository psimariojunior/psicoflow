"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface TourStep {
  title: string
  description: string
  href?: string
  highlight?: string
}

const tourSteps: TourStep[] = [
  {
    title: "Bem-vindo ao PsicoFlow!",
    description: "Este é o menu lateral de navegação. Por aqui você acessa todas as funcionalidades: Pacientes, Agenda, Sala Virtual e mais.",
    highlight: "[data-tour='sidebar-menu']",
  },
  {
    title: "Seu Dashboard",
    description: "Painel principal com resumo do consultório: total de pacientes, consultas do dia, receita mensal e indicadores.",
    highlight: "[data-tour='dashboard-stats']",
  },
  {
    title: "Ações Rápidas",
    description: "Atalhos para as funções mais usadas: Nova Consulta, Novo Paciente, Sala Virtual e Prontuários. Clique direto para acessar.",
    highlight: "[data-tour='quick-actions']",
  },
  {
    title: "Cadastrar Pacientes",
    description: "No menu lateral, clique em 'Pacientes' e depois 'Novo Paciente'. Preencha nome, email e telefone. É o primeiro passo para usar a plataforma.",
    href: "/pacientes",
  },
  {
    title: "Agendar Consultas",
    description: "Acesse 'Agenda' no menu lateral. Selecione o paciente, data e horário. A consulta aparece automaticamente na agenda do dia.",
    href: "/agenda",
  },
  {
    title: "Sala Virtual",
    description: "Clique em 'Sala Virtual' no menu. Crie uma sala, copie o link e envie para o paciente. A videochamada é criptografada e segura.",
    href: "/sala-virtual",
  },
  {
    title: "Prontuários",
    description: "Registre suas observações após cada sessão. Acesse 'Prontuários' no menu para criar e consultar registros clínicos.",
    href: "/prontuarios",
  },
  {
    title: "Configurações",
    description: "Complete seu perfil com foto, CRP e dados de contato. Configure lembretes automáticos e integre Google Calendar.",
    href: "/configuracoes",
  },
  {
    title: "Tudo pronto!",
    description: "Explore relatórios, finanças, questionários e muito mais. O PsicoFlow foi feito para simplificar sua prática clínica.",
  },
]

const STORAGE_KEY = "psicoflow-tour-v5"

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false)
  const [step, setStep] = useState(0)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const [navigating, setNavigating] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const timersRef = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done && pathname === "/dashboard") {
      const timer = setTimeout(() => setIsActive(true), 800)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  // Clear all timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(t => clearTimeout(t))
      timersRef.current = []
    }
  }, [])

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(t => clearTimeout(t))
    timersRef.current = []
  }, [])

  const calculatePosition = useCallback((rect: DOMRect) => {
    const tooltipW = 320
    const tooltipH = 180
    const margin = 20
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight

    // Default: right of element, vertically centered
    let top = rect.top + rect.height / 2 - tooltipH / 2
    let left = rect.right + margin

    // If off right edge, try left
    if (left + tooltipW > viewportW - margin) {
      left = rect.left - tooltipW - margin
    }

    // If still off screen, center below
    if (left < margin) {
      left = (viewportW - tooltipW) / 2
      top = rect.bottom + margin
    }

    // Keep in viewport vertically
    if (top < margin) top = margin
    if (top + tooltipH > viewportH - margin) top = viewportH - tooltipH - margin

    return { position: "fixed" as const, top, left }
  }, [])

  const tryHighlight = useCallback((attempt: number) => {
    clearTimers()

    const currentStep = tourSteps[step]
    if (!currentStep.highlight) {
      setHighlightRect(null)
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      })
      return
    }

    const el = document.querySelector(currentStep.highlight)
    if (el) {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0) {
        setHighlightRect(rect)
        setTooltipStyle(calculatePosition(rect))
        return
      }
    }

    if (attempt < 50) {
      const t = setTimeout(() => tryHighlight(attempt + 1), 100)
      timersRef.current.push(t)
    }
  }, [step, clearTimers, calculatePosition])

  useEffect(() => {
    if (!isActive) return
    const t = setTimeout(() => tryHighlight(0), 50)
    timersRef.current.push(t)
  }, [isActive, step, pathname, tryHighlight])

  useEffect(() => {
    if (!isActive) return
    const onScroll = () => {
      const currentStep = tourSteps[step]
      if (!currentStep.highlight) return
      const el = document.querySelector(currentStep.highlight)
      if (el) {
        const rect = el.getBoundingClientRect()
        setHighlightRect(rect)
        setTooltipStyle(calculatePosition(rect))
      }
    }
    window.addEventListener("scroll", onScroll, true)
    return () => window.removeEventListener("scroll", onScroll, true)
  }, [isActive, step, calculatePosition])

  const finish = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true")
    setIsActive(false)
    setStep(0)
    setHighlightRect(null)
    clearTimers()
  }, [clearTimers])

  const next = useCallback(() => {
    if (step < tourSteps.length - 1) {
      const nextStep = step + 1
      const nextTourStep = tourSteps[nextStep]

      if (nextTourStep.href && nextTourStep.href !== pathname) {
        setNavigating(true)
        router.push(nextTourStep.href)
      }

      setStep(nextStep)
    } else {
      finish()
    }
  }, [step, pathname, router, finish])

  const prev = useCallback(() => {
    if (step > 0) {
      const prevStep = step - 1
      const prevTourStep = tourSteps[prevStep]

      if (prevTourStep.href && prevTourStep.href !== pathname) {
        setNavigating(true)
        router.push(prevTourStep.href)
      }

      setStep(prevStep)
    }
  }, [step, pathname, router])

  if (!isActive) return null

  const s = tourSteps[step]
  const isLast = step === tourSteps.length - 1
  const progress = ((step + 1) / tourSteps.length) * 100

  return (
    <div className="fixed inset-0 z-[90]">
      {/* Dark overlay — NO click handler to prevent accidental close */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* Highlight cutout */}
      {highlightRect && (
        <>
          {/* Cutout mask */}
          <div
            className="fixed z-[91] pointer-events-none"
            style={{
              top: highlightRect.top - 10,
              left: highlightRect.left - 10,
              width: highlightRect.width + 20,
              height: highlightRect.height + 20,
              border: "2px solid rgba(59, 130, 246, 0.9)",
              borderRadius: "12px",
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.55), 0 0 20px rgba(59, 130, 246, 0.4)",
            }}
          />
        </>
      )}

      {/* Tooltip card */}
      <div
        className="fixed z-[95] w-80"
        style={tooltipStyle}
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
          {/* Progress */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full">
                <Sparkles className="h-3 w-3" />
                {step + 1} de {tourSteps.length}
              </span>
              <button
                onClick={finish}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Fechar tour"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">{s.description}</p>

            <div className="flex items-center justify-between">
              <button
                onClick={finish}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors px-2 py-1"
              >
                Pular tour
              </button>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={prev}
                    disabled={navigating}
                    className="inline-flex items-center h-9 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all disabled:opacity-50"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    Voltar
                  </button>
                )}

                <button
                  onClick={next}
                  disabled={navigating}
                  className={cn(
                    "inline-flex items-center h-9 px-5 rounded-lg text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50",
                    isLast
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-emerald-500/25"
                      : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-blue-500/25"
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
    </div>
  )
}
