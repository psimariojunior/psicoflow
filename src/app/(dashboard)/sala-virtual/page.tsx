"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LiveKitRoom, useRemoteParticipants, VideoTrack, useRoomContext } from "@livekit/components-react"
import { Track, RoomEvent, type LocalTrackPublication } from "livekit-client"
import "@livekit/components-styles"
import { Video, VideoOff, Mic, MicOff, Loader2, Link2, Copy, LogOut, User } from "lucide-react"
import toast from "react-hot-toast"
import { ErrorBoundary } from "@/components/error-boundary"

export default function VirtualRoomPage() {
  const [roomName, setRoomName] = useState(`sala-${Date.now()}`)
  const [token, setToken] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [ending, setEnding] = useState(false)
  const [origin, setOrigin] = useState("")

  useEffect(() => { setOrigin(window.location.origin) }, [])

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://gestao-de-psicologia-sx5sdgua.livekit.cloud"

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
                <PsychologistInCall />
              </ErrorBoundary>
            </LiveKitRoom>
          </div>
        </div>
      </ErrorBoundary>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sala Virtual</h2>
          <p className="text-muted-foreground">Videochamada com qualidade profissional via LiveKit</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Compartilhar</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">Compartilhe este link com o paciente.</p>
            <div>
              <label className="text-xs font-medium">Nome da Sala</label>
              <Input value={roomName} onChange={(e) => setRoomName(e.target.value)} className="text-xs mt-1" />
            </div>
            <Button variant="outline" className="w-full" size="sm" onClick={() => {
              navigator.clipboard.writeText(patientLink)
              toast.success("Link copiado!")
            }}>
              <Link2 className="mr-2 h-4 w-4" /> Copiar Link do Paciente
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardContent className="p-0 relative">
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-t-xl">
                <div className="text-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 mx-auto mb-4">
                    <Video className="h-10 w-10" />
                  </div>
                  <p className="text-lg font-medium">Sala: {roomName}</p>
                  <p className="text-sm text-white/60 mb-4">LiveKit Cloud — funciona de qualquer rede</p>
                  <Button variant="secondary" size="lg" onClick={handleConnect} disabled={connecting}>
                    {connecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                    {connecting ? "Conectando..." : "Entrar na Sala"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Como funciona</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Conexão via LiveKit Cloud com servidor TURN automático.</p>
            <p>Funciona de qualquer rede. Qualidade adaptativa conforme a internet do paciente.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PsychologistInCall() {
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

  return (
    <div className="relative w-full h-full bg-black">
      <div className="flex items-center justify-center w-full h-full p-1 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full max-w-6xl gap-px md:gap-2">
        <div className="relative min-h-0 h-full bg-slate-900 rounded-xl md:rounded-2xl overflow-hidden">
          {primaryTrack ? (
            <>
              <VideoTrack trackRef={primaryTrack} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-16 pointer-events-none" />
              <div className="absolute bottom-2 left-3 flex items-center gap-2">
                <span className="bg-black/50 backdrop-blur-md text-white text-xs md:text-sm font-medium px-3 py-1 rounded-full border border-white/20">
                  {hasRemote ? (remoteParticipants[0]?.name || remoteParticipants[0]?.identity || "Paciente") : "Paciente"}
                </span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto mb-3">
                  <User className="h-6 w-6 text-slate-500" />
                </div>
                <p className="text-xs text-slate-500 font-medium">Aguardando paciente...</p>
              </div>
            </div>
          )}
        </div>

        <div className="relative min-h-0 h-full bg-slate-900 rounded-xl md:rounded-2xl overflow-hidden">
          {localCamPub && localParticipant ? (
            <>
              <VideoTrack trackRef={{ participant: localParticipant, source: Track.Source.Camera, publication: localCamPub }} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-16 pointer-events-none" />
              <div className="absolute bottom-2 left-3 flex items-center gap-2">
                <span className="bg-black/50 backdrop-blur-md text-white text-xs md:text-sm font-medium px-3 py-1 rounded-full border border-white/20">Você</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto mb-3">
                  <Video className={`h-6 w-6 ${camOn ? 'text-blue-400' : 'text-slate-500'}`} />
                </div>
                <p className={`text-xs font-medium ${camOn ? 'text-blue-400' : 'text-slate-500'}`}>
                  {camOn ? 'Câmera ativada' : 'Câmera desligada'}
                </p>
                <p className={`text-xs mt-1 ${micOn ? 'text-blue-400' : 'text-slate-500'}`}>
                  {micOn ? 'Microfone ativado' : 'Microfone desligado'}
                </p>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 z-20 text-xs text-white/50 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
        {hasRemote ? (
          <span className="flex items-center gap-1.5 text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            {formatTime(callDuration)}
          </span>
        ) : "Aguardando paciente..."}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 md:gap-3 bg-black/50 backdrop-blur-xl rounded-full px-3 md:px-4 py-2 md:py-2.5 ring-1 ring-white/10 shadow-2xl">
        <Button size="icon" variant={camOn ? "secondary" : "destructive"} onClick={toggleCam} className="rounded-full h-10 w-10 md:h-11 md:w-11 hover:scale-105 active:scale-95 transition-transform">
          {camOn ? <Video className="h-4 w-4 md:h-5 md:w-5" /> : <VideoOff className="h-4 w-4 md:h-5 md:w-5" />}
        </Button>
        <Button size="icon" variant={micOn ? "secondary" : "destructive"} onClick={toggleMic} className="rounded-full h-10 w-10 md:h-11 md:w-11 hover:scale-105 active:scale-95 transition-transform">
          {micOn ? <Mic className="h-4 w-4 md:h-5 md:w-5" /> : <MicOff className="h-4 w-4 md:h-5 md:w-5" />}
        </Button>
      </div>
    </div>
  )
}
