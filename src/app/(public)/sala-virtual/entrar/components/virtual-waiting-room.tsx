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

// Amazing Grace melody (violin): note + duration (seconds) - slow, lyrical tempo
const AMAZING_GRACE = [
  { freq: 392, dur: 1.2 }, { freq: 392, dur: 0.6 }, { freq: 440, dur: 1.0 }, { freq: 493.88, dur: 1.8 },
  { freq: 493.88, dur: 0.8 }, { freq: 440, dur: 1.0 }, { freq: 392, dur: 1.6 },
  { freq: 392, dur: 0.6 }, { freq: 392, dur: 0.8 }, { freq: 440, dur: 1.0 }, { freq: 493.88, dur: 1.8 },
  { freq: 493.88, dur: 0.8 }, { freq: 440, dur: 1.0 }, { freq: 392, dur: 1.6 },
  { freq: 392, dur: 0.6 }, { freq: 493.88, dur: 1.0 }, { freq: 587.33, dur: 1.6 }, { freq: 587.33, dur: 0.8 },
  { freq: 523.25, dur: 1.0 }, { freq: 493.88, dur: 0.8 }, { freq: 440, dur: 1.0 }, { freq: 392, dur: 1.6 },
  { freq: 392, dur: 0.6 }, { freq: 392, dur: 0.8 }, { freq: 440, dur: 1.0 }, { freq: 493.88, dur: 1.8 },
  { freq: 493.88, dur: 0.8 }, { freq: 440, dur: 1.0 }, { freq: 392, dur: 2.0 },
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
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const isPlayingRef = useRef(false)

  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    ctx.resume()
    audioCtxRef.current = ctx
    return () => { ctx.close() }
  }, [])

  useEffect(() => {
    if (soundEnabled && audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume()
    }
  }, [soundEnabled])

  const playNote = useCallback((freq: number, duration: number) => {
    if (!soundEnabled) return
    try {
      const ctx = audioCtxRef.current
      if (!ctx) return
      if (ctx.state === "suspended") ctx.resume()
      const now = ctx.currentTime
      const sustainEnd = now + duration * 0.75
      const releaseEnd = now + duration

      // Master chain: compressor -> destination
      const compressor = ctx.createDynamicsCompressor()
      compressor.threshold.value = -30
      compressor.ratio.value = 4
      compressor.attack.value = 0.01
      compressor.release.value = 0.3
      compressor.connect(ctx.destination)

      const masterGain = ctx.createGain()
      masterGain.gain.setValueAtTime(0, now)
      masterGain.gain.linearRampToValueAtTime(0.18, now + 0.08)
      masterGain.gain.setValueAtTime(0.18, sustainEnd)
      masterGain.gain.exponentialRampToValueAtTime(0.001, releaseEnd)
      masterGain.connect(compressor)

      // Reverb via convolver (simple impulse)
      const convolver = ctx.createConvolver()
      const reverbLen = ctx.sampleRate * 1.5
      const reverbBuf = ctx.createBuffer(2, reverbLen, ctx.sampleRate)
      for (let ch = 0; ch < 2; ch++) {
        const data = reverbBuf.getChannelData(ch)
        for (let i = 0; i < reverbLen; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLen, 2.5)
        }
      }
      convolver.buffer = reverbBuf
      const reverbGain = ctx.createGain()
      reverbGain.gain.value = 0.25
      convolver.connect(reverbGain)
      reverbGain.connect(masterGain)

      // Vibrato LFO
      const vibratoOsc = ctx.createOscillator()
      const vibratoGain = ctx.createGain()
      vibratoOsc.frequency.value = 5.5
      vibratoGain.gain.value = 4.5
      vibratoOsc.connect(vibratoGain)
      vibratoOsc.start(now)
      vibratoOsc.stop(releaseEnd)

      // Sawtooth for string harmonics (main oscillator)
      const addHarmonic = (partial: number, gain: number) => {
        const osc = ctx.createOscillator()
        osc.type = "sawtooth"
        osc.frequency.value = freq * partial
        vibratoGain.connect(osc.frequency)

        const g = ctx.createGain()
        g.gain.setValueAtTime(gain, now)
        g.gain.exponentialRampToValueAtTime(gain * 1.3, now + 0.15)
        g.gain.setValueAtTime(gain * 1.3, sustainEnd - 0.1)
        g.gain.exponentialRampToValueAtTime(0.001, releaseEnd)

        osc.connect(g)
        g.connect(masterGain)
        g.connect(convolver)
        osc.start(now)
        osc.stop(releaseEnd)
      }

      // Violin harmonic spectrum (sawtooth-based)
      addHarmonic(1, 0.12)
      addHarmonic(2, 0.08)
      addHarmonic(3, 0.05)
      addHarmonic(4, 0.03)
      addHarmonic(5, 0.018)
      addHarmonic(6, 0.01)

      // Soft noise for bow texture
      const noiseLen = ctx.sampleRate * duration
      const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate)
      const noiseData = noiseBuf.getChannelData(0)
      for (let i = 0; i < noiseLen; i++) {
        noiseData[i] = (Math.random() * 2 - 1) * 0.5
      }
      const noiseSrc = ctx.createBufferSource()
      noiseSrc.buffer = noiseBuf
      const noiseFilter = ctx.createBiquadFilter()
      noiseFilter.type = "bandpass"
      noiseFilter.frequency.value = freq * 3
      noiseFilter.Q.value = 2
      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(0.008, now)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, releaseEnd)
      noiseSrc.connect(noiseFilter)
      noiseFilter.connect(noiseGain)
      noiseGain.connect(masterGain)
      noiseSrc.start(now)
      noiseSrc.stop(releaseEnd)
    } catch {}
  }, [soundEnabled])

  useEffect(() => {
    if (isPlayingRef.current) return
    isPlayingRef.current = true
    let totalDelay = 0
    AMAZING_GRACE.forEach(({ freq, dur }) => {
      setTimeout(() => playNote(freq, dur), totalDelay * 1000)
      totalDelay += dur * 0.92
    })
    return () => { isPlayingRef.current = false }
  }, [soundEnabled, playNote])

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

  const toggleSound = () => {
    setSoundEnabled(prev => !prev)
  }

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