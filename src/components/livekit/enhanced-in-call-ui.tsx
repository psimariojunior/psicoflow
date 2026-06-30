"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRoomContext } from "@livekit/components-react"
import { RoomEvent, Track, TrackPublication } from "livekit-client"
import {
  Video, VideoOff, Mic, MicOff, Maximize2, Minimize2,
  Camera, User, Phone, MessageCircle, Monitor, StickyNote,
  Smile, X, Send, Wifi, MonitorOff, Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useBackgroundProcessor } from "@/hooks/use-background-processor"
import toast from "react-hot-toast"

interface EnhancedInCallUIProps {
  roomName: string
  onLeave: () => void
  isPsychologist?: boolean
}

type Reaction = { emoji: string; id: number; x: number }

const REACTIONS = ["👍", "❤️", "✋", "😊", "👏", "💪"]

export function EnhancedInCallUI({ roomName, onLeave, isPsychologist = false }: EnhancedInCallUIProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mainVideoRef = useRef<HTMLVideoElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const pipVideoRef = useRef<HTMLVideoElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [hasRemote, setHasRemote] = useState(false)
  const [remoteName, setRemoteName] = useState("Psicólogo")
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "poor" | "unknown">("unknown")
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [remoteScreenSharing, setRemoteScreenSharing] = useState(false)
  const [screenShareSupported, setScreenShareSupported] = useState(true)
  const [isPip, setIsPip] = useState(false)
  const [pipSupported, setPipSupported] = useState(false)

  // Panels
  const [activePanel, setActivePanel] = useState<"chat" | "notes" | null>(null)
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([])
  const [chatInput, setChatInput] = useState("")
  const [notes, setNotes] = useState("")

  // Reactions
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false)
  const reactionIdRef = useRef(0)

  const room = useRoomContext()
  const { mode: bgMode, supported: bgSupported, toggleBlur } = useBackgroundProcessor()

  // Helper: attach a track publication to a video element
    const attachPubToVideo = useCallback((pub: TrackPublication | undefined, videoEl: HTMLVideoElement | null) => {
    if (pub?.track && videoEl) {
      try { pub.track.attach(videoEl) } catch {}
    }
  }, [])

  const detachPubFromVideo = useCallback((pub: TrackPublication | undefined, videoEl: HTMLVideoElement | null) => {
    if (pub?.track && videoEl) {
      try { pub.track.detach(videoEl) } catch {}
    }
  }, [])

  // Connection quality
  useEffect(() => {
    if (!room) return
    const check = () => {
      const quality = room.localParticipant.connectionQuality as string
      if (["excellent", "good", "poor"].includes(quality)) setConnectionQuality(quality as any)
      else setConnectionQuality("unknown")
    }
    room.on(RoomEvent.ConnectionQualityChanged, check)
    const interval = setInterval(check, 3000)
    check()
    return () => { room.off(RoomEvent.ConnectionQualityChanged, check); clearInterval(interval) }
  }, [room])

  // Remote video + screen share
  useEffect(() => {
    if (!room) return

    const findRemoteWithScreenShare = () => {
      for (const participant of Array.from(room.remoteParticipants.values())) {
        const screenPub = participant.getTrackPublication(Track.Source.ScreenShare)
        if (screenPub?.track) return { participant, screenPub }
      }
      return null
    }

    const attachRemoteCamera = (participant: any) => {
      if (!mainVideoRef.current) return
      // First detach anything currently on mainVideo
      try {
        const existing = mainVideoRef.current.srcObject instanceof MediaStream ? mainVideoRef.current.srcObject.getTracks() : []
        existing.forEach(t => t.stop())
        mainVideoRef.current.srcObject = null
      } catch {}
      // Attach camera to main video
      const camPub = participant.getTrackPublication(Track.Source.Camera)
      if (camPub?.track) {
        try { camPub.track.attach(mainVideoRef.current) } catch {}
        // Also attach to PiP video (always shows remote face)
        if (pipVideoRef.current) {
          try { camPub.track.attach(pipVideoRef.current) } catch {}
        }
      }
    }

    const attachRemoteScreenShare = (participant: any, screenPub: TrackPublication) => {
      if (!mainVideoRef.current) return
      // Detach current tracks
      try {
        const existing = mainVideoRef.current.srcObject instanceof MediaStream ? mainVideoRef.current.srcObject.getTracks() : []
        existing.forEach(t => t.stop())
        mainVideoRef.current.srcObject = null
      } catch {}
      // Attach screen share to main video
      if (screenPub.track) {
        try { screenPub.track.attach(mainVideoRef.current) } catch {}
      }
      // Ensure PiP video always shows remote camera (not screen share)
      if (pipVideoRef.current) {
        const camPub = participant.getTrackPublication(Track.Source.Camera)
        if (camPub?.track) {
          try { camPub.track.attach(pipVideoRef.current) } catch {}
        }
      }
    }

    const attachRemote = () => {
      try {
        const remotes = Array.from(room.remoteParticipants.values())
        if (remotes.length === 0) { setHasRemote(false); return }
        setHasRemote(true)
        setRemoteName(remotes[0].name || remotes[0].identity || "Psicólogo")

        // Check if remote is sharing screen
        const screenShare = findRemoteWithScreenShare()
        if (screenShare) {
          setRemoteScreenSharing(true)
          requestAnimationFrame(() => attachRemoteScreenShare(screenShare.participant, screenShare.screenPub))
        } else {
          setRemoteScreenSharing(false)
          // Try camera with retry
          const tryAttach = (attempt = 0) => {
            if (!mainVideoRef.current) return
            const camPub = remotes[0].getTrackPublication(Track.Source.Camera)
            if (camPub?.track) {
              try { camPub.track.attach(mainVideoRef.current) } catch {}
            } else if (attempt < 5) {
              setTimeout(() => tryAttach(attempt + 1), 200)
            }
          }
          requestAnimationFrame(() => tryAttach())
        }
      } catch {}
    }

    const detachRemote = () => {
      try {
        if (mainVideoRef.current) {
          const tracks = mainVideoRef.current.srcObject instanceof MediaStream ? mainVideoRef.current.srcObject.getTracks() : []
          tracks.forEach(t => t.stop())
          mainVideoRef.current.srcObject = null
        }
        setHasRemote(false)
        setRemoteScreenSharing(false)
      } catch {}
    }

    const onTrackSub = (track: any, pub: any, participant: any) => {
      if (participant?.isLocal) return
      if (track.kind === "video" && participant) {
        setHasRemote(true)
        setRemoteName(participant.name || participant.identity || "Psicólogo")

        if (pub.source === Track.Source.ScreenShare) {
          // Screen share — attach to main video
          setRemoteScreenSharing(true)
          requestAnimationFrame(() => {
            if (mainVideoRef.current) {
              try { track.attach(mainVideoRef.current) } catch {}
            }
          })
        } else if (pub.source === Track.Source.Camera) {
          // Camera — attach to PiP video (always shows remote face)
          requestAnimationFrame(() => {
            if (pipVideoRef.current) {
              try { track.attach(pipVideoRef.current) } catch {}
            }
          })
          // Camera — only attach to main video if no screen share active
          const isScreenActive = findRemoteWithScreenShare() !== null
          if (!isScreenActive) {
            requestAnimationFrame(() => {
              if (mainVideoRef.current) {
                try { track.attach(mainVideoRef.current) } catch {}
              }
            })
          }
        }
      }
    }

    const onTrackUnsub = (track: any, pub: any, participant: any) => {
      if (participant?.isLocal) return
      if (pub.source === Track.Source.ScreenShare) {
        setRemoteScreenSharing(false)
        // Restore camera
        if (mainVideoRef.current) {
          try { track.detach(mainVideoRef.current) } catch {}
          // Find camera of same participant
          if (participant) {
            const camPub = participant.getTrackPublication(Track.Source.Camera)
            if (camPub?.track) {
              try { camPub.track.attach(mainVideoRef.current) } catch {}
            }
          }
        }
      } else if (pub.source === Track.Source.Camera && mainVideoRef.current) {
        try { track.detach(mainVideoRef.current) } catch {}
      }
    }

    const onLocalScreenShare = (pub: any) => {
      if (pub.source !== Track.Source.ScreenShare) return
      if (pub.track && mainVideoRef.current) {
        // Local screen share started — show it in main video
        setIsScreenSharing(true)
        try { pub.track.attach(mainVideoRef.current) } catch {}
      }
    }

    const onLocalScreenShareEnd = (pub: any) => {
      if (pub.source !== Track.Source.ScreenShare) return
      // Local screen share stopped — restore remote video
      setIsScreenSharing(false)
      if (mainVideoRef.current) {
        try { pub.track.detach(mainVideoRef.current) } catch {}
      }
      // Re-attach remote video
      const remotes = Array.from(room.remoteParticipants.values())
      if (remotes.length > 0 && mainVideoRef.current) {
        const camPub = remotes[0].getTrackPublication(Track.Source.Camera)
        if (camPub?.track) {
          try { camPub.track.attach(mainVideoRef.current) } catch {}
        }
      }
    }

    const onLocalCamPub = (pub: any) => {
      if (pub.source === Track.Source.Camera && pub.track && localVideoRef.current) {
        try { pub.track.attach(localVideoRef.current) } catch {}
      }
    }
    const onLocalCamUnpub = (pub: any) => {
      if (pub.source === Track.Source.Camera && pub.track && localVideoRef.current) {
        try { pub.track.detach(localVideoRef.current) } catch {}
      }
    }

    room.on(RoomEvent.ParticipantConnected, () => setTimeout(attachRemote, 500))
    room.on(RoomEvent.ParticipantDisconnected, detachRemote)
    room.on(RoomEvent.TrackSubscribed, onTrackSub)
    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsub)
    room.on(RoomEvent.LocalTrackPublished, (pub) => {
      onLocalScreenShare(pub)
      onLocalCamPub(pub)
    })
    room.on(RoomEvent.LocalTrackUnpublished, (pub) => {
      onLocalScreenShareEnd(pub)
      onLocalCamUnpub(pub)
    })

    // Initial attach
    setTimeout(() => {
      attachRemote()
      const localCam = room.localParticipant.getTrackPublication(Track.Source.Camera)
      if (localCam?.track && localVideoRef.current) {
        try { localCam.track.attach(localVideoRef.current) } catch {}
      }
    }, 500)

    return () => {
      room.off(RoomEvent.ParticipantConnected, () => setTimeout(attachRemote, 500))
      room.off(RoomEvent.ParticipantDisconnected, detachRemote)
      room.off(RoomEvent.TrackSubscribed, onTrackSub)
      room.off(RoomEvent.TrackUnsubscribed, onTrackUnsub)
      room.off(RoomEvent.LocalTrackPublished, (pub) => { onLocalScreenShare(pub); onLocalCamPub(pub) })
      room.off(RoomEvent.LocalTrackUnpublished, (pub) => { onLocalScreenShareEnd(pub); onLocalCamUnpub(pub) })
    }
  }, [room])

  // Data channel for chat + reactions
  useEffect(() => {
    if (!room) return
    const onData = (payload: Uint8Array, participant: any) => {
      try {
        const msg = JSON.parse(new TextDecoder().decode(payload))
        if (msg.type === "chat") {
          const now = new Date()
          setChatMessages(prev => [...prev, {
            sender: participant?.name || "Anônimo",
            text: msg.text,
            time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
          }])
        }
        if (msg.type === "reaction") {
          const id = reactionIdRef.current++
          const x = 20 + Math.random() * 60
          setReactions(prev => [...prev, { emoji: msg.emoji, id, x }])
          setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 2500)
        }
      } catch {}
    }
    room.on(RoomEvent.DataReceived, onData)
    return () => { room.off(RoomEvent.DataReceived, onData) }
  }, [room])

  // Fullscreen
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  // PiP events
  useEffect(() => {
    const onEnter = () => setIsPip(true)
    const onLeave = () => setIsPip(false)
    document.addEventListener("enterpictureinpicture", onEnter)
    document.addEventListener("leavepictureinpicture", onLeave)
    return () => {
      document.removeEventListener("enterpictureinpicture", onEnter)
      document.removeEventListener("leavepictureinpicture", onLeave)
    }
  }, [])

  // Timer
  useEffect(() => {
    const id = setInterval(() => setCallDuration(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [chatMessages])

  // Detect screen share support (iOS Safari doesn't support getDisplayMedia)
  useEffect(() => {
    const supported = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia)
    setScreenShareSupported(supported)
    // PiP: try instead of checking flag (unreliable on mobile)
    setPipSupported(true)
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  }

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen()
    else document.exitFullscreen()
  }, [])

  const togglePip = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPip(false)
      } else if (pipVideoRef.current && !pipVideoRef.current.paused && pipVideoRef.current.readyState >= 2) {
        await pipVideoRef.current.requestPictureInPicture()
        setIsPip(true)
      } else if (mainVideoRef.current && !mainVideoRef.current.paused && mainVideoRef.current.readyState >= 2) {
        await mainVideoRef.current.requestPictureInPicture()
        setIsPip(true)
      }
    } catch (err) {
      console.error("[PiP] failed:", err)
      toast.error("Picture-in-Picture não disponível neste navegador")
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

  const toggleScreenShare = useCallback(async () => {
    if (!room) {
      toast.error("Sala não conectada. Aguarde a conexão.")
      return
    }
    try {
      // Check API support first
      if (!navigator.mediaDevices?.getDisplayMedia) {
        toast.error("Compartilhamento de tela não disponível neste dispositivo")
        return
      }
      const newSharing = !isScreenSharing
      await room.localParticipant.setScreenShareEnabled(newSharing)
      setIsScreenSharing(newSharing)

      // If stopping screen share, restore remote camera to main video
      if (!newSharing && mainVideoRef.current) {
        setTimeout(() => {
          const remotes = Array.from(room.remoteParticipants.values())
          if (remotes.length > 0) {
            const camPub = remotes[0].getTrackPublication(Track.Source.Camera)
            if (camPub?.track && mainVideoRef.current) {
              try { camPub.track.attach(mainVideoRef.current) } catch {}
            }
          }
        }, 300)
      }
    } catch (err) {
      console.error("[ScreenShare] failed:", err)
      toast.error("Não foi possível compartilhar a tela. Verifique as permissões do navegador.")
      setIsScreenSharing(false)
    }
  }, [room, isScreenSharing])

  const togglePanel = useCallback((panel: "chat" | "notes") => {
    setActivePanel(prev => prev === panel ? null : panel)
    setReactionPickerOpen(false)
  }, [])

  const sendChat = useCallback(() => {
    if (!chatInput.trim() || !room) return
    const msg = { type: "chat", text: chatInput.trim() }
    room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(msg)), { reliable: true })
    const now = new Date()
    setChatMessages(prev => [...prev, {
      sender: "Você",
      text: chatInput.trim(),
      time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    }])
    setChatInput("")
  }, [chatInput, room])

  const sendReaction = useCallback((emoji: string) => {
    if (!room) return
    room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: "reaction", emoji })), { reliable: true })
    const id = reactionIdRef.current++
    setReactions(prev => [...prev, { emoji, id, x: 20 + Math.random() * 60 }])
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 2500)
    setReactionPickerOpen(false)
  }, [room])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === "Space") { e.preventDefault(); toggleMic() }
      if (e.code === "KeyV") { e.preventDefault(); toggleCam() }
      if (e.code === "Escape") { e.preventDefault(); onLeave() }
      if (e.code === "KeyM") { e.preventDefault(); togglePanel("chat") }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onLeave, toggleCam, toggleMic, togglePanel])

  const qualityColors = { excellent: "text-emerald-400", good: "text-teal-400", poor: "text-amber-400", unknown: "text-slate-400" }
  const qualityDots = { excellent: 3, good: 2, poor: 1, unknown: 0 }

  return (
    <div ref={containerRef} className="relative h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 select-none overflow-hidden">
      {/* Main video — shows remote camera OR remote/local screen share */}
      <div className="absolute inset-0">
        <video ref={mainVideoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
        {!hasRemote && !isScreenSharing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3 animate-pulse px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-teal-500/20 to-teal-600/10 border-2 border-teal-500/30 flex items-center justify-center mx-auto">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-teal-400/60" />
              </div>
              <div>
                <p className="text-teal-300/80 text-sm font-medium">Aguardando {isPsychologist ? "paciente" : "psicólogo"}</p>
                <p className="text-teal-400/40 text-xs mt-1">{isPsychologist ? "O paciente entrará em breve" : "O profissional entrará em breve"}</p>
              </div>
            </div>
          </div>
        )}
        {hasRemote && <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />}
      </div>

      {/* Hidden PiP video — always tracks remote participant for PiP mode */}
      {hasRemote && (
        <video
          ref={pipVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute w-0 h-0 opacity-0 pointer-events-none"
          style={{ position: "fixed", bottom: 0, right: 0, width: 1, height: 1, opacity: 0.01 }}
        />
      )}

      {/* Screen share badge */}
      {(isScreenSharing || remoteScreenSharing) && (
        <div className="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-teal-600/90 backdrop-blur-sm text-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium shadow-lg">
          <Monitor className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span>{isScreenSharing ? "Você está compartilhando tela" : `${remoteName} está compartilhando tela`}</span>
        </div>
      )}

      {/* Floating reactions */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {reactions.map(r => (
          <div key={r.id} className="absolute bottom-28 sm:bottom-32 text-3xl sm:text-4xl animate-bounce" style={{ left: `${r.x}%`, animationDuration: "1.5s" }}>
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top bar — name + timer + quality */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-2 py-2 sm:px-3 sm:py-3">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {hasRemote && (
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/10">
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] sm:text-sm font-medium max-w-[100px] sm:max-w-none truncate">{remoteName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl text-white/80 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl border border-white/10">
            <Wifi className={cn("h-3 w-3", qualityColors[connectionQuality])} />
            <span className="text-[10px] sm:text-xs font-mono">{formatTime(callDuration)}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xl px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg border border-white/10">
          {[1, 2, 3].map(i => (
            <div key={i} className={cn("w-1 sm:w-1.5 rounded-full transition-all", i <= qualityDots[connectionQuality] ? "bg-emerald-400 h-2.5 sm:h-3" : "bg-white/20 h-1 sm:h-1.5")} />
          ))}
        </div>
      </div>

      {/* Local video PiP — bottom-left above controls */}
      <div className="absolute bottom-[88px] sm:bottom-[100px] left-2 z-20">
        <div className="relative w-20 h-[60px] sm:w-24 sm:h-[72px] md:w-36 md:h-28 rounded-lg overflow-hidden border-2 border-white/20 shadow-2xl">
          {localVideoRef && <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-contain scale-x-[-1]" />}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-5 pointer-events-none" />
          <div className="absolute bottom-0.5 left-1">
            <span className="text-[8px] sm:text-[9px] text-white/80 font-medium bg-black/40 px-1 sm:px-1.5 py-0.5 rounded-full backdrop-blur-sm">Você</span>
          </div>
        </div>
      </div>

      {/* Reactions picker */}
      {reactionPickerOpen && (
        <div className="absolute bottom-[88px] sm:bottom-[100px] left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl px-2 py-1.5 sm:px-3 sm:py-2 flex gap-0.5 sm:gap-1">
          {REACTIONS.map(emoji => (
            <button key={emoji} onClick={() => sendReaction(emoji)} className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl hover:bg-white/10 flex items-center justify-center text-lg sm:text-xl transition-all hover:scale-125" aria-label={`Reagir com ${emoji}`}>
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Chat panel */}
      {activePanel === "chat" && (
        <div className="absolute inset-x-0 bottom-[88px] sm:bottom-[100px] sm:left-auto sm:right-2 sm:w-80 z-30 mx-2 sm:mx-0 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[50vh] sm:max-h-[60vh]">
          <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 border-b border-white/10">
            <span className="text-sm font-medium text-white">Chat</span>
            <button onClick={() => setActivePanel(null)} className="text-white/50 hover:text-white p-1" aria-label="Fechar chat"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2 min-h-[100px] max-h-[35vh] sm:max-h-[40vh]">
            {chatMessages.length === 0 && <p className="text-xs text-white/30 text-center py-4">Nenhuma mensagem ainda</p>}
            {chatMessages.map((msg, i) => (
              <div key={i} className={cn("text-xs", msg.sender === "Você" ? "text-right" : "")}>
                <span className="text-white/40">{msg.time}</span>
                <span className="text-white/70 ml-1 font-medium">{msg.sender}:</span>
                <p className="text-white/90 mt-0.5 break-words">{msg.text}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-2 border-t border-white/10 flex gap-1.5 sm:gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") sendChat() }}
              placeholder="Mensagem..."
              className="flex-1 bg-white/10 text-white text-xs px-2.5 py-2 sm:px-3 rounded-lg border-none outline-none placeholder:text-white/30 min-w-0"
            />
            <button onClick={sendChat} className="w-8 h-8 rounded-lg bg-teal-600 hover:bg-teal-500 flex items-center justify-center text-white shrink-0" aria-label="Enviar">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Notes panel */}
      {activePanel === "notes" && (
        <div className="absolute inset-x-0 bottom-[88px] sm:bottom-[100px] sm:left-2 sm:w-80 z-30 mx-2 sm:mx-0 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[50vh] sm:max-h-[60vh]">
          <div className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 border-b border-white/10">
            <span className="text-sm font-medium text-white flex items-center gap-2"><StickyNote className="h-4 w-4 text-amber-400" /> Notas</span>
            <button onClick={() => setActivePanel(null)} className="text-white/50 hover:text-white p-1" aria-label="Fechar notas"><X className="h-4 w-4" /></button>
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anote pontos-chave da sessão..."
            className="flex-1 bg-transparent text-white/90 text-sm p-3 sm:p-4 outline-none resize-none min-h-[150px] placeholder:text-white/30"
          />
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 border-t border-white/10 text-[10px] text-white/30">
            Salvo localmente. Não é enviado ao paciente.
          </div>
        </div>
      )}

      {/* Bottom controls — Row 1: essential buttons */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pb-2 sm:pb-4 md:pb-6 px-1 sm:px-3">
        <div className="flex flex-col items-center gap-1.5">
          {/* Row 2: secondary buttons (screen share, blur, chat, reactions, notes) */}
          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xl rounded-full px-2 py-1.5 border border-white/10 sm:hidden" style={{ touchAction: "manipulation" }}>
            <button
              onPointerDown={(e) => { e.preventDefault(); togglePip() }}
              className={cn("flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90", isPip ? "bg-teal-500/30 text-teal-300" : "bg-white/10 text-white")}
              aria-label="Picture-in-Picture"
              title="Picture-in-Picture: mantém o vídeo visível em janela flutuante"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <rect x="11" y="9" width="9" height="7" rx="1" fill="currentColor" opacity="0.3" />
              </svg>
            </button>
            {screenShareSupported && (
              <button
                onPointerDown={(e) => { e.preventDefault(); toggleScreenShare() }}
                className={cn("flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90", isScreenSharing ? "bg-teal-500/30 text-teal-300" : "bg-white/10 text-white")}
                aria-label="Compartilhar tela"
              >
                {isScreenSharing ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
              </button>
            )}
            {bgSupported && (
              <button
                onPointerDown={(e) => { e.preventDefault(); toggleBlur() }}
                className={cn("flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90", bgMode !== "disabled" ? "bg-purple-500/30 text-purple-300" : "bg-white/10 text-white")}
                aria-label="Fundo desfocado"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            )}
            <button
              onPointerDown={(e) => { e.preventDefault(); togglePanel("chat") }}
              className={cn("flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90", activePanel === "chat" ? "bg-teal-500/30 text-teal-300" : "bg-white/10 text-white")}
              aria-label="Chat"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
            <button
              onPointerDown={(e) => { e.preventDefault(); setReactionPickerOpen(p => !p) }}
              className={cn("flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90", reactionPickerOpen ? "bg-white/20 text-white" : "bg-white/10 text-white")}
              aria-label="Reações"
            >
              <Smile className="h-4 w-4" />
            </button>
            <button
              onPointerDown={(e) => { e.preventDefault(); togglePanel("notes") }}
              className={cn("flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90", activePanel === "notes" ? "bg-amber-500/30 text-amber-300" : "bg-white/10 text-white")}
              aria-label="Notas"
            >
              <StickyNote className="h-4 w-4" />
            </button>
          </div>

          {/* Main row: cam, mic, leave */}
          <div className="flex items-center gap-1 sm:gap-1.5 bg-black/60 backdrop-blur-xl rounded-2xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 border border-white/10 shadow-2xl" style={{ touchAction: "manipulation" }}>
            <button onPointerDown={(e) => { e.preventDefault(); toggleCam() }} className={cn("relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all active:scale-90", camOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/20 hover:bg-red-500/30 text-red-400")} aria-label="Câmera">
              {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              {!camOn && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-1.5 border-black" />}
            </button>
            <button onPointerDown={(e) => { e.preventDefault(); toggleMic() }} className={cn("relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all active:scale-90", micOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/20 hover:bg-red-500/30 text-red-400")} aria-label="Microfone">
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              {!micOn && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-1.5 border-black" />}
            </button>

            {/* Desktop only: inline secondary buttons */}
            <div className="hidden sm:flex items-center gap-1.5 ml-1">
              <div className="w-px h-8 bg-white/10" />
              <button onPointerDown={(e) => { e.preventDefault(); togglePip() }} className={cn("flex items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-90", isPip ? "bg-teal-500/30 text-teal-300" : "bg-white/10 hover:bg-white/20 text-white")} aria-label="Picture-in-Picture" title="PiP: vídeo em janela flutuante">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <rect x="11" y="9" width="9" height="7" rx="1" fill="currentColor" opacity="0.3" />
                </svg>
              </button>
              {screenShareSupported && (
                <button onPointerDown={(e) => { e.preventDefault(); toggleScreenShare() }} className={cn("flex items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-90", isScreenSharing ? "bg-teal-500/30 text-teal-300" : "bg-white/10 hover:bg-white/20 text-white")} aria-label="Compartilhar tela">
                  {isScreenSharing ? <MonitorOff className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                </button>
              )}
              {bgSupported && (
                <button onPointerDown={(e) => { e.preventDefault(); toggleBlur() }} className={cn("flex items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-90", bgMode !== "disabled" ? "bg-purple-500/30 text-purple-300" : "bg-white/10 hover:bg-white/20 text-white")} aria-label="Fundo desfocado">
                  <Sparkles className="h-5 w-5" />
                </button>
              )}
              <button onPointerDown={(e) => { e.preventDefault(); togglePanel("chat") }} className={cn("flex items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-90", activePanel === "chat" ? "bg-teal-500/30 text-teal-300" : "bg-white/10 hover:bg-white/20 text-white")} aria-label="Chat">
                <MessageCircle className="h-5 w-5" />
              </button>
              <button onPointerDown={(e) => { e.preventDefault(); setReactionPickerOpen(p => !p) }} className={cn("flex items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-90", reactionPickerOpen ? "bg-white/20 text-white" : "bg-white/10 hover:bg-white/20 text-white")} aria-label="Reações">
                <Smile className="h-5 w-5" />
              </button>
              <button onPointerDown={(e) => { e.preventDefault(); togglePanel("notes") }} className={cn("flex items-center justify-center w-12 h-12 rounded-xl transition-all active:scale-90", activePanel === "notes" ? "bg-amber-500/30 text-amber-300" : "bg-white/10 hover:bg-white/20 text-white")} aria-label="Notas">
                <StickyNote className="h-5 w-5" />
              </button>
              <div className="w-px h-8 bg-white/10" />
            </div>

            <button onPointerDown={(e) => { e.preventDefault(); toggleFullscreen() }} className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-90" aria-label="Tela cheia">
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button onPointerDown={(e) => { e.preventDefault(); onLeave() }} className="flex items-center gap-1.5 sm:gap-2 bg-red-600 hover:bg-red-500 text-white px-3 sm:px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-lg shadow-red-600/25 active:scale-95">
              <Phone className="h-4 w-4 rotate-[135deg]" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
