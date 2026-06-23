"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { X, ChevronRight, ChevronLeft, Check, MousePointer2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TourStep {
  title: string
  desc: string
  href?: string
  selector?: string
  tip: string
}

const steps: TourStep[] = [
  {
    title: "Menu de Navegação",
    desc: "Por aqui você acessa todas as funcionalidades da plataforma.",
    selector: "nav[data-tour]",
    tip: "→ Clique nos itens para navegar",
  },
  {
    title: "Estatísticas Rápidas",
    desc: "Veja seus números principais: pacientes, consultas de hoje e receita mensal.",
    selector: "[data-tour='stats']",
    tip: "→ Dados atualizados em tempo real",
  },
  {
    title: "Ações Rápidas",
    desc: "Atalhos para as funções mais usadas. Clique direto para acessar.",
    selector: "[data-tour='quick']",
    tip: "→ Nova consulta, paciente, sala virtual",
  },
  {
    title: "Cadastre Pacientes",
    desc: "Vá em Pacientes → Novo Paciente. Preencha nome, email e telefone para começar.",
    href: "/pacientes",
    tip: "→ Primeiro passo para usar a plataforma",
  },
  {
    title: "Agende Consultas",
    desc: "Selecione o paciente, data e horário. A consulta aparece na agenda automaticamente.",
    href: "/agenda",
    tip: "→ Gerencie toda sua agenda aqui",
  },
  {
    title: "Sala Virtual",
    desc: "Crie salas de videochamada seguras e criptografadas para atender seus pacientes.",
    href: "/sala-virtual",
    tip: "→ Compartilhe o link com o paciente",
  },
  {
    title: "Prontuários",
    desc: "Registre observações e acompanhe o histórico de cada paciente.",
    href: "/prontuarios",
    tip: "→ Organize suas sessões",
  },
  {
    title: "Configurações",
    desc: "Configure perfil, foto, CRP, lembretes e integrações.",
    href: "/configuracoes",
    tip: "→ Complete seu perfil profissional",
  },
  {
    title: "Tudo Pronto!",
    desc: "Explore relatórios, finanças, questionários e mais no menu lateral.",
    tip: "→ Boa prática!",
  },
]

const KEY = "psicoflow-tour-v9"

