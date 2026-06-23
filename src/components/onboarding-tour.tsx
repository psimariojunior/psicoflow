"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { usePathname } from "next/navigation"
import { X, ChevronRight, ChevronLeft, Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface TourStep {
  title: string
  description: string
  highlight?: string
}

const tourSteps: TourStep[] = [
  {
    title: "Bem-vindo ao PsicoFlow!",
    description: "Este é seu painel de controle. Aqui você vê um resumo de tudo: pacientes, consultas, receitas.",
    highlight: "[data-tour='sidebar-menu']",
  },
  {
    title: "Menu de navegação",
    description: "Use este menu lateral para acessar Pacientes, Agenda, Sala Virtual, Prontuários e todas as outras funcionalidades.",
    highlight: "[data-tour='sidebar-menu']",
  },
  {
    title: "Estatísticas",
    description: "Estes cards mostram seus principais indicadores: total de pacientes, consultas do dia e receita mensal.",
    highlight: "[data-tour='dashboard-stats']",
  },
  {
    title: "Ações rápidas",
    description: "Acesse diretamente as funcionalidades mais usadas: nova consulta, novo paciente, sala virtual e prontuários.",
    highlight: "[data-tour='quick-actions']",
  },
  {
    title: "Gráficos",
    description: "Acompanhe a evolução do consultório com gráficos de receita, agendamentos e métodos de pagamento.",
    highlight: "[data-tour='dashboard-charts']",
  },
  {
    title: "Próximos passos",
    description: "Cadastre um paciente, agende uma consulta e teste a videochamada. Explore o menu lateral para mais opções!",
  },
]

const STORAGE_KEY = "psicoflow-tour-v3"

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false)
  const [step, setStep] = useState(0)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const tooltipRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done && pathname === "/dashboard") {
      const timer = setTimeout(() => setIsActive(true), 800)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  const updateHighlight = useCallback(() => {
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
      setHighlightRect(rect)

      // Position tooltip to the right of the element, centered vertically
      const tooltipW = 320
      const margin = 20
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      let top = rect.top + rect.height / 2
      let left = rect.right + margin

      // If tooltip would go off right edge, show on left
      if (left + tooltipW > viewportW - margin) {
        left = rect.left - tooltipW - margin
      }

      // If still off screen, center it
      if (left < margin) {
        left = (viewportW - tooltipW) / 2
        top = rect.bottom + margin
      }

      // Keep vertically within viewport
      const tooltipH = 180
      if (top < margin) top = margin
      if (top + tooltipH > viewportH - margin) top = viewportH - tooltipH - margin

      setTooltipStyle({
        position: "fixed",
        top,
        left,
      })
    }
  }, [step])

  useEffect(() => {
    if (isActive) {
      updateHighlight()
      window.addEventListener("resize", updateHighlight)
      window.addEventListener("scroll", updateHighlight, true)
      return () => {
        window.removeEventListener("resize", updateHighlight)
        window.removeEventListener("scroll", updateHighlight, true)
      }
    }
  }, [isActive, updateHighlight])

  const complete = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true")
    setIsActive(false)
    setStep(0)
  }, [])

  const skip = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, "true")
    setIsActive(false)
    setStep(0)
  }, [])

  const next = useCallback(() => {
    if (step < tourSteps.length - 1) {
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

  if (!isActive) return null

  const s = tourSteps[step]
  const isLast = step === tourSteps.length - 1
  const progress = ((step + 1) / tourSteps.length) * 100

  return (
    <div className="fixed inset-0 z-[90]">
      {/* Dark overlay with cutout */}
      <div className="fixed inset-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left - 10}
                  y={highlightRect.top - 10}
                  width={highlightRect.width + 20}
                  height={highlightRect.height + 20}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.5)"
            mask="url(#tour-mask)"
            onClick={skip}
          />
        </svg>

        {/* Highlight glow ring */}
        {highlightRect && (
          <div
            className="absolute rounded-xl pointer-events-none"
            style={{
              top: highlightRect.top - 10,
              left: highlightRect.left - 10,
              width: highlightRect.width + 20,
              height: highlightRect.height + 20,
              border: "2px solid rgba(59, 130, 246, 0.8)",
              boxShadow: "0 0 15px rgba(59, 130, 246, 0.4), inset 0 0 15px rgba(59, 130, 246, 0.1)",
              animation: "pulse-ring 2s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {/* Tooltip card */}
      <div
        ref={tooltipRef}
        className="fixed z-[95] w-80"
        style={tooltipStyle}
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
          {/* Progress */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full">
                <Sparkles className="h-3 w-3" />
                {step + 1}/{tourSteps.length}
              </span>
              <button
                onClick={skip}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{s.title}</h3>

            {/* Description */}
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">{s.description}</p>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={skip}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors px-2 py-1"
              >
                Pular
              </button>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={prev}
                    className="inline-flex items-center h-8 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Voltar
                  </button>
                )}

                <button
                  onClick={next}
                  className={cn(
                    "inline-flex items-center h-8 px-4 rounded-lg text-xs font-medium text-white shadow-sm transition-all",
                    isLast
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500"
                      : "bg-blue-600 hover:bg-blue-500"
                  )}
                >
                  {isLast ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5" />
                      Concluir
                    </>
                  ) : (
                    <>
                      Próximo
                      <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
