"use client"

import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { X, ChevronRight, ChevronLeft, Check, MousePointer2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  badge: string
  title: string
  desc: string
  details: string[]
  href?: string
  highlight?: string
  color: string
}

const steps: Step[] = [
  {
    badge: "Boas-vindas",
    title: "Menu de Navegação",
    desc: "Este é o menu lateral. Por aqui você acessa todas as funcionalidades.",
    details: [
      "Dashboard — visão geral do consultório",
      "Pacientes — cadastro e histórico",
      "Agenda — agendamento de consultas",
      "Sala Virtual — videochamadas seguras",
      "Prontuários — registros clínicos",
      "Financeiro — receitas e despesas",
      "Configurações — perfil e integrações",
    ],
    highlight: "nav[data-tour]",
    color: "blue",
  },
  {
    badge: "Estatísticas",
    title: "Painel de Controle",
    desc: "Aqui você vê os principais indicadores do seu consultório.",
    details: [
      "Total de pacientes cadastrados",
      "Consultas agendadas para hoje",
      "Receita mensal acumulada",
      "Pagamentos pendentes",
      "Gráficos de evolução mensal",
    ],
    highlight: "[data-tour='stats']",
    color: "emerald",
  },
  {
    badge: "Ações Rápidas",
    title: "Atalhos para Ações Comuns",
    desc: "Acesse diretamente as funcionalidades mais usadas sem navegar pelo menu.",
    details: [
      "Nova Consulta — agendar rapidamente",
      "Novo Paciente — cadastrar em segundos",
      "Sala Virtual — iniciar videochamada",
      "Prontuário — registrar sessão",
    ],
    highlight: "[data-tour='quick']",
    color: "violet",
  },
  {
    badge: "Pacientes",
    title: "Gerencie seus Pacientes",
    desc: "Cadastre, edite e acompanhe todos os seus pacientes.",
    details: [
      "Cadastre com nome, email, telefone e CPF",
      "Veja histórico de consultas de cada paciente",
      "Acesse prontuários e diário de emoções",
      "Envie tarefas e questionários",
      "Acompanhe progresso com gráficos",
    ],
    href: "/pacientes",
    color: "cyan",
  },
  {
    badge: "Agenda",
    title: "Agendamento de Consultas",
    desc: "Organize sua agenda de forma visual e intuitiva.",
    details: [
      "Visualize consultas em formato calendário",
      "Clique em um horário para agendar",
      "Confirme ou cancele consultas",
      "Envie lembretes automáticos",
      "Sincronize com Google Calendar",
    ],
    href: "/agenda",
    color: "violet",
  },
  {
    badge: "Sala Virtual",
    title: "Videochamadas Seguras",
    desc: "Atenda seus pacientes por videochamada criptografada.",
    details: [
      "Crie salas com nome personalizado",
      "Compartilhe link seguro com o paciente",
      "Sala de espera com música relaxante",
      "Controles de câmera e microfone",
      "Qualidade adaptativa à internet",
    ],
    href: "/sala-virtual",
    color: "cyan",
  },
  {
    badge: "Prontuários",
    title: "Registros Clínicos",
    desc: "Documente cada sessão de forma organizada e segura.",
    details: [
      "Registre observações por sessão",
      "Assinatura digital do prontuário",
      "Histórico completo do paciente",
      "Relatórios exportáveis em PDF",
      "Dados criptografados e seguros",
    ],
    href: "/prontuarios",
    color: "amber",
  },
  {
    badge: "Financeiro",
    title: "Controle Financeiro",
    desc: "Gerencie receitas, despesas e pagamentos.",
    details: [
      "Registre entradas e saídas",
      "Emita recibos para pacientes",
      "Acompanhe inadimplência",
      "Gráficos de receita mensal",
      "Relatórios financeiros exportáveis",
    ],
    href: "/financeiro",
    color: "emerald",
  },
  {
    badge: "Relatórios",
    title: "Relatórios e Análises",
    desc: "Gere relatórios detalhados do seu consultório.",
    details: [
      "Relatório de pacientes",
      "Relatório financeiro",
      "Relatório de agenda",
      "Exporte em formato imprimível",
      "Dados para tomada de decisão",
    ],
    href: "/relatorios",
    color: "blue",
  },
  {
    badge: "Configurações",
    title: "Personalize sua Conta",
    desc: "Configure perfil, integrações e preferências.",
    details: [
      "Foto e dados profissionais (CRP)",
      "Integração com Google Calendar",
      "Configuração de lembretes",
      "Chave PIX para pagamentos",
      "Informações de contato",
    ],
    href: "/configuracoes",
    color: "rose",
  },
  {
    badge: "Concluído",
    title: "Tudo Pronto!",
    desc: "Você conhece todas as principais funcionalidades do PsicoFlow.",
    details: [
      "Cadastre seus primeiros pacientes",
      "Agende consultas e teste a videochamada",
      "Explore questionários e protocolos de crise",
      "Acompanhe seus relatórios regularmente",
      "Entre em contato se precisar de ajuda",
    ],
    color: "blue",
  },
]

const colorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800", dot: "bg-blue-500" },
  emerald: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800", dot: "bg-emerald-500" },
  violet: { bg: "bg-violet-50 dark:bg-violet-950/30", text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800", dot: "bg-violet-500" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-700 dark:text-cyan-300", border: "border-cyan-200 dark:border-cyan-800", dot: "bg-cyan-500" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800", dot: "bg-amber-500" },
  rose: { bg: "bg-rose-50 dark:bg-rose-950/30", text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800", dot: "bg-rose-500" },
}

const KEY = "psicoflow-tour-v11"

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

  const finish = () => { setVisible(false); setTimeout(() => { localStorage.setItem(KEY, "true"); setOpen(false); setStep(0) }, 300) }

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
  const c = colorMap[s.color]

  return (
    <div className="fixed inset-0 z-[90]">
      {/* Subtle overlay - just dims slightly */}
      <div className="fixed inset-0 bg-black/20" onClick={finish} />

      {/* Spotlight highlight */}
      {s.highlight && (
        <div className="fixed z-[91] pointer-events-none" style={{ boxShadow: "0 0 0 4px rgba(59,130,246,0.3), 0 0 0 9999px rgba(0,0,0,0.25)" }}>
          <style>{`
            ${s.highlight} { position: relative; z-index: 92; }
          `}</style>
        </div>
      )}

      {/* Bottom tour panel - always visible, doesn't cover content */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[95] transition-all duration-300 ease-out"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
      >
        <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 shadow-2xl">
          <div className="max-w-4xl mx-auto px-6 py-5">
            <div className="flex items-start gap-6">
              {/* Left: Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", c.bg, c.text)}>{s.badge}</span>
                  <span className="text-[11px] text-slate-400">{step + 1} de {steps.length}</span>
                </div>
                <h3 className="text-lg font-bold mb-1">{s.title}</h3>
                <p className="text-sm text-slate-500 mb-3">{s.desc}</p>
                <ul className="space-y-1">
                  {s.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <span className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", c.dot)} />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right: Navigation */}
              <div className="flex flex-col items-end gap-3 shrink-0">
                {/* Progress dots */}
                <div className="flex items-center gap-1.5">
                  {steps.map((_, i) => (
                    <div key={i} className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === step ? "w-6" : "w-1.5",
                      i === step ? c.dot : i < step ? "bg-slate-300 dark:bg-slate-600" : "bg-slate-200 dark:bg-slate-700"
                    )} />
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                  <button onClick={finish} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Pular</button>
                  {step > 0 && (
                    <button onClick={() => goTo(step - 1)} className="h-9 px-3 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-1">
                      <ChevronLeft className="h-3.5 w-3.5" /> Voltar
                    </button>
                  )}
                  <button onClick={() => last ? finish() : goTo(step + 1)} className={cn(
                    "h-9 px-5 rounded-lg text-xs font-semibold text-white shadow-md transition-all flex items-center gap-1.5",
                    last ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500"
                  )}>
                    {last ? <><Check className="h-4 w-4" />Concluir</> : <>Próximo<ChevronRight className="h-4 w-4" /></>}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100 dark:bg-slate-800">
            <div className={cn("h-full transition-all duration-500 bg-gradient-to-r", c.bg.replace("bg-", "from-").replace(" dark:bg-", " dark:from-"))} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}
