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
  position?: "top" | "bottom" | "left" | "right"
}

const tourSteps: TourStep[] = [
  {
    title: "Bem-vindo ao PsicoFlow!",
    description: "Esta é sua central de comando. Aqui você gerencia tudo sobre sua prática clínica.",
    highlight: "[data-tour='sidebar']",
    position: "right",
  },
  {
    title: "Navegue pelo menu",
    description: "Use este menu para acessar todas as funcionalidades: Pacientes, Agenda, Sala Virtual e mais.",
    highlight: "[data-tour='sidebar-menu']",
    position: "right",
  },
  {
    title: "Dashboard",
    description: "Aqui você vê um resumo completo: pacientes, consultas do dia, receitas e indicadores.",
    href: "/dashboard",
    highlight: "[data-tour='dashboard-stats']",
    position: "bottom",
  },
  {
    title: "Cadastre seu primeiro paciente",
    description: "Clique em 'Novo Paciente' para cadastrar. Você precisa de pelo menos um paciente para agendar consultas.",
    href: "/pacientes/novo",
    highlight: "[data-tour='quick-action-patient']",
    position: "bottom",
  },
  {
    title: "Agende uma consulta",
    description: "Vá na Agenda e selecione um horário disponível para seu paciente.",
    href: "/agenda",
    highlight: "[data-tour='sidebar-agenda']",
    position: "right",
  },
  {
    title: "Inicie uma videochamada",
    description: "Na hora da consulta, acesse a Sala Virtual e compartilhe o link com o paciente.",
    href: "/sala-virtual",
    highlight: "[data-tour='sidebar-sala']",
    position: "right",
  },
  {
    title: "Registre a sessão",
    description: "Após a consulta, registre as observações no prontuário do paciente.",
    href: "/prontuarios",
    highlight: "[data-tour='sidebar-prontuarios']",
    position: "right",
  },
  {
    title: "Configure seu perfil",
    description: "Complete seus dados, foto e informações de contato para que os pacientes possam te encontrar.",
    href: "/configuracoes",
    highlight: "[data-tour='sidebar-settings']",
    position: "right",
  },
  {
    title: "Tudo pronto!",
    description: "Explore as outras funcionalidades: relatórios, finanças, lembretes automáticos e muito mais.",
  },
]

const STORAGE_KEY = "psicoflow-interactive-tour-v1"

export function OnboardingTour() {
  const [isActive, setIsActive] = useState(false)
  const [step, setStep] = useState(0)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({})
  const overlayRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY)
    if (!done && pathname === "/dashboard") {
      const timer = setTimeout(() => setIsActive(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [pathname])

  const updateHighlight = useCallback(() => {
    const currentStep = tourSteps[step]
    if (!currentStep.highlight) {
      setHighlightRect(null)
      return
    }

    const el = document.querySelector(currentStep.highlight)
    if (el) {
      const rect = el.getBoundingClientRect()
      setHighlightRect(rect)

      const position = currentStep.position || "right"
      const tooltipWidth = 320
      const tooltipHeight = 200
      const margin = 16
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      let top = 0
      let left = 0

      switch (position) {
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.right + margin
          break
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2
          left = rect.left - tooltipWidth - margin
          break
        case "top":
          top = rect.top - tooltipHeight - margin
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
        case "bottom":
          top = rect.bottom + margin
          left = rect.left + rect.width / 2 - tooltipWidth / 2
          break
      }

      // Keep within viewport bounds
      if (top < margin) top = margin
      if (top + tooltipHeight > viewportH - margin) top = viewportH - tooltipHeight - margin
      if (left < margin) left = margin
      if (left + tooltipWidth > viewportW - margin) left = viewportW - tooltipWidth - margin

      setTooltipStyle({ top, left })
    }
  }, [step])

  useEffect(() => {
    if (isActive) {
      updateHighlight()
      window.addEventListener("resize", updateHighlight)
      return () => window.removeEventListener("resize", updateHighlight)
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
      {/* Dark overlay with cutout */}
      <div ref={overlayRef} className="fixed inset-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="tour-mask">
              <rect width="100%" height="100%" fill="white" />
              {highlightRect && (
                <rect
                  x={highlightRect.left - 8}
                  y={highlightRect.top - 8}
                  width={highlightRect.width + 16}
                  height={highlightRect.height + 16}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.6)"
            mask="url(#tour-mask)"
            onClick={skip}
          />
        </svg>

        {/* Highlight glow */}
        {highlightRect && (
          <div
            className="absolute border-2 border-blue-400 rounded-xl pointer-events-none animate-pulse"
            style={{
              top: highlightRect.top - 8,
              left: highlightRect.left - 8,
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
            }}
          />
        )}
      </div>

      {/* Tooltip */}
      <div
        className="absolute z-[95] w-80 animate-in fade-in slide-in-from-left-4 duration-300"
        style={tooltipStyle}
      >
        <div className="bg-background rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
          {/* Progress */}
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="p-5">
            {/* Step badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-full">
                <Sparkles className="h-3 w-3" />
                {step + 1} de {tourSteps.length}
              </span>
              <button
                onClick={skip}
                className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.description}</p>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={skip}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
              >
                Pular
              </button>

              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={prev}
                    className="inline-flex items-center justify-center h-8 px-3 rounded-lg text-xs font-medium border border-input bg-background hover:bg-accent transition-all"
                  >
                    <ChevronLeft className="h-3 w-3 mr-1" />
                    Voltar
                  </button>
                )}

                <button
                  onClick={next}
                  className={cn(
                    "inline-flex items-center justify-center h-8 px-4 rounded-lg text-xs font-medium text-white shadow-sm transition-all",
                    isLast
                      ? "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600"
                      : "bg-primary hover:bg-primary/90"
                  )}
                >
                  {isLast ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Concluir
                    </>
                  ) : (
                    <>
                      Próximo
                      <ChevronRight className="h-3 w-3 ml-1" />
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
