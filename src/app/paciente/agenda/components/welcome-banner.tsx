"use client"

import { Sparkles, Shield, Video, Heart, Calendar, ChevronRight } from "lucide-react"

export function WelcomeBanner({ patientName, onStartBooking }: { patientName: string; onStartBooking: () => void }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent" />
      <div className="absolute top-20 -left-20 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl" />
      <div className="absolute top-20 -right-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="relative max-w-2xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 ring-1 ring-emerald-500/20 mb-6">
          <Sparkles className="h-10 w-10 text-emerald-400" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Bem-vindo, {patientName?.split(" ")[0]}!
        </h1>
        <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
          Sua jornada de autocuidado começa aqui. Agende sua primeira consulta em poucos cliques.
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { icon: Shield, label: "Privacidade", desc: "Totalmente seguro" },
            { icon: Video, label: "Online", desc: "De qualquer lugar" },
            { icon: Heart, label: "Acolhimento", desc: "Profissional dedicado" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-slate-800/50 rounded-2xl p-4 text-center ring-1 ring-slate-700/50">
              <Icon className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm text-gray-200 font-medium">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>

        <button onClick={onStartBooking} className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 p-[1px] shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all duration-300">
          <div className="relative rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 flex items-center justify-center gap-3">
            <Calendar className="h-6 w-6 text-white" />
            <span className="text-lg font-semibold text-white">Agendar minha primeira consulta</span>
            <ChevronRight className="h-5 w-5 text-white/70 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">Consultas online com duração de 30 minutos</p>
        </div>
      </div>
    </div>
  )
}
