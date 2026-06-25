"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRoomContext } from "@livekit/components-react"
import { RoomEvent, Track } from "livekit-client"
import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff, LogOut, Maximize2, Minimize2, Camera, User, Phone } from "lucide-react"

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

        // Retry attaching track with delay to ensure DOM is ready
        const tryAttach = (attempt = 0) => {
          const p = remotes[0]
          const camPub = p.getTrackPublication(Track.Source.Camera)
          if (camPub?.track && videoRef.current) {
            camPub.track.attach(videoRef.current)
          } else if (attempt < 5) {
            setTimeout(() => tryAttach(attempt + 1), 200)
          }
        }
        requestAnimationFrame(() => tryAttach())
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
      // Delay to allow track subscription
      setTimeout(() => attachRemoteVideo(), 500)
    }

    const handleParticipantDisconnected = () => {
      detachRemoteVideo()
    }

    const handleTrackSubscribed = (track: any, publication: any, participant: any) => {
      if (track.kind === "video" && participant && !participant.isLocal) {
        setHasRemote(true)
        setRemoteName(participant.name || participant.identity || "Psicólogo")
        // Delay attachment to ensure DOM is ready
        requestAnimationFrame(() => {
          if (videoRef.current) {
            track.attach(videoRef.current)
          }
        })
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
    room?.localParticipant.setCameraEnabled(!camOn)
    setCamOn(prev => !prev)
  }, [room, camOn])

  const toggleMic = useCallback(() => {
    room?.localParticipant.setMicrophoneEnabled(!micOn)
    setMicOn(prev => !prev)
  }, [room, micOn])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return (
    <div ref={containerRef} className="relative h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Main video - psychologist */}
      <div className="absolute inset-0">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
        {!hasRemote && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/30 flex items-center justify-center mx-auto">
                <User className="h-10 w-10 text-blue-400/60" />
              </div>
              <div>
                <p className="text-blue-300/80 text-sm font-medium">Aguardando psicólogo</p>
                <p className="text-blue-400/40 text-xs mt-1">O profissional entrará em breve</p>
              </div>
            </div>
          </div>
        )}
        {hasRemote && <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />}
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

      {/* Room name */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xl text-white/50 px-3 py-1.5 rounded-lg border border-white/5">
          <Camera className="h-3 w-3 text-blue-400" />
          <span className="text-[11px] font-medium">{roomName}</span>
        </div>
      </div>

      {/* Local video - picture in picture */}
      <div className="absolute bottom-20 sm:bottom-24 right-2 sm:right-3 md:right-4 z-20">
        <div className="relative w-16 h-12 sm:w-20 sm:h-15 md:w-36 md:h-28 rounded-lg md:rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
          {localVideoRef && (
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-contain scale-x-[-1]" />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-6 pointer-events-none" />
          <div className="absolute bottom-0.5 left-1.5">
            <span className="text-[9px] text-white/80 font-medium bg-black/40 px-1.5 py-0.5 rounded-full backdrop-blur-sm">Você</span>
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="flex items-center justify-center gap-2 sm:gap-3 pb-4 sm:pb-6 md:pb-8 px-2">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-xl rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 border border-white/10 shadow-2xl flex-wrap justify-center max-w-full">
            <button
              onClick={toggleCam}
              className={`relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all duration-200 ${
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
              className={`relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all duration-200 ${
                micOn 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
              }`}
              aria-label="Alternar microfone"
            >
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              {!micOn && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />}
            </button>

            <div className="w-px h-8 bg-white/10 mx-0.5 sm:mx-1 hidden sm:block" />

            <button
              onClick={toggleFullscreen}
              className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
              aria-label="Alternar tela cheia"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>

            <div className="w-px h-8 bg-white/10 mx-0.5 sm:mx-1 hidden sm:block" />

            <button
              onClick={onLeave}
              className="flex items-center gap-1.5 sm:gap-2 bg-red-600 hover:bg-red-500 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 shadow-lg shadow-red-600/25"
            >
              <Phone className="h-4 w-4 rotate-[135deg]" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
