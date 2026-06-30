"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar, Users, Video, CreditCard, BarChart3,
  CheckCircle, Clock, ChevronRight, ChevronLeft, Play, Pause,
  Shield, Bell, Heart,
} from "lucide-react"

const steps = [
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    desc: "Gerencie seus horários com facilidade. Confirmação automática por WhatsApp e lembretes para reduzir faltas.",
    color: "from-teal-500 to-teal-600",
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
    icon: Bell,
    title: "Lembretes Automáticos",
    desc: "Envie lembretes por WhatsApp e email 24h e 1h antes da consulta. Reduza faltas em até 60%.",
    color: "from-emerald-500 to-teal-600",
    mock: "lembretes",
  },
  {
    icon: Video,
    title: "Sala Virtual Segura",
    desc: "Atenda online com videochamada criptografada. Tudo integrado na plataforma.",
    color: "from-cyan-500 to-teal-600",
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
              <div key={h} className={`text-[9px] py-1 rounded ${slots[d]?.includes(h) ? "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 font-medium" : "text-slate-300 dark:text-slate-700"}`}>
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">{p.name[0]}</div>
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

function MockLembretes() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-900 dark:text-white">Lembretes</span>
        <Bell className="h-4 w-4 text-emerald-500" />
      </div>
      <div className="space-y-2">
        {[
          { patient: "Maria S.", type: "WhatsApp", when: "24h antes", status: "Enviado", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
          { patient: "Maria S.", type: "WhatsApp", when: "1h antes", status: "Agendado", color: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400" },
          { patient: "João P.", type: "Email", when: "24h antes", status: "Enviado", color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" },
          { patient: "Ana L.", type: "WhatsApp", when: "1h antes", status: "Pendente", color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
        ].map((item, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.type === "WhatsApp" ? "bg-green-100 dark:bg-green-900/30" : "bg-teal-100 dark:bg-teal-900/30"}`}>
                {item.type === "WhatsApp" ? <svg className="w-3.5 h-3.5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> : <svg className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-900 dark:text-white">{item.patient}</p>
                <p className="text-[10px] text-slate-500">{item.type} • {item.when}</p>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.color}`}>{item.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
        <CheckCircle className="h-3 w-3 text-emerald-500" />
        <span>Redução de 60% nas faltas com lembretes automáticos</span>
      </div>
    </div>
  )
}

function MockVideo() {
  return (
    <div className="bg-slate-900 rounded-xl p-4 shadow-lg border border-slate-700 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-950/60 via-slate-900 to-indigo-950/40" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl text-white px-3 py-1 rounded-lg border border-white/10">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-medium">Sala Virtual</span>
          </div>
          <span className="text-[10px] text-white/50">47:32</span>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-500/30 ring-4 ring-teal-400/20">
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
          { label: "Meta mensal", value: "72%", color: "text-teal-600" },
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
        <BarChart3 className="h-4 w-4 text-teal-500" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Comparecimento", value: "94%", icon: CheckCircle, color: "text-emerald-600" },
          { label: "Sessões/mês", value: "32", icon: Calendar, color: "text-teal-600" },
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
  lembretes: MockLembretes,
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
                className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
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