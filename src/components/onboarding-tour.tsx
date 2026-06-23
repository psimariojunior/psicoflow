"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { X, ChevronRight, ChevronLeft, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = [
  {
    badge: "Passo 1 de 7",
    title: "Bem-vindo ao PsicoFlow!",
    desc: "Vamos te mostrar como usar a plataforma. Cada passo te leva até a funcionalidade correspondente.",
    visual: "welcome",
  },
  {
    badge: "Passo 2 de 7",
    title: "Cadastre seu primeiro paciente",
    desc: "Acesse 'Pacientes' no menu lateral e clique em 'Novo Paciente'. Preencha nome, email e telefone.",
    visual: "patients",
    href: "/pacientes",
  },
  {
    badge: "Passo 3 de 7",
    title: "Agende uma consulta",
    desc: "Vá em 'Agenda' e selecione o paciente, data e horário. A consulta aparece automaticamente na agenda do dia.",
    visual: "calendar",
    href: "/agenda",
  },
  {
    badge: "Passo 4 de 7",
    title: "Inicie uma videochamada",
    desc: "Acesse 'Sala Virtual', crie uma sala e compartilhe o link com o paciente. A chamada é criptografada e segura.",
    visual: "video",
    href: "/sala-virtual",
  },
  {
    badge: "Passo 5 de 7",
    title: "Registre a sessão",
    desc: "Após a consulta, registre suas observações no prontuário do paciente. Mantenha o histórico organizado.",
    visual: "records",
    href: "/prontuarios",
  },
  {
    badge: "Passo 6 de 7",
    title: "Configure seu perfil",
    desc: "Complete seus dados profissionais, foto, CRP e informações de contato para que os pacientes possam te encontrar.",
    visual: "settings",
    href: "/configuracoes",
  },
  {
    badge: "Passo 7 de 7",
    title: "Tudo pronto!",
    desc: "Explore relatórios, finanças, questionários e muito mais. O PsicoFlow foi feito para simplificar sua prática clínica.",
    visual: "done",
  },
]

const visualColors: Record<string, string> = {
  welcome: "from-blue-500 to-blue-700",
  patients: "from-emerald-500 to-emerald-700",
  calendar: "from-violet-500 to-violet-700",
  video: "from-cyan-500 to-cyan-700",
  records: "from-amber-500 to-amber-700",
  settings: "from-rose-500 to-rose-700",
  done: "from-blue-500 to-blue-700",
}

const KEY = "psicoflow-tour-v10"

export function OnboardingTour() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem(KEY) && pathname === "/dashboard") {
      const t = setTimeout(() => { setOpen(true); setTimeout(() => setVisible(true), 100) }, 600)
      return () => clearTimeout(t)
    }
  }, [pathname])

  const finish = () => {
    setVisible(false)
    setTimeout(() => { localStorage.setItem(KEY, "true"); setOpen(false); setStep(0) }, 300)
  }

  const goTo = (n: number) => {
    setVisible(false)
    setTimeout(() => {
      setStep(n)
      setVisible(true)
      const s = steps[n]
      if (s.href && s.href !== pathname) router.push(s.href)
    }, 250)
  }

  if (!open) return null
  const s = steps[step]
  const pct = ((step + 1) / steps.length) * 100
  const last = step === steps.length - 1

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center" onClick={finish}>
      <div className="fixed inset-0 bg-black/40" />
      <div onClick={e => e.stopPropagation()} className="relative z-[91] w-full max-w-lg mx-4">
        <div
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ease-out"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.95)" }}
        >
          {/* Visual Header */}
          <div className={`relative h-40 bg-gradient-to-br ${visualColors[s.visual]} flex items-center justify-center overflow-hidden`}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGciPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyem0wLTRWMjhIMjR2LTJoMTJ6TTM2IDE4djJIMjR2LTJoMTJ6TTM4IDMwdjJIMjZ2LTJoMTJ6TTM4IDI0djJIMjZ2LTJoMTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative text-center text-white">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
                <span className="text-4xl">{s.visual === "welcome" ? "👋" : s.visual === "patients" ? "👥" : s.visual === "calendar" ? "📅" : s.visual === "video" ? "🎥" : s.visual === "records" ? "📋" : s.visual === "settings" ? "⚙️" : "🚀"}</span>
              </div>
              <p className="text-sm font-medium text-white/80">{s.badge}</p>
            </div>
            <button onClick={finish} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">{s.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">{s.desc}</p>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((_, i) => (
                <div key={i} className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === step ? "w-8 bg-blue-600" : i < step ? "w-2 bg-blue-300" : "w-2 bg-slate-200 dark:bg-slate-700"
                )} />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button onClick={finish} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
                Pular tour
              </button>
              <div className="flex gap-2">
                {step > 0 && (
                  <button onClick={() => goTo(step - 1)} className="h-10 px-4 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" /> Voltar
                  </button>
                )}
                <button onClick={() => last ? finish() : goTo(step + 1)} className={cn(
                  "h-10 px-6 rounded-xl text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl flex items-center gap-1.5",
                  last ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600"
                )}>
                  {last ? <><Check className="h-4 w-4" />Concluir</> : <>Próximo<ChevronRight className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
