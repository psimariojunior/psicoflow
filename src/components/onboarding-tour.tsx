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
    description: "Este é o menu lateral. Por aqui você acessa todas as funcionalidades da plataforma.",
    highlight: "[data-tour='sidebar-menu']",
  },
  {
    title: "Seu Dashboard",
    description: "Aqui está o resumo do seu consultório: pacientes, consultas de hoje, receita mensal e metas.",
    highlight: "[data-tour='dashboard-stats']",
  },
  {
    title: "Ações Rápidas",
    description: "Atalhos para as funções mais usadas: Nova Consulta, Novo Paciente, Sala Virtual e Prontuários.",
    highlight: "[data-tour='quick-actions']",
  },
  {
    title: "Cadastrar um Paciente",
    description: "Clique no menu lateral em 'Pacientes' e depois em 'Novo Paciente'. Preencha os dados básicos: nome, email e telefone.",
    href: "/pacientes/novo",
    highlight: "[data-tour='sidebar-pacientes']",
  },
  {
    title: "Agendar uma Consulta",
    description: "Acesse 'Agenda' no menu lateral. Selecione o paciente, data e horário. A consulta aparece automaticamente na agenda.",
    href: "/agenda",
    highlight: "[data-tour='sidebar-agenda']",
  },
  {
    title: "Sala Virtual",
    description: "Na hora da consulta, clique em 'Sala Virtual'. Crie uma sala e compartilhe o link com o paciente. A videochamada é segura e criptografada.",
    href: "/sala-virtual",
    highlight: "[data-tour='sidebar-sala-virtual']",
  },
  {
    title: "Prontuários",
    description: "Após a sessão, registre suas observações no prontuário do paciente. Mantenha o histórico organizado e seguro.",
    href: "/prontuarios",
    highlight: "[data-tour='sidebar-prontuarios']",
  },
  {
    title: "Configurações",
    description: "Complete seu perfil, adicione sua foto CRP, configure lembretes automáticos e integre Google Calendar.",
    href: "/configuracoes",
    highlight: "[data-tour='sidebar-configuracoes']",
  },
  {
    title: "Tudo pronto!",
    description: "Você já domina o básico! Explore relatórios, finanças, questionários e muito mais no menu lateral.",
  },
]

const STORAGE_KEY = "psicoflow-tour-v4"

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false)
  const [step, setStep] = useState(0)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const [waiting, setWaiting] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)

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
    if (!el) {
      setHighlightRect(null)
      setTooltipStyle({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      })
      return
    }

    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) return

    setHighlightRect(rect)

    const tooltipW = 320
    const tooltipH = 200
    const margin = 20
    const viewportW = window.innerWidth
    const viewportH = window.innerHeight

    // Default: right side, vertically centered
    let top = rect.top + rect.height / 2 - tooltipH / 2
    let left = rect.right + margin

    // If tooltip goes off right edge, try left side
    if (left + tooltipW > viewportW - margin) {
      left = rect.left - tooltipW - margin
    }

    // If still off screen, center horizontally below
    if (left < margin) {
      left = (viewportW - tooltipW) / 2
      top = rect.bottom + margin
    }

    // Keep within viewport vertically
    if (top < margin) top = margin
    if (top + tooltipH > viewportH - margin) top = viewportH - tooltipH - margin

    setTooltipStyle({ position: "fixed", top, left })
  }, [step])

  // When page changes, wait for element to appear then highlight
  useEffect(() => {
    if (!isActive) return

    setWaiting(true)
    setHighlightRect(null)

    const tryUpdate = (attempt: number) => {
      const currentStep = tourSteps[step]
      if (!currentStep.highlight) {
        setWaiting(false)
        updateHighlight()
        return
      }
      const el = document.querySelector(currentStep.highlight)
      if (el && el.getBoundingClientRect().width > 0) {
        setWaiting(false)
        updateHighlight()
      } else if (attempt < 30) {
        updateTimerRef.current = setTimeout(() => tryUpdate(attempt + 1), 100)
      } else {
        setWaiting(false)
        updateHighlight()
      }
    }

    tryUpdate(0)

    return () => {
      if (updateTimerRef.current) clearTimeout(updateTimerRef.current)
    }
  }, [isActive, step, pathname, updateHighlight])

  useEffect(() => {
    if (isActive) {
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
      const nextStep = step + 1
      const nextTourStep = tourSteps[nextStep]

      if (nextTourStep.href && nextTourStep.href !== pathname) {
        router.push(nextTourStep.href)
      }

      setStep(nextStep)
    } else {
      complete()
    }
  }, [step, pathname, router, complete])

  const prev = useCallback(() => {
    if (step > 0) {
      const prevStep = step - 1
      const prevTourStep = tourSteps[prevStep]

      if (prevTourStep.href && prevTourStep.href !== pathname) {
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
      {/* Overlay with cutout */}
      <div className="fixed inset-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left - 12}
                  y={highlightRect.top - 12}
                  width={highlightRect.width + 24}
                  height={highlightRect.height + 24}
                  rx="14"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.55)"
            mask="url(#tour-mask)"
            onClick={skip}
          />
        </svg>

        {/* Highlight glow */}
        {highlightRect && (
          <div
            className="absolute rounded-xl pointer-events-none transition-all duration-300"
            style={{
              top: highlightRect.top - 12,
              left: highlightRect.left - 12,
              width: highlightRect.width + 24,
              height: highlightRect.height + 24,
              border: "2px solid rgba(59, 130, 246, 0.9)",
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.2)",
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-[95] w-80 animate-in fade-in duration-200"
        style={tooltipStyle}
      >
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full">
                <Sparkles className="h-3 w-3" />
                {step + 1} de {tourSteps.length}
              </span>
              <button
                onClick={skip}
                className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Fechar"
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
                Pular tour
              </button>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={prev}
                    className="inline-flex items-center h-9 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                    Voltar
                  </button>
                )}

                <button
                  onClick={next}
                  className={cn(
                    "inline-flex items-center h-9 px-5 rounded-lg text-xs font-semibold text-white shadow-md transition-all hover:shadow-lg",
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