export function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [rect, setRect] = useState<{ top: number; left: number; w: number; h: number } | null>(null)
  const [tooltip, setTooltip] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const [visible, setVisible] = useState(false)
  const [fadeDir, setFadeDir] = useState<"in" | "out">("in")
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem(KEY) && pathname === "/dashboard") {
      const t = setTimeout(() => setOpen(true), 600)
      return () => clearTimeout(t)
    }
  }, [pathname])

  useEffect(() => () => timerRef.current.forEach(clearTimeout), [])

  const clearAll = () => { timerRef.current.forEach(clearTimeout); timerRef.current = [] }

  const positionTooltip = useCallback((r: { top: number; left: number; w: number; h: number }) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const tw = 340
    const th = 200
    const g = 24

    // For sidebar (left side): center vertically on screen
    if (r.left < 300) {
      const top = Math.max(g, Math.min(Math.round(vh / 2 - th / 2), vh - th - g))
      const left = r.left + r.w + g
      setTooltip({ top, left: left + tw > vw - g ? r.left - tw - g : left })
      return
    }

    // For center content: right of element
    let top = Math.round(r.top + r.h / 2 - th / 2)
    let left = r.left + r.w + g
    if (left + tw > vw - g) left = r.left - tw - g
    if (left < g) left = Math.round((vw - tw) / 2)
    if (top < g) top = g
    if (top + th > vh - g) top = vh - th - g
    setTooltip({ top, left })
  }, [])

  const findElement = useCallback((attempt: number) => {
    clearAll()
    const s = steps[step]
    if (!s.selector) { setRect(null); return }

    const el = document.querySelector(s.selector)
    if (el) {
      const r = el.getBoundingClientRect()
      if (r.width > 10 && r.height > 10) {
        setRect({ top: r.top, left: r.left, w: r.width, h: r.height })
        positionTooltip({ top: r.top, left: r.left, w: r.width, h: r.height })
        return
      }
    }
    if (attempt < 40) {
      const t = setTimeout(() => findElement(attempt + 1), 150)
      timerRef.current.push(t)
    } else {
      setRect(null)
    }
  }, [step, positionTooltip])

  useEffect(() => {
    if (!open) return
    const t = setTimeout(() => findElement(0), 100)
    timerRef.current.push(t)
    return () => clearAll()
  }, [open, step, pathname, findElement])

  useEffect(() => {
    if (!open || !rect) return
    const onScroll = () => {
      const el = document.querySelector(steps[step].selector || "")
      if (el) {
        const r = el.getBoundingClientRect()
        setRect({ top: r.top, left: r.left, w: r.width, h: r.height })
        positionTooltip({ top: r.top, left: r.left, w: r.width, h: r.height })
      }
    }
    window.addEventListener("scroll", onScroll, true)
    return () => window.removeEventListener("scroll", onScroll, true)
  }, [open, rect, step, positionTooltip])

  const finish = () => { localStorage.setItem(KEY, "true"); setOpen(false); setStep(0); setRect(null); clearAll() }

  const go = (n: number, dir: "n" | "p") => {
    setFadeDir("out")
    setVisible(false)
    clearAll()
    setTimeout(() => {
      setStep(n)
      setVisible(true)
      setFadeDir("in")
      const s = steps[n]
      if (s.href && s.href !== pathname) router.push(s.href)
    }, 250)
  }

  const next = () => step < steps.length - 1 ? go(step + 1, "n") : finish()
  const prev = () => step > 0 && go(step - 1, "p")

  useEffect(() => { if (open) { const t = setTimeout(() => setVisible(true), 100); timerRef.current.push(t) } }, [open])

  if (!open) return null
  const s = steps[step]
  const pct = ((step + 1) / steps.length) * 100
  const last = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-[90]" onClick={finish}>
      <div className="fixed inset-0 bg-black/50" />
      {rect && (
        <div className="fixed z-[91] pointer-events-none" style={{ top: rect.top - 8, left: rect.left - 8, width: rect.w + 16, height: rect.h + 16, border: "2px solid #3b82f6", borderRadius: "10px", boxShadow: "0 0 0 9999px rgba(0,0,0,0.5), 0 0 16px rgba(59,130,246,0.5)" }} />
      )}
      <div onClick={e => e.stopPropagation()} className="fixed z-[95]" style={{ top: tooltip.top, left: tooltip.left, width: 340, opacity: visible ? 1 : 0, transform: `translateY(${fadeDir === "in" ? 0 : 10}px)`, transition: "all 0.3s ease" }}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className="h-1 bg-slate-100 dark:bg-slate-800"><div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${pct}%` }} /></div>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full">{step + 1}/{steps.length}</span>
              <button onClick={finish} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="h-3.5 w-3.5" /></button>
            </div>
            <h4 className="font-bold text-base mb-1">{s.title}</h4>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-1">{s.desc}</p>
            <p className="text-[11px] text-blue-500 font-medium mb-4">{s.tip}</p>
            <div className="flex items-center justify-between">
              <button onClick={finish} className="text-[11px] text-slate-400 hover:text-slate-600">Pular</button>
              <div className="flex gap-1.5">
                {step > 0 && <button onClick={prev} className="h-8 px-3 rounded-lg text-[11px] font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Voltar</button>}
                <button onClick={next} className={cn("h-8 px-4 rounded-lg text-[11px] font-semibold text-white shadow-md transition", last ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500")}>
                  {last ? <span className="flex items-center gap-1"><Check className="h-3 w-3" />Concluir</span> : <span className="flex items-center gap-1">Próximo<ChevronRight className="h-3 w-3" /></span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
