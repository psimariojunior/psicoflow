"use client"

import { Suspense, useState, useCallback, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import type { Room } from "livekit-client"
import "@livekit/components-styles"
import { Video, VideoOff, Mic, MicOff, Loader2, Shield, Wifi, Camera, LogOut, ArrowLeft } from "lucide-react"
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
      <div className="h-screen relative bg-black">
        <div className="absolute top-4 left-4 z-30 flex items-center gap-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur">
          <Camera className="h-3.5 w-3.5 text-emerald-400" />
          {roomInput}
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleLeaveCall}
          className="absolute top-4 right-4 z-30"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
        {!psychologistPresent && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
            <div className="text-center text-white">
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-emerald-400" />
              <h3 className="text-xl font-bold mb-1">Aguardando psicólogo</h3>
              <p className="text-sm text-white/60">O profissional será notificado da sua presença.</p>
            </div>
          </div>
        )}
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
      </div>
    )
  }

  if (step === "prejoin") {
    return (
      <div className="flex min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <button
              onClick={() => setStep("welcome")}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>

            <div className="bg-white/[0.05] backdrop-blur-2xl rounded-3xl p-6 ring-1 ring-white/10 shadow-2xl">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-5 shadow-xl">
                <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover scale-x-[-1] ${streamRef.current ? "block" : "hidden"}`} />
                <div className={`absolute inset-0 flex items-center justify-center ${streamRef.current ? "hidden" : "flex"}`}>
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-14 w-14 rounded-full bg-white/5 flex items-center justify-center">
                      <Camera className="h-7 w-7 text-white/30" />
                    </div>
                    <p className="text-sm text-white/30">Preparando sua câmera...</p>
                  </div>
                </div>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                  <Button size="icon" variant={cameraOn ? "secondary" : "destructive"} onClick={toggleCamera} className="rounded-full h-11 w-11 shadow-lg ring-1 ring-white/20">
                    {cameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant={micOn ? "secondary" : "destructive"} onClick={toggleMic} className="rounded-full h-11 w-11 shadow-lg ring-1 ring-white/20">
                    {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
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

              <div className="flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/30" />
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Pronto</span>
              </div>

              <h2 className="text-xl font-bold text-white mb-1">Sala {roomInput}</h2>
              <p className="text-sm text-white/50 mb-5 leading-relaxed">Sua sessão é em um ambiente seguro e acolhedor. Fique à vontade.</p>

              <div className="space-y-3 mb-5">
                <Input
                  placeholder="Como prefere ser chamado?"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-11"
                />
              </div>

              <Button className="w-full h-12 text-base font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/25 border-0" size="lg" onClick={handleConnect} disabled={connecting}>
                {connecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {connecting ? "Conectando..." : "Entrar na Sala"}
              </Button>

              <div className="flex items-center justify-center gap-5 mt-4 text-xs text-white/30">
                <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> Criptografado</span>
                <span className="flex items-center gap-1.5"><Wifi className="h-3.5 w-3.5" /> Conexão segura</span>
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
          <div className="w-full max-w-md text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/5 mb-6">
                <VideoOff className="h-10 w-10 text-white/40" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Conexão encerrada</h1>
              <p className="text-white/60">Obrigado por utilizar o PsicoFlow.</p>
            </div>
            <Button
              className="w-full h-12 text-base"
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
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary/30 to-blue-500/30 mb-6 shadow-lg">
              <Video className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Sala Virtual</h1>
            <p className="text-white/60">Sessão de terapia online com seu psicólogo</p>
          </div>

          <div className="bg-white/5 backdrop-blur rounded-2xl p-8 shadow-xl">
            <div className="space-y-4">
              <div className="text-left">
                <label className="block text-sm font-medium text-white/80 mb-2">Código da Sala</label>
                <Input
                  placeholder="Digite o código fornecido pelo psicólogo"
                  value={roomInput}
                  onChange={(e) => setRoomInput(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-12 text-center text-lg tracking-widest"
                />
              </div>
              <Button
                className="w-full h-12 text-base"
                size="lg"
                onClick={() => { if (roomInput.trim()) { setStep("prejoin") } }}
                disabled={!roomInput.trim()}
              >
                <Camera className="mr-2 h-5 w-5" />
                Continuar
              </Button>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="grid grid-cols-3 gap-4 text-xs text-white/40">
                <div className="text-center">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-1">
                    <Shield className="h-4 w-4" />
                  </div>
                  Seguro
                </div>
                <div className="text-center">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-1">
                    <Wifi className="h-4 w-4" />
                  </div>
                  Estável
                </div>
                <div className="text-center">
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-1">
                    <Video className="h-4 w-4" />
                  </div>
                  HD
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-xs text-white/30">
            PsicoFlow &mdash; Tecnologia a serviço da saúde mental
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <EntrarSalaForm />
    </Suspense>
  )
}
