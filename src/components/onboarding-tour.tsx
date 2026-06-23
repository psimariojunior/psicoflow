"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { X, ChevronRight, ChevronLeft, Check, Sparkles, Users, Calendar, Video, FileText, Settings, Rocket } from "lucide-react"

const steps = [
  { icon: Sparkles, title: "Bem-vindo ao PsicoFlow!", desc: "Vamos te mostrar como usar a plataforma. Leva apenas 2 minutos.", color: "from-blue-500 to-blue-600" },
  { icon: Users, title: "1. Cadastre Pacientes", desc: "Comece cadastrando um paciente. Vá em 'Pacientes' → 'Novo Paciente'. Preencha nome, email e telefone.", href: "/pacientes", color: "from-emerald-500 to-emerald-600" },
  { icon: Calendar, title: "2. Agende Consultas", desc: "Na Agenda, selecione o paciente, data e horário. A consulta aparece automaticamente na agenda do dia.", href: "/agenda", color: "from-violet-500 to-violet-600" },
  { icon: Video, title: "3. Videochamada", desc: "Acesse 'Sala Virtual', crie uma sala e compartilhe o link com o paciente. A chamada é criptografada e segura.", href: "/sala-virtual", color: "from-cyan-500 to-cyan-600" },
  { icon: FileText, title: "4. Prontuários", desc: "Registre suas observações após cada sessão no prontuário do paciente. Mantenha o histórico organizado.", href: "/prontuarios", color: "from-amber-500 to-amber-600" },
  { icon: Settings, title: "5. Configurações", desc: "Complete seu perfil com foto, CRP e dados de contato. Configure lembretes automáticos e integre Google Calendar.", href: "/configuracoes", color: "from-rose-500 to-rose-600" },
  { icon: Rocket, title: "Tudo pronto!", desc: "Explore relatórios, finanças, questionários e muito mais. O PsicoFlow foi feito para simplificar sua prática.", color: "from-blue-500 to-blue-600" },
]

const KEY = "psicoflow-tour-v8"

export function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [animDir, setAnimDir] = useState<"next" | "prev">("next")
  const [show, setShow] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem(KEY) && pathname === "/dashboard") {
      const t = setTimeout(() => { setOpen(true); setTimeout(() => setShow(true), 50) }, 800)
      return () => clearTimeout(t)
    }
  }, [pathname])

  const finish = () => {
    setShow(false)
    setTimeout(() => { localStorage.setItem(KEY, "true"); setOpen(false); setStep(0) }, 300)
  }

  const goTo = (newStep: number, dir: "next" | "prev") => {
    setAnimDir(dir)
    setShow(false)
    setTimeout(() => {
      setStep(newStep)
      setShow(true)
      const s = steps[newStep]
      if (s.href && s.href !== pathname) router.push(s.href)
    }, 200)
  }

  const next = () => {
    if (step < steps.length - 1) goTo(step + 1, "next")
    else finish()
  }

  const prev = () => {
    if (step > 0) goTo(step - 1, "prev")
  }

  if (!open) return null
  const s = steps[step]
  const Icon = s.icon
  const pct = ((step + 1) / steps.length) * 100
  const last = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={finish}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        onClick={e => e.stopPropagation()}
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm z-[91] overflow-hidden transition-all duration-300"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? "scale(1) translateY(0)" : animDir === "next" ? "scale(0.95) translateY(20px)" : "scale(0.95) translateY(-20px)",
        }}
      >
        <div className="h-1 bg-slate-100 dark:bg-slate-800">
          <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="p-6 text-center">
          <button onClick={finish} className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center mx-auto mb-4 shadow-lg transition-transform duration-300 ${show ? "scale-100" : "scale-75"}`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <p className="text-xs text-slate-400 mb-2">Passo {step + 1} de {steps.length}</p>
          <h3 className="text-xl font-bold mb-2">{s.title}</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">{s.desc}</p>
          <div className="flex items-center justify-between">
            <button onClick={finish} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Pular</button>
            <div className="flex gap-2">
              {step > 0 && (
                <button onClick={prev} className="h-9 px-4 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                  Voltar
                </button>
              )}
              <button onClick={next} className={`h-9 px-5 rounded-xl text-xs font-semibold text-white shadow-lg transition-all hover:shadow-xl ${last ? "bg-emerald-600 hover:bg-emerald-500" : "bg-blue-600 hover:bg-blue-500"}`}>
                {last ? <span className="flex items-center gap-1.5"><Check className="h-4 w-4" />Concluir</span> : <span className="flex items-center gap-1.5">Próximo<ChevronRight className="h-4 w-4" /></span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
