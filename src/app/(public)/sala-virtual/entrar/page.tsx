"use client"

import { Suspense, useState, useCallback, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"
import { Video, VideoOff, Mic, MicOff, Loader2, Shield, Wifi } from "lucide-react"

function EntrarSalaForm() {
  const searchParams = useSearchParams()
  const roomParam = searchParams.get("room") || ""
  const [roomInput, setRoomInput] = useState(roomParam)
  const [step, setStep] = useState(roomParam ? "prejoin" : "welcome")
  const [token, setToken] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [patientName, setPatientName] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || ""

  useEffect(() => {
    if (step === "prejoin") {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((s) => {
          streamRef.current = s
          if (videoRef.current) videoRef.current.srcObject = s
          s.getVideoTracks().forEach((t) => (t.enabled = cameraOn))
          s.getAudioTracks().forEach((t) => (t.enabled = micOn))
        })
        .catch(() => { setCameraOn(false); setMicOn(false) })
    }
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [step])

  const handleConnect = useCallback(async () => {
    setConnecting(true)
    try {
      const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomInput)}&patient=true`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Erro ao conectar")
      }
      const data = await res.json()
      setToken(data.token)
      setConnected(true)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao conectar")
    } finally {
      setConnecting(false)
    }
  }, [roomInput])

  const toggleCamera = () => setCameraOn((c) => { streamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !c)); return !c })
  const toggleMic = () => setMicOn((c) => { streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !c)); return !c })

  // In call
  if (token) {
    return (
      <div className="h-screen">
        <LiveKitRoom
          token={token}
          serverUrl={livekitUrl}
          connect={true}
          video={cameraOn}
          audio={micOn}
          onDisconnected={() => { setToken(null); setConnected(false); setStep("welcome") }}
          style={{ height: "100%" }}
        >
          <VideoConference />
        </LiveKitRoom>
      </div>
    )
  }

  // Pre-join screen
  if (step === "prejoin") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <div className="grid md:grid-cols-5 gap-6">
              {/* Camera preview */}
              <div className="md:col-span-3">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl">
                  {cameraOn ? (
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-white/50">
                        <VideoOff className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">Câmera desligada</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                    <Button size="icon" variant={cameraOn ? "secondary" : "destructive"} onClick={toggleCamera} className="rounded-full h-12 w-12 shadow-lg">
                      {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </Button>
                    <Button size="icon" variant={micOn ? "secondary" : "destructive"} onClick={toggleMic} className="rounded-full h-12 w-12 shadow-lg">
                      {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </Button>
                  </div>
                  {connecting && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                        <p className="text-lg font-medium">Conectando à sala...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="md:col-span-2 flex flex-col justify-center">
                <div className="bg-white/5 backdrop-blur rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-sm text-emerald-400 font-medium">Pronto para entrar</span>
                  </div>
                  <h2 className="text-xl font-bold mb-1">Sala: {roomInput}</h2>
                  <p className="text-sm text-white/60 mb-6">Sua sessão de terapia online está pronta para começar.</p>
                  <div className="space-y-3 mb-6">
                    <Input
                      placeholder="Seu nome (opcional)"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>
                  <Button className="w-full h-12 text-base" size="lg" onClick={handleConnect} disabled={connecting}>
                    {connecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    {connecting ? "Conectando..." : "Entrar na Sala"}
                  </Button>
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs text-white/40">
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

  // Welcome screen
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
                onClick={() => roomInput.trim() && setStep("prejoin")}
                disabled={!roomInput.trim()}
              >
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
