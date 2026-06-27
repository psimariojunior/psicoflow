"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRoomContext } from "@livekit/components-react"
import { RoomEvent, Track } from "livekit-client"
import {
  Video, VideoOff, Mic, MicOff, Maximize2, Minimize2,
  Camera, User, Phone, MessageCircle, Monitor, StickyNote,
  Smile, X, Send, Wifi,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedInCallUIProps {
  roomName: string
  onLeave: () => void
  isPsychologist?: boolean
}

type Reaction = { emoji: string; id: number; x: number }

const REACTIONS = ["👍", "❤️", "✋", "😊", "👏", "💪"]

export function EnhancedInCallUI({ roomName, onLeave, isPsychologist = false }: EnhancedInCallUIProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [hasRemote, setHasRemote] = useState(false)
  const [remoteName, setRemoteName] = useState("Psicólogo")
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "poor" | "unknown">("unknown")
  const [isScreenSharing, setIsScreenSharing] = useState(false)

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

  // Remote video
  useEffect(() => {
    if (!room) return
    const attachRemote = () => {
      try {
        const remotes = Array.from(room.remoteParticipants.values())
        if (remotes.length === 0) { setHasRemote(false); return }
        setHasRemote(true)
        setRemoteName(remotes[0].name || remotes[0].identity || "Psicólogo")
        const tryAttach = (attempt = 0) => {
          const camPub = remotes[0].getTrackPublication(Track.Source.Camera)
          if (camPub?.track && videoRef.current) camPub.track.attach(videoRef.current)
          else if (attempt < 5) setTimeout(() => tryAttach(attempt + 1), 200)
        }
        requestAnimationFrame(() => tryAttach())
      } catch {}
    }
    const detachRemote = () => {
      try {
        if (videoRef.current) {
          const tracks = videoRef.current.srcObject instanceof MediaStream ? videoRef.current.srcObject.getTracks() : []
          tracks.forEach(t => t.stop())
          videoRef.current.srcObject = null
        }
        setHasRemote(false)
      } catch {}
    }
    const onTrackSub = (track: any, pub: any, participant: any) => {
      if (track.kind === "video" && participant && !participant.isLocal) {
        setHasRemote(true)
        setRemoteName(participant.name || participant.identity || "Psicólogo")
        requestAnimationFrame(() => { if (videoRef.current) track.attach(videoRef.current) })
      }
    }
    const onTrackUnsub = (track: any) => { if (track.kind === "video" && videoRef.current) track.detach(videoRef.current) }
    const onLocalPub = (pub: any) => { if (pub.source === Track.Source.Camera && pub.track && localVideoRef.current) pub.track.attach(localVideoRef.current) }
    const onLocalUnpub = (pub: any) => { if (pub.source === Track.Source.Camera && pub.track && localVideoRef.current) pub.track.detach(localVideoRef.current) }

    room.on(RoomEvent.ParticipantConnected, () => setTimeout(attachRemote, 500))
    room.on(RoomEvent.ParticipantDisconnected, detachRemote)
    room.on(RoomEvent.TrackSubscribed, onTrackSub)
    room.on(RoomEvent.TrackUnsubscribed, onTrackUnsub)
    room.on(RoomEvent.LocalTrackPublished, onLocalPub)
    room.on(RoomEvent.LocalTrackUnpublished, onLocalUnpub)

    setTimeout(() => {
      attachRemote()
      const localCam = room.localParticipant.getTrackPublication(Track.Source.Camera)
      if (localCam?.track && localVideoRef.current) localCam.track.attach(localVideoRef.current)
    }, 500)

    return () => {
      room.off(RoomEvent.ParticipantConnected, () => setTimeout(attachRemote, 500))
      room.off(RoomEvent.ParticipantDisconnected, detachRemote)
      room.off(RoomEvent.TrackSubscribed, onTrackSub)
      room.off(RoomEvent.TrackUnsubscribed, onTrackUnsub)
      room.off(RoomEvent.LocalTrackPublished, onLocalPub)
      room.off(RoomEvent.LocalTrackUnpublished, onLocalUnpub)
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

  // Timer
  useEffect(() => {
    const id = setInterval(() => setCallDuration(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [chatMessages])

  // Keyboard shortcuts (desktop only)
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
  }, [camOn, micOn, room])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  }

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen()
    else document.exitFullscreen()
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
    if (!room) return
    try {
      await room.localParticipant.setScreenShareEnabled(!isScreenSharing)
      setIsScreenSharing(prev => !prev)
    } catch {}
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

  const qualityColors = { excellent: "text-emerald-400", good: "text-blue-400", poor: "text-amber-400", unknown: "text-slate-400" }
  const qualityDots = { excellent: 3, good: 2, poor: 1, unknown: 0 }

  return (
    <div ref={containerRef} className="relative h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 select-none overflow-hidden">
      {/* Main video */}
      <div className="absolute inset-0">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
        {!hasRemote && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3 animate-pulse px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/30 flex items-center justify-center mx-auto">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-blue-400/60" />
              </div>
              <div>
                <p className="text-blue-300/80 text-sm font-medium">Aguardando {isPsychologist ? "paciente" : "psicólogo"}</p>
                <p className="text-blue-400/40 text-xs mt-1">{isPsychologist ? "O paciente entrará em breve" : "O profissional entrará em breve"}</p>
              </div>
            </div>
          </div>
        )}
        {hasRemote && <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />}
      </div>

      {/* Floating reactions */}
      <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
        {reactions.map(r => (
          <div key={r.id} className="absolute bottom-28 sm:bottom-32 text-3xl sm:text-4xl animate-bounce" style={{ left: `${r.x}%`, animationDuration: "1.5s" }}>
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top bar — name + timer + quality (mobile: compact single row) */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-2 py-2 sm:px-3 sm:py-3">
        {/* Left: name + timer */}
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
        {/* Right: quality dots */}
        <div className="flex items-center gap-1 bg-black/50 backdrop-blur-xl px-1.5 py-1 sm:px-2 sm:py-1.5 rounded-lg border border-white/10">
          {[1, 2, 3].map(i => (
            <div key={i} className={cn("w-1 sm:w-1.5 rounded-full transition-all", i <= qualityDots[connectionQuality] ? "bg-emerald-400 h-2.5 sm:h-3" : "bg-white/20 h-1 sm:h-1.5")} />
          ))}
        </div>
      </div>

      {/* Local video PiP — mobile: bottom-left above controls */}
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

      {/* Chat panel — full width on mobile */}
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
            <button onClick={sendChat} className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white shrink-0" aria-label="Enviar">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Notes panel — full width on mobile */}
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

      {/* Bottom controls — 2 rows on mobile if needed */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pb-2 sm:pb-4 md:pb-6 px-1.5 sm:px-3">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-black/60 backdrop-blur-xl rounded-xl sm:rounded-2xl px-2 sm:px-4 py-2 sm:py-2.5 border border-white/10 shadow-2xl">
            {/* Row 1: Essential controls */}
            <button onClick={toggleCam} className={cn("relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl transition-all", camOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/20 hover:bg-red-500/30 text-red-400")} aria-label="Câmera">
              {camOn ? <Video className="h-4 w-4 sm:h-5 sm:w-5" /> : <VideoOff className="h-4 w-4 sm:h-5 sm:w-5" />}
              {!camOn && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-1.5 border-black" />}
            </button>
            <button onClick={toggleMic} className={cn("relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl transition-all", micOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/20 hover:bg-red-500/30 text-red-400")} aria-label="Microfone">
              {micOn ? <Mic className="h-4 w-4 sm:h-5 sm:w-5" /> : <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />}
              {!micOn && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-1.5 border-black" />}
            </button>

            <div className="w-px h-6 sm:h-8 bg-white/10 mx-0.5" />

            <button onClick={toggleScreenShare} className={cn("flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl transition-all", isScreenSharing ? "bg-blue-500/30 text-blue-300" : "bg-white/10 hover:bg-white/20 text-white")} aria-label="Tela">
              <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button onClick={() => togglePanel("chat")} className={cn("flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl transition-all", activePanel === "chat" ? "bg-blue-500/30 text-blue-300" : "bg-white/10 hover:bg-white/20 text-white")} aria-label="Chat">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button onClick={() => setReactionPickerOpen(p => !p)} className={cn("flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl transition-all", reactionPickerOpen ? "bg-white/20 text-white" : "bg-white/10 hover:bg-white/20 text-white")} aria-label="Reações">
              <Smile className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button onClick={() => togglePanel("notes")} className={cn("flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl transition-all", activePanel === "notes" ? "bg-amber-500/30 text-amber-300" : "bg-white/10 hover:bg-white/20 text-white")} aria-label="Notas">
              <StickyNote className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <div className="w-px h-6 sm:h-8 bg-white/10 mx-0.5" />

            <button onClick={toggleFullscreen} className="hidden sm:flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all" aria-label="Tela cheia">
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button onClick={onLeave} className="flex items-center gap-1 sm:gap-2 bg-red-600 hover:bg-red-500 text-white px-2.5 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-[11px] sm:text-sm transition-all shadow-lg shadow-red-600/25">
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-[135deg]" />
              <span className="hidden xs:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
