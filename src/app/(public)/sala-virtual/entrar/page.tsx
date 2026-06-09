"use client"

import { Suspense, useState, useCallback, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import type { Room } from "livekit-client"
import "@livekit/components-styles"
import { Video, VideoOff, Mic, MicOff, Loader2, Camera, LogOut, ArrowLeft, User, Shield, Wifi } from "lucide-react"
import toast from "react-hot-toast"

function EntrarSalaForm() {
  const searchParams = useSearchParams()
  const roomParam = searchParams.get("room") || ""
  const [roomInput, setRoomInput] = useState(roomParam)
  const [step, setStep] = useState(roomParam ? "prejoin" : "welcome")
  const [token, setToken] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [patientName, setPatientName] = useState("")
  const [psychologistPresent, setPsychologistPresent] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || ""

  const handleConnect = useCallback(async () => {
    setConnecting(true)
    const nameParam = patientName.trim() ? `&name=${encodeURIComponent(patientName.trim())}` : ""
    try {
      const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomInput)}&patient=true${nameParam}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Erro ao conectar")
      }
      const data = await res.json()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      setToken(data.token)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao conectar")
      setConnecting(false)
    }
  }, [roomInput, patientName])

  const startCamera = useCallback(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((s) => {
        streamRef.current = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
        }
      })
      .catch(() => {
        toast.error("Permita acesso à câmera e microfone nas configurações do navegador")
      })
  }, [])

  const toggleCamera = () => setCameraOn((c) => {
    const next = !c
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => (t.enabled = next))
    } else if (next) {
      startCamera()
    }
    return next
  })

  const toggleMic = () => setMicOn((c) => {
    const next = !c
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next))
    return next
  })

  const handleDisconnected = useCallback(() => {
    setToken(null)
    setStep("ended")
    setPsychologistPresent(false)
  }, [])

  const handleLeaveCall = useCallback(() => {
    setToken(null)
    setStep("ended")
    setPsychologistPresent(false)
  }, [])

  useEffect(() => {
    if (step === "prejoin" && !streamRef.current) {
      startCamera()
    }
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null }
  }, [step, startCamera])

  if (token) {
    return (
      <div className="h-screen relative bg-black overflow-hidden">
        <LiveKitRoom
          token={token}
          serverUrl={livekitUrl}
          connect={true}
          video={cameraOn}
          audio={micOn}
          onDisconnected={handleDisconnected}
          onConnected={(room: Room) => setPsychologistPresent(room.remoteParticipants.size > 0)}
          onParticipantConnected={() => setPsychologistPresent(true)}
          onParticipantDisconnected={() => setPsychologistPresent(false)}
          style={{ height: "100%" }}
        >
          <VideoConference />
        </LiveKitRoom>

        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-white/10 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          <Camera className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-medium">{roomInput}</span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLeaveCall}
          className="absolute top-4 right-4 z-30 text-white/70 hover:text-white hover:bg-white/10 border border-white/10 rounded-full px-4"
        >
          <LogOut className="mr-1.5 h-4 w-4" /> Sair
        </Button>

        {!psychologistPresent && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-b from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm">
            <div className="relative mb-8">
              <div className="absolute -inset-4 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-2xl shadow-emerald-500/30">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Aguardando psicólogo</h2>
            <p className="text-white/50 text-sm mb-6 max-w-xs text-center">
              Você está conectado à sala. O psicólogo entrará em instantes.
            </p>
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
              <Camera className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-white/60 text-xs font-mono">{roomInput}</span>
            </div>
            {patientName && (
              <div className="mt-4 flex items-center gap-2 text-white/40 text-xs">
                <User className="h-3 w-3" />
                <span>Conectado como <span className="text-white/70 font-medium">{patientName}</span></span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (step === "prejoin") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-5xl">
            <button
              onClick={() => setStep("welcome")}
              className="flex items-center gap-1.5 text-white/50 hover:text-white/80 text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <div className="grid md:grid-cols-5 gap-6">
              <div className="md:col-span-3 relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl ring-1 ring-white/10">
                <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover scale-x-[-1] ${streamRef.current ? "block" : "hidden"}`} />
                <div className={`absolute inset-0 flex items-center justify-center ${streamRef.current ? "hidden" : "flex"}`}>
                  <div className="text-center text-white/40">
                    <div className="relative mx-auto mb-4 h-16 w-16">
                      <div className="absolute inset-0 rounded-full bg-white/5 animate-pulse" />
                      <Camera className="relative h-16 w-16 mx-auto p-3" />
                    </div>
                    <p className="text-sm">Ativando câmera...</p>
                  </div>
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                  <Button size="icon" variant={cameraOn ? "secondary" : "destructive"} onClick={toggleCamera} className="rounded-full h-12 w-12 shadow-lg ring-1 ring-white/20">
                    {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </Button>
                  <Button size="icon" variant={micOn ? "secondary" : "destructive"} onClick={toggleMic} className="rounded-full h-12 w-12 shadow-lg ring-1 ring-white/20">
                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </Button>
                </div>
                {connecting && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-sm">
                    <div className="text-center text-white">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-emerald-400" />
                      <p className="text-lg font-medium">Conectando à sala...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="md:col-span-2 flex flex-col justify-center">
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 text-white ring-1 ring-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium uppercase tracking-wider">Pronto</span>
                  </div>
                  <h2 className="text-xl font-bold mb-1">Sala: {roomInput}</h2>
                  <p className="text-sm text-white/50 mb-6">Sua sessão de terapia está pronta.</p>
                  <div className="space-y-3 mb-6">
                    <Input
                      placeholder="Seu nome (opcional)"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-11"
                    />
                  </div>
                  <Button className="w-full h-12 text-base font-medium" size="lg" onClick={handleConnect} disabled={connecting}>
                    {connecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    {connecting ? "Conectando..." : "Entrar na Sala"}
                  </Button>
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/30">
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Criptografado</span>
                    <span className="flex items-center gap-1"><Wifi className="h-3 w-3" /> LiveKit Cloud</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === "ended") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm text-center">
            <div className="relative mx-auto mb-8 h-20 w-20">
              <div className="absolute inset-0 rounded-full bg-white/5" />
              <VideoOff className="relative h-10 w-10 mx-auto mt-5 text-white/30" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Conexão encerrada</h1>
            <p className="text-white/50 mb-8">Obrigado por utilizar o PsicoFlow.</p>
            <Button
              className="w-full h-12 text-base font-medium"
              size="lg"
              onClick={() => { setStep("welcome"); setRoomInput("") }}
            >
              <Camera className="mr-2 h-5 w-5" />
              Entrar em outra sala
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm text-center">
          <div className="mb-10">
            <div className="relative mx-auto mb-6 h-20 w-20">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-blue-500/30 shadow-lg" />
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary/40 to-blue-500/40 animate-pulse" />
              <Video className="relative h-10 w-10 mx-auto mt-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Sala Virtual</h1>
            <p className="text-white/50">Sessão de terapia online com seu psicólogo</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 ring-1 ring-white/10 shadow-2xl">
            <div className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wider">Código da Sala</label>
                <Input
                  placeholder="Digite o código fornecido"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12 text-center text-lg tracking-widest"
                />
              </div>
              <Button
                className="w-full h-12 text-base font-medium"
                size="lg"
                onClick={() => { if (roomInput.trim()) { setStep("prejoin") } }}
                disabled={!roomInput.trim()}
              >
                <Camera className="mr-2 h-5 w-5" />
                Continuar
              </Button>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Shield, label: "Seguro" },
                  { icon: Wifi, label: "Estável" },
                  { icon: Video, label: "HD" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="text-center">
                    <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-1.5 ring-1 ring-white/10">
                      <Icon className="h-4 w-4 text-white/40" />
                    </div>
                    <span className="text-xs text-white/40">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-8 text-xs text-white/20">
            PsicoFlow — Tecnologia a serviço da saúde mental
          </p>
        </div>
      </div>
    </div>
  )
}

export default function EntrarSalaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    }>
      <EntrarSalaForm />
    </Suspense>
  )
}
