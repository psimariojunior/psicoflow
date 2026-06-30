"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2, Lightbulb, Music, Volume2, VolumeX } from "lucide-react"

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

// Amazing Grace violin melody - played from /amazing-grace-violin.wav

interface VirtualWaitingRoomProps {
  patientName: string
  connecting: boolean
  onEnterRoom: () => void
  roomName: string
}

export function VirtualWaitingRoom({ patientName, connecting, onEnterRoom, roomName }: VirtualWaitingRoomProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [breathPhase, setBreathPhase] = useState(0)
  const [breathProgress, setBreathProgress] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [audioStarted, setAudioStarted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [waitingId, setWaitingId] = useState<string | null>(null)
  const [approvalStatus, setApprovalStatus] = useState<"registering" | "waiting" | "approved" | "rejected" | "error">("registering")

  // Register as waiting patient
  useEffect(() => {
    if (!roomName || !patientName) return
    let cancelled = false
    let retryCount = 0
    const maxRetries = 3

    const register = async () => {
      try {
        const res = await fetch("/api/livekit/waiting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: roomName, name: patientName || "Paciente" }),
        })
        if (!res.ok) throw new Error("Failed to register")
        const data = await res.json()
        if (!cancelled) {
          setWaitingId(data.id)
          setApprovalStatus("waiting")
        }
      } catch {
        if (!cancelled && retryCount < maxRetries) {
          retryCount++
          setTimeout(register, 2000)
        } else if (!cancelled) {
          setApprovalStatus("error")
        }
      }
    }
    register()
    return () => { cancelled = true }
  }, [roomName, patientName])

  // Poll for approval
  useEffect(() => {
    if (!waitingId || approvalStatus !== "waiting") return
    let cancelled = false

    const poll = async () => {
      try {
        const res = await fetch(`/api/livekit/waiting?room=${encodeURIComponent(roomName)}&id=${waitingId}`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled && data.status === "approved") {
          setApprovalStatus("approved")
          onEnterRoom()
        } else if (!cancelled && data.status === "rejected") {
          setApprovalStatus("rejected")
        }
      } catch {}
    }

    const interval = setInterval(poll, 2000)
    poll()
    return () => { cancelled = true; clearInterval(interval) }
  }, [waitingId, approvalStatus, roomName, onEnterRoom])

  const startAudio = useCallback(() => {
    if (audioStarted) return
    setAudioStarted(true)
    setSoundEnabled(true)
    const audio = new Audio("/amazing-grace.mp3")
    audio.loop = true
    audio.volume = 0.5
    audioRef.current = audio
    audio.play().catch(() => {})
  }, [audioStarted])

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev
      if (audioRef.current) {
        if (next) audioRef.current.play().catch(() => {})
        else audioRef.current.pause()
      }
      return next
    })
  }, [])

  // Stop audio when component unmounts (when entering the room)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current = null
      }
    }
  }, [])

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
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-[#0a1120] to-slate-900 relative">
      {/* Audio activation overlay */}
      {!audioStarted && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer"
          onClick={startAudio}
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 border-2 border-teal-400/40 flex items-center justify-center mx-auto animate-pulse">
              <Volume2 className="h-8 w-8 text-teal-400" />
            </div>
            <div>
              <p className="text-white font-medium">Clique para ativar o som</p>
              <p className="text-white/50 text-sm mt-1">Amazing Grace — Violino</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="w-full max-w-lg relative z-10 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-white">
              Olá, {patientName || "Paciente"}
            </h2>
            <p className="text-teal-300/70 text-sm font-light">
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
                      ? "w-10 h-full bg-white/10 hover:bg-teal-400/30"
                      : "w-7 h-3/5 bg-teal-800/40 hover:bg-teal-400/40"
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
                className="absolute inset-0 rounded-full border-2 border-teal-400/30"
                animate={{ scale }}
                transition={{ duration: 0.05, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-4 rounded-full bg-teal-500/10 border border-teal-400/20"
                animate={{ scale }}
                transition={{ duration: 0.05, ease: "linear" }}
              />
              <span className="text-teal-300 text-sm font-medium z-10">
                {currentPhase.text}
              </span>
            </div>
            <p className="text-xs text-teal-400/60 font-light tracking-wider uppercase">
              Exercício de respiração
            </p>
          </div>

          <div className="flex items-center justify-between bg-white/[0.04] rounded-xl px-4 py-2 ring-1 ring-white/[0.06]">
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Music className="h-3.5 w-3.5" />
              <span>Amazing Grace — Violino</span>
            </div>
            <button onClick={toggleSound} className="text-white/50 hover:text-white transition-colors p-1" aria-label={soundEnabled ? "Desativar som" : "Ativar som"}>
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
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

          <div className="space-y-3">
            {approvalStatus === "waiting" && (
              <div className="flex items-center justify-center gap-2 text-teal-300 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Aguardando aprovação do psicólogo...
              </div>
            )}
            {approvalStatus === "approved" && (
              <div className="flex items-center justify-center gap-2 text-emerald-300 text-sm">
                Aprovado! Entrando na sala...
              </div>
            )}
            {approvalStatus === "rejected" && (
              <div className="text-center space-y-3">
                <p className="text-red-300 text-sm">A entrada foi recusada pelo psicólogo.</p>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => { setApprovalStatus("registering"); setWaitingId(null) }}>
                  Tentar novamente
                </Button>
              </div>
            )}
            {approvalStatus === "error" && (
              <div className="text-center space-y-3">
                <p className="text-amber-300 text-sm">Erro ao conectar à sala de espera.</p>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => { setApprovalStatus("registering"); setWaitingId(null) }}>
                  Tentar novamente
                </Button>
              </div>
            )}
            {approvalStatus === "registering" && (
              <p className="text-teal-300/60 text-xs text-center">Conectando à sala de espera...</p>
            )}
          </div>
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