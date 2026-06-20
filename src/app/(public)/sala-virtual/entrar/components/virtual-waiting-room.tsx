"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2, Lightbulb, Music } from "lucide-react"

const TIPS = [
  "Respire fundo e foque no momento presente. A terapia é um espaço seu.",
  "Não existem sentimentos certos ou errados. Tudo o que você sente é válido.",
  "Pratique a auto-compaixão: trate-se com a mesma gentileza que trataria um amigo.",
  "Pequenos progressos são grandes conquistas. Valorize cada passo.",
  "Lembre-se: você não precisa ter todas as respostas agora. A terapia é uma jornada.",
]

const PIANO_KEYS = ["C", "D", "E", "F", "G", "A", "B", "C2"]

const BREATHING_PHASES = [
  { text: "Inspire", duration: 4000, scale: 1.4 },
  { text: "Segure", duration: 4000, scale: 1.4 },
  { text: "Expire", duration: 4000, scale: 1 },
]

interface VirtualWaitingRoomProps {
  patientName: string
  connecting: boolean
  onEnterRoom: () => void
}

export function VirtualWaitingRoom({ patientName, connecting, onEnterRoom }: VirtualWaitingRoomProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [breathPhase, setBreathPhase] = useState(0)
  const [breathProgress, setBreathProgress] = useState(0)

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % TIPS.length)
    }, 8000)
    return () => clearInterval(tipInterval)
  }, [])

  useEffect(() => {
    const phase = BREATHING_PHASES[breathPhase]
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / phase.duration, 1)
      setBreathProgress(progress)
      if (progress >= 1) {
        setBreathPhase((prev) => (prev + 1) % BREATHING_PHASES.length)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [breathPhase])

  const currentPhase = BREATHING_PHASES[breathPhase]
  const scale = 1 + (currentPhase.scale - 1) * breathProgress

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-[#0a1120] to-slate-900">
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="w-full max-w-lg relative z-10 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-white">
              Olá, {patientName || "Paciente"}
            </h2>
            <p className="text-blue-300/70 text-sm font-light">
              Seu psicólogo está quase pronto. Aproveite este momento para relaxar.
            </p>
          </div>

          <div className="flex items-end justify-center gap-1.5 h-24">
            {PIANO_KEYS.map((key, i) => {
              const isWhite = i < PIANO_KEYS.length - 1
              return (
                <div
                  key={key}
                  className={`rounded-t-md transition-all duration-300 ${
                    isWhite
                      ? "w-10 h-full bg-white/10 hover:bg-blue-400/30"
                      : "w-7 h-3/5 bg-blue-800/40 hover:bg-blue-400/40"
                  }`}
                  style={{
                    animation: `pianoWave 3s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              )
            })}
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="relative flex items-center justify-center w-32 h-32">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                animate={{ scale }}
                transition={{ duration: 0.05, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-4 rounded-full bg-blue-500/10 border border-blue-400/20"
                animate={{ scale }}
                transition={{ duration: 0.05, ease: "linear" }}
              />
              <span className="text-blue-300 text-sm font-medium z-10">
                {currentPhase.text}
              </span>
            </div>
            <p className="text-xs text-blue-400/60 font-light tracking-wider uppercase">
              Exercício de respiração
            </p>
          </div>

          <div className="flex items-start gap-3 bg-white/[0.04] rounded-xl p-4 ring-1 ring-white/[0.06] min-h-[72px]">
            <Lightbulb className="h-5 w-5 text-amber-400/70 shrink-0 mt-0.5" />
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTipIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.4 }}
                className="text-sm text-white/70 leading-relaxed"
              >
                {TIPS[currentTipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            size="lg"
            onClick={onEnterRoom}
            disabled={connecting}
          >
            {connecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Music className="mr-2 h-5 w-5" />}
            {connecting ? "Conectando..." : "Entrar na Sala"}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes pianoWave {
          0%, 100% {
            background-color: rgba(255, 255, 255, 0.08);
            transform: translateY(0);
          }
          25% {
            background-color: rgba(96, 165, 250, 0.3);
            transform: translateY(-4px);
          }
          50% {
            background-color: rgba(59, 130, 246, 0.2);
            transform: translateY(-2px);
          }
          75% {
            background-color: rgba(96, 165, 250, 0.15);
            transform: translateY(-1px);
          }
        }
      `}</style>
    </div>
  )
}
