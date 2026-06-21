"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRoomContext } from "@livekit/components-react"
import { RoomEvent, Track } from "livekit-client"
import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff, LogOut, Maximize2, Minimize2, Camera, User } from "lucide-react"

export function InCallUI({ roomName, onLeave }: { roomName: string; onLeave: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [hasRemote, setHasRemote] = useState(false)
  const [remoteName, setRemoteName] = useState("Psicólogo")

  const room = useRoomContext()

  useEffect(() => {
    if (!room) return

    const attachRemoteVideo = () => {
      try {
        const remotes = Array.from(room.remoteParticipants.values())
        if (remotes.length === 0) {
          setHasRemote(false)
          return
        }
        setHasRemote(true)
        setRemoteName(remotes[0].name || remotes[0].identity || "Psicólogo")

        const p = remotes[0]
        const camPub = p.getTrackPublication(Track.Source.Camera)
        if (camPub?.track && videoRef.current) {
          camPub.track.attach(videoRef.current)
        }
      } catch {}
    }

    const detachRemoteVideo = () => {
      try {
        if (videoRef.current) {
          const tracks = videoRef.current.srcObject instanceof MediaStream ? videoRef.current.srcObject.getTracks() : []
          tracks.forEach(t => t.stop())
          videoRef.current.srcObject = null
        }
        setHasRemote(false)
      } catch {}
    }

    const handleParticipantConnected = () => {
      attachRemoteVideo()
    }

    const handleParticipantDisconnected = () => {
      detachRemoteVideo()
    }

    const handleTrackSubscribed = (track: any, publication: any, participant: any) => {
      if (track.kind === "video" && participant && !participant.isLocal) {
        setHasRemote(true)
        setRemoteName(participant.name || participant.identity || "Psicólogo")
        if (videoRef.current) {
          track.attach(videoRef.current)
        }
      }
    }

    const handleTrackUnsubscribed = (track: any) => {
      if (track.kind === "video") {
        if (videoRef.current) {
          track.detach(videoRef.current)
        }
      }
    }

    const handleLocalPublished = (publication: any) => {
      if (publication.source === Track.Source.Camera && publication.track && localVideoRef.current) {
        publication.track.attach(localVideoRef.current)
      }
    }

    const handleLocalUnpublished = (publication: any) => {
      if (publication.source === Track.Source.Camera && publication.track && localVideoRef.current) {
        publication.track.detach(localVideoRef.current)
      }
    }

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected)
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
    room.on(RoomEvent.TrackSubscribed, handleTrackSubscribed)
    room.on(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
    room.on(RoomEvent.LocalTrackPublished, handleLocalPublished)
    room.on(RoomEvent.LocalTrackUnpublished, handleLocalUnpublished)

    setTimeout(() => {
      attachRemoteVideo()
      const localCam = room.localParticipant.getTrackPublication(Track.Source.Camera)
      if (localCam?.track && localVideoRef.current) {
        localCam.track.attach(localVideoRef.current)
      }
    }, 500)

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected)
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
      room.off(RoomEvent.TrackSubscribed, handleTrackSubscribed)
      room.off(RoomEvent.TrackUnsubscribed, handleTrackUnsubscribed)
      room.off(RoomEvent.LocalTrackPublished, handleLocalPublished)
      room.off(RoomEvent.LocalTrackUnpublished, handleLocalUnpublished)
    }
  }, [room])

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setCallDuration(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }, [])

  const toggleCam = useCallback(() => {
    const pub = room?.localParticipant.getTrackPublication(Track.Source.Camera)
    if (pub) {
      const enabled = !pub.isMuted
      room?.localParticipant.setCameraEnabled(!enabled)
      setCamOn(!enabled)
    }
  }, [room])

  const toggleMic = useCallback(() => {
    const pub = room?.localParticipant.getTrackPublication(Track.Source.Microphone)
    if (pub) {
      const enabled = !pub.isMuted
      room?.localParticipant.setMicrophoneEnabled(!enabled)
      setMicOn(!enabled)
    }
  }, [room])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div ref={containerRef} className="relative h-full w-full bg-black">
      <div className="flex items-center justify-center w-full h-full p-1 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full max-w-6xl gap-px md:gap-2">
          <div className="relative min-h-0 h-full bg-slate-900 rounded-xl md:rounded-2xl overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
            {!hasRemote && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center mx-auto mb-3">
                    <User className="h-6 w-6 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Aguardando psicólogo...</p>
                </div>
              </div>
            )}
            {hasRemote && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-16 pointer-events-none" />
            )}
            {hasRemote && (
              <div className="absolute bottom-2 left-3 flex items-center gap-2">
                <span className="bg-blue-500/30 backdrop-blur-md text-blue-200 text-xs md:text-sm font-medium px-3 py-1 rounded-full border border-blue-400/30">
                  {remoteName}
                </span>
                <span className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-white/80 text-xs px-2.5 py-1 rounded-full">
                  <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                  {formatTime(callDuration)}
                </span>
              </div>
            )}
          </div>

          <div className="relative min-h-0 h-full bg-slate-900 rounded-xl md:rounded-2xl overflow-hidden">
            <video ref={localVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent h-16 pointer-events-none" />
            <div className="absolute bottom-2 left-3 flex items-center gap-2">
              <span className="bg-black/50 backdrop-blur-md text-white text-xs md:text-sm font-medium px-3 py-1 rounded-full border border-white/20">Você</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-lg text-white/80 text-xs px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
        <Camera className="h-3 w-3 text-blue-400" />
        {roomName}
      </div>

      <div className="absolute top-4 right-4 z-20">
        {hasRemote && (
          <span className="flex items-center gap-1.5 bg-blue-500/20 backdrop-blur-md text-blue-300 text-xs px-3 py-1.5 rounded-full border border-blue-400/20">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Conectado
          </span>
        )}
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 md:gap-3 bg-black/50 backdrop-blur-xl rounded-full px-3 md:px-4 py-2 md:py-2.5 ring-1 ring-white/10 shadow-2xl">
        <Button size="icon" aria-label="Alternar câmera" variant={camOn ? "secondary" : "destructive"} onClick={toggleCam} className="rounded-full h-11 w-11 hover:scale-105 active:scale-95 transition-transform">
          {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        <Button size="icon" aria-label="Alternar microfone" variant={micOn ? "secondary" : "destructive"} onClick={toggleMic} className="rounded-full h-11 w-11 hover:scale-105 active:scale-95 transition-transform">
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        <div className="w-px h-6 bg-white/10" />
        <Button size="icon" aria-label="Alternar tela cheia" variant="secondary" onClick={toggleFullscreen} className="rounded-full h-11 w-11 hover:scale-105 active:scale-95 transition-transform">
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
        <div className="w-px h-6 bg-white/10" />
        <Button variant="destructive" size="icon" aria-label="Sair da sala" onClick={onLeave} className="rounded-full h-11 w-11 hover:scale-105 active:scale-95 transition-transform">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
