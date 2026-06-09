"use client"

import { Suspense, useState, useCallback, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LiveKitRoom, VideoTrack, useRemoteParticipants, useTracks, useLocalParticipant } from "@livekit/components-react"
import { Track } from "livekit-client"
import "@livekit/components-styles"
import { Video, VideoOff, Mic, MicOff, Loader2, Shield, Wifi, Camera, LogOut, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"

function ParticipantWatcher({ onParticipantsChange }: { onParticipantsChange: (hasRemote: boolean) => void }) {
  const participants = useRemoteParticipants()
  useEffect(() => { onParticipantsChange(participants.length > 0) }, [participants, onParticipantsChange])
  return null
}

function InCallUI({ roomName, onLeave }: { roomName: string; onLeave: () => void }) {
  const { localParticipant, isCameraEnabled, isMicrophoneEnabled, cameraTrack } = useLocalParticipant()
  const cameraTracks = useTracks([Track.Source.Camera, Track.Source.ScreenShare])
  const localVideoRef = useRef<HTMLVideoElement>(null)

  const remoteVideoTrack = cameraTracks.find(t => !t.participant.isLocal && t.source === Track.Source.Camera)
  const screenTrack = cameraTracks.find(t => !t.participant.isLocal && t.source === Track.Source.ScreenShare)
  const primaryTrack = screenTrack || remoteVideoTrack

  useEffect(() => {
    if (localVideoRef.current && cameraTrack?.track) {
      const stream = new MediaStream([cameraTrack.track.mediaStreamTrack])
      localVideoRef.current.srcObject = stream
    }
  }, [cameraTrack])

  const toggleCam = useCallback(() => {
    localParticipant?.setCameraEnabled(!isCameraEnabled)
  }, [isCameraEnabled, localParticipant])

  const toggleMic = useCallback(() => {
    localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled)
  }, [isMicrophoneEnabled, localParticipant])

  return (
    <div className="relative h-full w-full bg-black">
      <div className="absolute inset-0">
        {primaryTrack ? (
          <VideoTrack trackRef={primaryTrack} className="w-full h-full object-contain" />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-slate-900 to-black">
            <div className="text-center text-white px-6">
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-emerald-400" />
              <h3 className="text-base md:text-lg font-bold mb-1">Aguardando psicólogo</h3>
              <p className="text-sm text-white/60">Em breve o profissional entrará na sala.</p>
            </div>
          </div>
        )}
      </div>

      <video ref={localVideoRef} autoPlay muted playsInline className={`absolute top-4 right-4 z-20 w-28 md:w-36 aspect-[3/4] rounded-2xl shadow-2xl ring-2 ring-white/20 object-cover scale-x-[-1] ${isCameraEnabled && cameraTrack ? 'block' : 'hidden'}`} />

      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur">
        <Camera className="h-3.5 w-3.5 text-emerald-400" />
        {roomName}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 md:gap-4 bg-black/60 backdrop-blur-lg rounded-full px-4 md:px-6 py-3 ring-1 ring-white/10">
        <Button size="icon" variant={isCameraEnabled ? "secondary" : "destructive"} onClick={toggleCam} className="rounded-full h-11 w-11 hover:scale-105 active:scale-95 transition-transform">
          {isCameraEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        <Button size="icon" variant={isMicrophoneEnabled ? "secondary" : "destructive"} onClick={toggleMic} className="rounded-full h-11 w-11 hover:scale-105 active:scale-95 transition-transform">
          {isMicrophoneEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <div className="w-px h-6 bg-white/10" />
        <Button variant="destructive" size="icon" onClick={onLeave} className="rounded-full h-11 w-11 hover:scale-105 active:scale-95 transition-transform">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

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

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
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
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null }
  }, [])

  if (token) {
    return (
      <div className="h-screen relative bg-black">
        <LiveKitRoom
          token={token}
          serverUrl={livekitUrl}
          connect={true}
          video={cameraOn}
          audio={micOn}
          onDisconnected={handleDisconnected}
          style={{ height: "100%" }}
        >
          <ParticipantWatcher onParticipantsChange={setPsychologistPresent} />
          <InCallUI roomName={roomInput} onLeave={handleLeaveCall} />
        </LiveKitRoom>
      </div>
    )
  }

  if (step === "prejoin") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-[#0a1120] to-slate-900">
        <div className="flex-1 flex items-center justify-center p-4 relative">
          {/* Decorative background elements */}
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="w-full max-w-4xl relative z-10">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => { stopCamera(); setStep("welcome") }}
                className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-all hover:gap-3"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar
              </button>
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <Shield className="h-3.5 w-3.5" />
                Sala {roomInput}
              </div>
            </div>

            <div className="grid md:grid-cols-5 gap-6">
              {/* Left — camera preview */}
              <div className="md:col-span-3">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] ring-1 ring-white/10 shadow-2xl backdrop-blur-xl">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-800 to-black">
                    <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover scale-x-[-1] ${streamRef.current ? "block" : "hidden"}`} />

                    {!streamRef.current && !connecting && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8">
                        <div className="h-20 w-20 rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.08] flex items-center justify-center">
                          <Camera className="h-9 w-9 text-white/30" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-white/50 text-base font-medium">Câmera desativada</p>
                          <p className="text-white/30 text-sm">Ative sua câmera para ver como aparece</p>
                        </div>
                        <Button variant="secondary" size="default" onClick={startCamera} className="rounded-full px-6 shadow-xl">
                          <Camera className="mr-2 h-4 w-4" /> Ativar Câmera
                        </Button>
                      </div>
                    )}

                    {streamRef.current && (
                      <div className="absolute inset-0">
                        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md ring-1 ring-white/10">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50" />
                          Câmera ativa
                        </div>
                        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-4">
                          <Button size="icon" variant={cameraOn ? "secondary" : "destructive"} onClick={toggleCamera} className="rounded-full h-12 w-12 shadow-2xl ring-1 ring-white/20 hover:scale-105 transition-transform">
                            {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                          </Button>
                          <Button size="icon" variant={micOn ? "secondary" : "destructive"} onClick={toggleMic} className="rounded-full h-12 w-12 shadow-2xl ring-1 ring-white/20 hover:scale-105 transition-transform">
                            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                          </Button>
                        </div>
                      </div>
                    )}

                    {connecting && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-sm">
                        <div className="text-center text-white">
                          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-emerald-400" />
                          <p className="text-lg font-medium">Conectando à sala...</p>
                          <p className="text-sm text-white/50 mt-1">Preparando ambiente seguro</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right — informações */}
              <div className="md:col-span-2 flex flex-col justify-center space-y-6">
                {/* Saudação */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50" />
                    <span className="text-xs text-emerald-400 font-semibold uppercase tracking-[0.2em]">Você está na sala</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    Pronto para sua<br />sessão?
                  </h2>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Respire fundo. Este é um espaço seguro e acolhedor para você compartilhar.
                    Seu psicólogo entrará em instantes.
                  </p>
                </div>

                {/* Input nome */}
                <div className="space-y-2">
                  <label className="text-xs text-white/40 font-medium uppercase tracking-wider">Como prefere ser chamado</label>
                  <div className="relative">
                    <Input
                      placeholder="Seu nome"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="bg-white/[0.06] border-white/10 text-white placeholder:text-white/20 h-12 pl-4 pr-10 rounded-xl text-base focus:border-emerald-500/50 focus:ring-emerald-500/20 transition-all"
                    />
                    {patientName.trim() && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-lg">&#10003;</span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Shield, label: "Privacidade", desc: "Criptografia" },
                    { icon: Wifi, label: "Conexão", desc: "Estável" },
                    { icon: MicOff, label: "Áudio", desc: "Opcional" },
                  ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="bg-white/[0.04] rounded-xl p-3 text-center ring-1 ring-white/[0.06]">
                      <Icon className="h-4 w-4 text-emerald-400/70 mx-auto mb-1.5" />
                      <p className="text-[11px] text-white/60 font-medium">{label}</p>
                      <p className="text-[10px] text-white/30">{desc}</p>
                    </div>
                  ))}
                </div>

                {/* Botão */}
                <Button
                  className="w-full h-13 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  size="lg"
                  onClick={handleConnect}
                  disabled={connecting}
                >
                  {connecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {connecting ? "Conectando..." : "Entrar na Sala"}
                </Button>

                <p className="text-[11px] text-white/25 text-center leading-relaxed">
                  Ao entrar, você aceita os termos de uso e política de privacidade do PsicoFlow.
                </p>
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
                onClick={() => { if (roomInput.trim()) { setStep("prejoin"); startCamera() } }}
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
