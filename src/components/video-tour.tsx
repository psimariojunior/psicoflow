"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar, Users, FileText, Video, CreditCard, BarChart3,
  CheckCircle, Clock, ChevronRight, ChevronLeft, Play, Pause,
  Shield, Bell, Brain, Heart,
} from "lucide-react"

const steps = [
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    desc: "Gerencie seus horários com facilidade. Confirmação automática por WhatsApp e lembretes para reduzir faltas.",
    color: "from-blue-500 to-blue-600",
    mock: "agenda",
  },
  {
    icon: Users,
    title: "Gestão de Pacientes",
    desc: "Cadastre pacientes, acompanhe evolução e mantenha prontuários organizados e seguros.",
    color: "from-violet-500 to-purple-600",
    mock: "pacientes",
  },
  {
    icon: FileText,
    title: "Prontuários com IA",
    desc: "Registre sessões e gere evoluções automaticamente com inteligência artificial.",
    color: "from-emerald-500 to-teal-600",
    mock: "prontuario",
  },
  {
    icon: Video,
    title: "Sala Virtual Segura",
    desc: "Atenda online com videochamada criptografada. Tudo integrado na plataforma.",
    color: "from-cyan-500 to-blue-600",
    mock: "video",
  },
  {
    icon: CreditCard,
    title: "Financeiro Completo",
    desc: "Controle recebimentos, gere boletos e acompanhe faturamento em tempo real.",
    color: "from-amber-500 to-orange-600",
    mock: "financeiro",
  },
  {
    icon: BarChart3,
    title: "Relatórios & Métricas",
    desc: "Visualize indicadores de performance, taxa de comparecimento e crescimento.",
    color: "from-rose-500 to-pink-600",
    mock: "relatorios",
  },
]

function MockAgenda() {
  const days = ["Seg", "Ter", "Qua", "Qui", "Sex"]
  const hours = ["09:00", "10:00", "11:00", "14:00", "15:00"]
  const slots: Record<string, string[]> = {
    "Seg": ["09:00", "14:00", "15:00"],
    "Ter": ["10:00", "14:00"],
    "Qua": ["09:00", "10:00", "15:00"],
    "Qui": ["14:00"],
    "Sex": ["09:00", "10:00", "11:00", "14:00"],
  }
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">Agenda — Jun 2026</span>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">8 consultas</span>
      </div>
      <div className="grid grid-cols-5 gap-1 text-center">
        {days.map((d) => (
          <div key={d} className="text-[10px] font-medium text-slate-500 dark:text-slate-400 pb-1">{d}</div>
        ))}
        {days.map((d) => (
          <div key={d + "-slots"} className="space-y-1 min-h-[80px]">
            {hours.map((h) => (
              <div key={h} className={`text-[9px] py-1 rounded ${slots[d]?.includes(h) ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium" : "text-slate-300 dark:text-slate-700"}`}>
                {slots[d]?.includes(h) ? h : ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function MockPacientes() {
  const patients = [
    { name: "Maria S.", session: "Hoje 14:00", status: "Confirmado" },
    { name: "João P.", session: "Amanhã 10:00", status: "Pendente" },
    { name: "Ana L.", session: "Qui 15:00", status: "Confirmado" },
  ]
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">Pacientes</span>
        <span className="text-xs text-slate-500">12 ativos</span>
      </div>
      <div className="space-y-2">
        {patients.map((p, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">{p.name[0]}</div>
              <div>
                <p className="text-xs font-medium text-slate-900 dark:text-white">{p.name}</p>
                <p className="text-[10px] text-slate-500">{p.session}</p>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${p.status === "Confirmado" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"}`}>{p.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MockProntuario() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">Prontuário — Maria S.</span>
        <Brain className="h-4 w-4 text-violet-500" />
      </div>
      <div className="space-y-2">
        <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="h-3 w-3 text-violet-500" />
            <span className="text-[10px] font-medium text-violet-700 dark:text-violet-300">Sugestão IA</span>
          </div>
          <p className="text-[11px] text-slate-700 dark:text-slate-300">Paciente relata melhora no sono. Sugerir manutenção das técnicas de relaxamento.</p>
        </div>
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
          <p className="text-[10px] font-medium text-slate-900 dark:text-white mb-0.5">Sessão 12 — 23/06/2026</p>
          <p className="text-[10px] text-slate-500">Evolução: Ansiedade reduzida. Paciente demonstra autonomia nas estratégias.</p>
        </div>
      </div>
    </div>
  )
}

function MockVideo() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 shadow-lg border border-slate-700 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/40" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl text-white px-3 py-1 rounded-lg border border-white/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium">Sala Virtual</span>
          </div>
          <span className="text-[10px] text-white/50">47:32</span>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-blue-400/20">
            <span className="text-lg font-bold text-white">MJ</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 bg-black/60 backdrop-blur-xl rounded-xl px-3 py-2 border border-white/10">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg></div>
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white"><Video className="w-4 h-4" /></div>
          <div className="w-px h-5 bg-white/10" />
          <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-[10px] font-medium">Sair</div>
        </div>
      </div>
    </div>
  )
}

function MockFinanceiro() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">Financeiro</span>
        <span className="text-xs text-emerald-600 dark:text-emerald-400">R$ 4.850</span>
      </div>
      <div className="space-y-2">
        {[
          { label: "Recebido", value: "R$ 4.850", color: "text-emerald-600" },
          { label: "Pendente", value: "R$ 780", color: "text-amber-600" },
          { label: "Meta mensal", value: "72%", color: "text-blue-600" },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
            <span className="text-xs text-slate-600 dark:text-slate-400">{item.label}</span>
            <span className={`text-xs font-semibold ${item.color}`}>{item.value}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" style={{ width: "72%" }} />
      </div>
    </div>
  )
}

function MockRelatorios() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">Métricas</span>
        <BarChart3 className="h-4 w-4 text-blue-500" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Comparecimento", value: "94%", icon: CheckCircle, color: "text-emerald-600" },
          { label: "Sessões/mês", value: "32", icon: Calendar, color: "text-blue-600" },
          { label: "Novos pacientes", value: "5", icon: Users, color: "text-violet-600" },
          { label: "Faturamento", value: "+12%", icon: BarChart3, color: "text-amber-600" },
        ].map((item, i) => (
          <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
            <item.icon className={`h-4 w-4 mx-auto mb-1 ${item.color}`} />
            <p className="text-sm font-bold text-slate-900 dark:text-white">{item.value}</p>
            <p className="text-[9px] text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const mockComponents: Record<string, () => JSX.Element> = {
  agenda: MockAgenda,
  pacientes: MockPacientes,
  prontuario: MockProntuario,
  video: MockVideo,
  financeiro: MockFinanceiro,
  relatorios: MockRelatorios,
}

export function VideoTour() {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % steps.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [playing])

  const step = steps[current]
  const MockComponent = mockComponents[step.mock]

  return (
    <div className="aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 md:p-8 flex flex-col md:flex-row gap-6">
      {/* Left: Text + Progress */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="font-medium text-white">{current + 1}</span>
              <span>/</span>
              <span>{steps.length}</span>
            </div>
            <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                initial={false}
                animate={{ width: `${((current + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                <step.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button onClick={() => setPlaying(!playing)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" aria-label={playing ? "Pausar" : "Reproduzir"}>
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
          <button onClick={() => setCurrent((prev) => (prev - 1 + steps.length) % steps.length)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" aria-label="Anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setCurrent((prev) => (prev + 1) % steps.length)} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" aria-label="Próximo">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Right: Mock UI */}
      <div className="flex-1 flex items-center justify-center min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <MockComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}