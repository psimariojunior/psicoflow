"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LiveKitRoom, useRemoteParticipants, VideoTrack, useRoomContext, RoomAudioRenderer } from "@livekit/components-react"
import { Track, RoomEvent, type LocalTrackPublication } from "livekit-client"
import "@livekit/components-styles"
import { Video, VideoOff, Mic, MicOff, Loader2, Link2, Copy, LogOut, User, Shield, Zap } from "lucide-react"
import toast from "react-hot-toast"
import { ErrorBoundary } from "@/components/error-boundary"

export default function VirtualRoomPage() {
  const [roomName, setRoomName] = useState(`sala-${Date.now()}`)
  const [token, setToken] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [ending, setEnding] = useState(false)
  const [origin, setOrigin] = useState("")

  useEffect(() => { setOrigin(window.location.origin) }, [])

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://gestao-de-psicologia-0khxxf01.livekit.cloud"

  const sanitize = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, "-")

  const handleConnect = useCallback(async () => {
    setConnecting(true)
    try {
      const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(sanitize(roomName))}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Erro ao gerar token")
      }
      const data = await res.json()
      setToken(data.token)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao conectar")
    } finally {
      setConnecting(false)
    }
  }, [roomName])

  const handleEndRoom = useCallback(async () => {
    setEnding(true)
    try {
      const res = await fetch("/api/livekit/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: roomName }),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || "Erro ao encerrar")
      }
      toast.success("Sala encerrada!")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao encerrar sala")
      setEnding(false)
      return
    }
    setEnding(false)
    setToken(null)
    setRoomName(`sala-${Date.now()}`)
  }, [roomName])

  const patientLink = origin ? `${origin}/sala-virtual/entrar?room=${encodeURIComponent(sanitize(roomName))}` : ""

  if (token) {
    return (
      <ErrorBoundary>
        <div className="h-[calc(100vh-4rem)] flex flex-col">
          <div className="flex items-center gap-2 px-4 py-2 bg-background border-b shrink-0">
            <span className="text-sm font-medium flex-1">Sala: {roomName}</span>
            <Button variant="outline" size="sm" onClick={() => {
              navigator.clipboard.writeText(patientLink)
              toast.success("Link copiado!")
            }}>
              <Copy className="mr-2 h-4 w-4" /> Copiar Link
            </Button>
            <Button variant="destructive" size="sm" onClick={handleEndRoom} disabled={ending}>
              {ending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
              {ending ? "Encerrando..." : "Encerrar Sala"}
            </Button>
          </div>
          <div className="flex-1">
            <LiveKitRoom
              token={token}
              serverUrl={livekitUrl}
              connect={true}
              video={true}
              audio={{ echoCancellation: true, noiseSuppression: true, autoGainControl: true }}
              onDisconnected={() => setToken(null)}
              onError={(e) => console.error("LiveKit error:", e)}
              style={{ height: "100%" }}
            >
              <ErrorBoundary>
                <RoomAudioRenderer />
                <PsychologistInCall roomName={roomName} onEndRoom={handleEndRoom} />
              </ErrorBoundary>
            </LiveKitRoom>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 mx-auto">
            <Video className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Sala Virtual</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Inicie uma videochamada segura com seu paciente. Compartilhe o link e aguarde a conexão.
          </p>
        </div>

        <Card className="border-0 shadow-2xl shadow-blue-500/5">
          <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-xl" />
          <CardContent className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Sala</label>
              <Input 
                value={roomName} 
                onChange={(e) => setRoomName(e.target.value)} 
                placeholder="Ex: sala-terapia-001"
                className="h-11" 
              />
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                  <Link2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Link para o paciente</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{patientLink || "Digite o nome da sala"}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    navigator.clipboard.writeText(patientLink)
                    toast.success("Link copiado!")
                  }}
                  disabled={!patientLink}
                >
                  Copiar
                </Button>
              </div>
            </div>

            <Button 
              size="lg" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/25" 
              onClick={handleConnect} 
              disabled={connecting || !roomName}
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-5 w-5" />
                  Entrar na Sala
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mx-auto">
              <Video className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-muted-foreground">HD Automático</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mx-auto">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-muted-foreground">Criptografado</p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center mx-auto">
              <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-xs text-muted-foreground">Baixa Latência</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PsychologistInCall({ roomName, onEndRoom }: { roomName: string; onEndRoom: () => void }) {
  const [callDuration, setCallDuration] = useState(0)
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [localCamPub, setLocalCamPub] = useState<LocalTrackPublication | null>(null)
  const [remoteCamPub, setRemoteCamPub] = useState<any>(null)
  const [remoteScreenPub, setRemoteScreenPub] = useState<any>(null)

  const room = useRoomContext()
  const remoteParticipants = useRemoteParticipants()
  const hasRemote = remoteParticipants && remoteParticipants.length > 0
  const localParticipant = room?.localParticipant

  useEffect(() => {
    if (!room) return

    const updateLocalCam = () => {
      try {
        const pub = room.localParticipant.getTrackPublication(Track.Source.Camera)
        setLocalCamPub((pub as LocalTrackPublication) || null)
      } catch {}
    }

    const updateRemoteTracks = () => {
      try {
        const remotes = Array.from(room.remoteParticipants.values())
        let camPub = null
        let screenPub = null
        for (const p of remotes) {
          const cam = p.getTrackPublication(Track.Source.Camera)
          if (cam && cam.isSubscribed) camPub = { participant: p, source: Track.Source.Camera, publication: cam }
          const screen = p.getTrackPublication(Track.Source.ScreenShare)
          if (screen && screen.isSubscribed) screenPub = { participant: p, source: Track.Source.ScreenShare, publication: screen }
        }
        setRemoteCamPub(camPub)
        setRemoteScreenPub(screenPub)
      } catch {}
    }

    updateLocalCam()
    updateRemoteTracks()

    room.on(RoomEvent.LocalTrackPublished, updateLocalCam)
    room.on(RoomEvent.LocalTrackUnpublished, updateLocalCam)
    room.on(RoomEvent.TrackSubscribed, updateRemoteTracks)
    room.on(RoomEvent.TrackUnsubscribed, updateRemoteTracks)
    room.on(RoomEvent.ParticipantConnected, updateRemoteTracks)
    room.on(RoomEvent.ParticipantDisconnected, updateRemoteTracks)

    return () => {
      room.off(RoomEvent.LocalTrackPublished, updateLocalCam)
      room.off(RoomEvent.LocalTrackUnpublished, updateLocalCam)
      room.off(RoomEvent.TrackSubscribed, updateRemoteTracks)
      room.off(RoomEvent.TrackUnsubscribed, updateRemoteTracks)
      room.off(RoomEvent.ParticipantConnected, updateRemoteTracks)
      room.off(RoomEvent.ParticipantDisconnected, updateRemoteTracks)
    }
  }, [room])

  useEffect(() => {
    const id = setInterval(() => setCallDuration(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const toggleCam = () => {
    localParticipant?.setCameraEnabled(!camOn)
    setCamOn(prev => !prev)
  }
  const toggleMic = () => {
    localParticipant?.setMicrophoneEnabled(!micOn)
    setMicOn(prev => !prev)
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const primaryTrack = remoteScreenPub || remoteCamPub
  const remoteName = hasRemote ? (remoteParticipants[0]?.name || remoteParticipants[0]?.identity || "Paciente") : ""

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Main video - remote participant */}
      <div className="absolute inset-0">
        {primaryTrack ? (
          <>
            <VideoTrack trackRef={primaryTrack} className="w-full h-full object-contain" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/30 flex items-center justify-center mx-auto">
                <User className="h-10 w-10 text-blue-400/60" />
              </div>
              <div>
                <p className="text-blue-300/80 text-sm font-medium">Aguardando paciente</p>
                <p className="text-blue-400/40 text-xs mt-1">O paciente entrará em breve</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Remote participant name + connection status */}
      {hasRemote && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-white/10 shadow-lg">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
            <span className="text-xs md:text-sm font-medium">{remoteName}</span>
          </div>
          <div className="bg-black/40 backdrop-blur-xl text-white/70 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border border-white/10">
            <span className="text-[10px] md:text-xs font-mono">{formatTime(callDuration)}</span>
          </div>
        </div>
      )}

      {/* Local video - picture in picture */}
      <div className="absolute top-3 right-3 z-20 md:top-4 md:right-4">
        <div className="relative w-20 h-15 md:w-48 md:h-36 rounded-lg md:rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
          {localCamPub && localParticipant ? (
            <>
              <VideoTrack trackRef={{ participant: localParticipant, source: Track.Source.Camera, publication: localCamPub }} className="w-full h-full object-contain scale-x-[-1]" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-8 pointer-events-none" />
              <div className="absolute bottom-1 left-2">
                <span className="text-[10px] text-white/80 font-medium bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">Você</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <div className="text-center">
                <Video className={`h-5 w-5 mx-auto mb-1 ${camOn ? 'text-blue-400' : 'text-slate-500'}`} />
                <p className="text-[10px] text-slate-500">{camOn ? 'Câmera' : 'Desligada'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="flex items-center justify-center gap-3 pb-6 md:pb-8">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10 shadow-2xl">
            <button
              onClick={toggleCam}
              className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                camOn 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
              }`}
              aria-label="Alternar câmera"
            >
              {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              {!camOn && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />}
            </button>

            <button
              onClick={toggleMic}
              className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                micOn 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
              }`}
              aria-label="Alternar microfone"
            >
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              {!micOn && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />}
            </button>

            <div className="w-px h-8 bg-white/10 mx-1" />

            <button
              onClick={onEndRoom}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-lg shadow-red-600/25"
            >
              <LogOut className="h-4 w-4" />
              Encerrar
            </button>
          </div>
        </div>
      </div>

      {/* Room info badge */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xl text-white/50 px-3 py-1.5 rounded-lg border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span className="text-[11px] font-medium">{roomName}</span>
        </div>
      </div>
    </div>
  )
}
