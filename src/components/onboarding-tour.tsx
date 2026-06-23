"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { X, ChevronRight, ChevronLeft, Check, Sparkles, Users, Calendar, Video, FileText, Settings, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  { icon: Sparkles, title: "Bem-vindo ao PsicoFlow!", desc: "Vamos te mostrar como usar a plataforma. Leva apenas 2 minutos." },
  { icon: Users, title: "1. Cadastre Pacientes", desc: "Comece cadastrando um paciente. Vá em 'Pacientes' → 'Novo Paciente'.", href: "/pacientes" },
  { icon: Calendar, title: "2. Agende Consultas", desc: "Na Agenda, selecione o paciente e horário disponível.", href: "/agenda" },
  { icon: Video, title: "3. Videochamada", desc: "Acesse 'Sala Virtual', crie uma sala e compartilhe o link.", href: "/sala-virtual" },
  { icon: FileText, title: "4. Prontuários", desc: "Registre observações após cada sessão no prontuário do paciente.", href: "/prontuarios" },
  { icon: Settings, title: "5. Configurações", desc: "Complete seu perfil, foto, CRP e dados de contato.", href: "/configuracoes" },
  { icon: Rocket, title: "Tudo pronto!", desc: "Explore relatórios, finanças e muito mais no menu lateral." },
]

const KEY = "psicoflow-tour-v7"

export function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [closing, setClosing] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem(KEY) && pathname === "/dashboard") {
      const t = setTimeout(() => setOpen(true), 800)
      return () => clearTimeout(t)
    }
  }, [pathname])

  const finish = () => { localStorage.setItem(KEY, "true"); setOpen(false); setStep(0) }

  const next = () => {
    if (step < steps.length - 1) {
      const s = steps[step + 1]
      setStep(step + 1)
      if (s.href && s.href !== pathname) router.push(s.href)
    } else finish()
  }

  const prev = () => {
    if (step > 0) {
      const s = steps[step - 1]
      setStep(step - 1)
      if (s.href && s.href !== pathname) router.push(s.href)
    }
  }

  if (!open) return null
  const s = steps[step]
  const Icon = s.icon
  const pct = ((step + 1) / steps.length) * 100
  const last = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={finish} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm z-[91] overflow-hidden">
        <div className="h-1 bg-slate-100 dark:bg-slate-800"><div className="h-full bg-blue-600 transition-all" style={{ width: `${pct}%` }} /></div>
        <div className="p-6 text-center">
          <button onClick={finish} className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="h-4 w-4" /></button>
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4"><Icon className="h-7 w-7 text-white" /></div>
          <p className="text-xs text-slate-400 mb-2">{step + 1} de {steps.length}</p>
          <h3 className="text-lg font-bold mb-2">{s.title}</h3>
          <p className="text-sm text-slate-500 mb-6">{s.desc}</p>
          <div className="flex items-center justify-between">
            <button onClick={finish} className="text-xs text-slate-400 hover:text-slate-600">Pular</button>
            <div className="flex gap-2">
              {step > 0 && <button onClick={prev} className="h-8 px-3 rounded-lg text-xs border hover:bg-slate-50">Voltar</button>}
              <button onClick={next} className={cn("h-8 px-4 rounded-lg text-xs font-semibold text-white", last ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500")}>
                {last ? <span className="flex items-center gap-1"><Check className="h-3 w-3" />Concluir</span> : <span className="flex items-center gap-1">Próximo<ChevronRight className="h-3 w-3" /></span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
