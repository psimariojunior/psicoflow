"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useRoomContext } from "@livekit/components-react"
import { RoomEvent, Track, ConnectionState } from "livekit-client"
import { Button } from "@/components/ui/button"
import {
  Video, VideoOff, Mic, MicOff, LogOut, Maximize2, Minimize2,
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
  const notesRef = useRef<HTMLTextAreaElement>(null)

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [camOn, setCamOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [hasRemote, setHasRemote] = useState(false)
  const [remoteName, setRemoteName] = useState("Psicólogo")
  const [connectionQuality, setConnectionQuality] = useState<"excellent" | "good" | "poor" | "unknown">("unknown")
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  // Chat
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([])
  const [chatInput, setChatInput] = useState("")

  // Notes
  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes] = useState("")

  // Reactions
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [reactionPickerOpen, setReactionPickerOpen] = useState(false)
  const reactionIdRef = useRef(0)

  const room = useRoomContext()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.code === "Space") { e.preventDefault(); toggleMic() }
      if (e.code === "KeyV") { e.preventDefault(); toggleCam() }
      if (e.code === "Escape") { e.preventDefault(); onLeave() }
      if (e.code === "KeyM") { e.preventDefault(); setChatOpen(p => !p) }
      if (e.code === "KeyS" && e.ctrlKey) { e.preventDefault(); toggleScreenShare() }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [camOn, micOn, room])

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

  // Remote video attachment
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
      if (isScreenSharing) {
        await room.localParticipant.setScreenShareEnabled(false)
        setIsScreenSharing(false)
      } else {
        await room.localParticipant.setScreenShareEnabled(true)
        setIsScreenSharing(true)
      }
    } catch {}
  }, [room, isScreenSharing])

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
    const msg = { type: "reaction", emoji }
    room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(msg)), { reliable: true })
    const id = reactionIdRef.current++
    const x = 20 + Math.random() * 60
    setReactions(prev => [...prev, { emoji, id, x }])
    setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 2500)
    setReactionPickerOpen(false)
  }, [room])

  const qualityColors = { excellent: "text-emerald-400", good: "text-blue-400", poor: "text-amber-400", unknown: "text-slate-400" }
  const qualityLabels = { excellent: "Excelente", good: "Boa", poor: "Fraca", unknown: "Verificando..." }
  const qualityDots = { excellent: 3, good: 2, poor: 1, unknown: 0 }

  return (
    <div ref={containerRef} className="relative h-full w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 select-none">
      {/* Main video */}
      <div className="absolute inset-0">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
        {!hasRemote && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-4 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-2 border-blue-500/30 flex items-center justify-center mx-auto">
                <User className="h-10 w-10 text-blue-400/60" />
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
          <div key={r.id} className="absolute bottom-32 text-4xl animate-bounce" style={{ left: `${r.x}%`, animationDuration: "1.5s" }}>
            {r.emoji}
          </div>
        ))}
      </div>

      {/* Top-left: connection + name + timer */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 md:gap-3">
        {hasRemote && (
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-white/10 shadow-lg">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
            <span className="text-xs md:text-sm font-medium">{remoteName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl text-white/70 px-2.5 py-1.5 md:px-3 md:py-2 rounded-xl border border-white/10">
          <Wifi className={cn("h-3 w-3", qualityColors[connectionQuality])} />
          <span className="text-[10px] md:text-xs font-mono">{formatTime(callDuration)}</span>
        </div>
      </div>

      {/* Top-right: room name + quality dots */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xl px-2 py-1.5 rounded-lg border border-white/10">
          {[1, 2, 3].map(i => (
            <div key={i} className={cn("w-1.5 rounded-full transition-all", i <= qualityDots[connectionQuality] ? "bg-emerald-400 h-3" : "bg-white/20 h-1.5")} />
          ))}
          <span className={cn("text-[9px] ml-1", qualityColors[connectionQuality])}>{qualityLabels[connectionQuality]}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-xl text-white/50 px-3 py-1.5 rounded-lg border border-white/5">
          <Camera className="h-3 w-3 text-blue-400" />
          <span className="text-[11px] font-medium">{roomName}</span>
        </div>
      </div>

      {/* Local video PiP */}
      <div className="absolute bottom-20 sm:bottom-24 right-2 sm:right-3 md:right-4 z-20">
        <div className="relative w-16 h-12 sm:w-20 sm:h-15 md:w-36 md:h-28 rounded-lg md:rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl">
          {localVideoRef && <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-contain scale-x-[-1]" />}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent h-6 pointer-events-none" />
          <div className="absolute bottom-0.5 left-1.5">
            <span className="text-[9px] text-white/80 font-medium bg-black/40 px-1.5 py-0.5 rounded-full backdrop-blur-sm">Você</span>
          </div>
        </div>
      </div>

      {/* Chat panel */}
      {chatOpen && (
        <div className="absolute right-2 sm:right-3 bottom-20 sm:bottom-24 z-30 w-72 sm:w-80 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[60vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-sm font-medium text-white">Chat</span>
            <button onClick={() => setChatOpen(false)} className="text-white/50 hover:text-white" aria-label="Fechar chat"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[120px] max-h-[40vh]">
            {chatMessages.length === 0 && <p className="text-xs text-white/30 text-center py-4">Nenhuma mensagem ainda</p>}
            {chatMessages.map((msg, i) => (
              <div key={i} className={cn("text-xs", msg.sender === "Você" ? "text-right" : "")}>
                <span className="text-white/40">{msg.time}</span>
                <span className="text-white/70 ml-1 font-medium">{msg.sender}:</span>
                <p className="text-white/90 mt-0.5">{msg.text}</p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-2 border-t border-white/10 flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") sendChat() }}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-white/10 text-white text-xs px-3 py-2 rounded-lg border-none outline-none placeholder:text-white/30"
            />
            <button onClick={sendChat} className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white" aria-label="Enviar mensagem">
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Notes panel */}
      {notesOpen && (
        <div className="absolute left-2 sm:left-3 bottom-20 sm:bottom-24 z-30 w-72 sm:w-80 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[60vh]">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="text-sm font-medium text-white flex items-center gap-2"><StickyNote className="h-4 w-4 text-amber-400" /> Notas da Sessão</span>
            <button onClick={() => setNotesOpen(false)} className="text-white/50 hover:text-white" aria-label="Fechar notas"><X className="h-4 w-4" /></button>
          </div>
          <textarea
            ref={notesRef}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Anote pontos-chave da sessão..."
            className="flex-1 bg-transparent text-white/90 text-sm p-4 outline-none resize-none min-h-[200px] placeholder:text-white/30"
          />
          <div className="px-4 py-2 border-t border-white/10 text-[10px] text-white/30">
            Suas notas são salvas localmente e não são enviadas ao paciente.
          </div>
        </div>
      )}

      {/* Reaction picker */}
      {reactionPickerOpen && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl px-3 py-2 flex gap-1">
          {REACTIONS.map(emoji => (
            <button key={emoji} onClick={() => sendReaction(emoji)} className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-xl transition-all hover:scale-125" aria-label={`Reagir com ${emoji}`}>
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="flex items-center justify-center gap-2 sm:gap-3 pb-4 sm:pb-6 md:pb-8 px-2">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-xl rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 border border-white/10 shadow-2xl flex-wrap justify-center max-w-full">
            <button onClick={toggleCam} className={cn("relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all duration-200", camOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/20 hover:bg-red-500/30 text-red-400")} aria-label="Alternar câmera">
              {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              {!camOn && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />}
            </button>
            <button onClick={toggleMic} className={cn("relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all duration-200", micOn ? "bg-white/10 hover:bg-white/20 text-white" : "bg-red-500/20 hover:bg-red-500/30 text-red-400")} aria-label="Alternar microfone">
              {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              {!micOn && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black" />}
            </button>
            <button onClick={toggleScreenShare} className={cn("flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all duration-200", isScreenSharing ? "bg-blue-500/30 text-blue-300" : "bg-white/10 hover:bg-white/20 text-white")} aria-label="Compartilhar tela">
              <Monitor className="h-5 w-5" />
            </button>

            <div className="w-px h-8 bg-white/10 mx-0.5 hidden sm:block" />

            <button onClick={() => setReactionPickerOpen(p => !p)} className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all" aria-label="Reações">
              <Smile className="h-5 w-5" />
            </button>
            <button onClick={() => { setChatOpen(p => !p); setNotesOpen(false) }} className={cn("flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all", chatOpen ? "bg-blue-500/30 text-blue-300" : "bg-white/10 hover:bg-white/20 text-white")} aria-label="Chat">
              <MessageCircle className="h-5 w-5" />
            </button>
            <button onClick={() => { setNotesOpen(p => !p); setChatOpen(false) }} className={cn("flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all", notesOpen ? "bg-amber-500/30 text-amber-300" : "bg-white/10 hover:bg-white/20 text-white")} aria-label="Notas">
              <StickyNote className="h-5 w-5" />
            </button>

            <div className="w-px h-8 bg-white/10 mx-0.5 hidden sm:block" />

            <button onClick={toggleFullscreen} className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all" aria-label="Tela cheia">
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button onClick={onLeave} className="flex items-center gap-1.5 sm:gap-2 bg-red-600 hover:bg-red-500 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all shadow-lg shadow-red-600/25">
              <Phone className="h-4 w-4 rotate-[135deg]" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
