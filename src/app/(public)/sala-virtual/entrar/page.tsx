"use client"

import { Suspense, useState, useCallback, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { LiveKitRoom, RoomAudioRenderer, StartAudio } from "@livekit/components-react"
import "@livekit/components-styles"
import toast from "react-hot-toast"
import { ErrorBoundary } from "@/components/error-boundary"
import { ParticipantWatcher } from "./components/participant-watcher"
import { InCallUI } from "./components/in-call-ui"
import { PrejoinView } from "./components/prejoin-view"
import { EndedView } from "./components/end-view"
import { WelcomeView } from "./components/welcome-view"
import { VirtualWaitingRoom } from "./components/virtual-waiting-room"

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
  const [waitingToken, setWaitingToken] = useState<string | null>(null)

  const handleEnterRoom = useCallback(() => {
    if (waitingToken) {
      setToken(waitingToken)
      setWaitingToken(null)
    }
  }, [waitingToken])
  const [cameraReady, setCameraReady] = useState(false)
  const [hd, setHd] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || "wss://gestao-de-psicologia-sx5sdgua.livekit.cloud"
  const hdRef = useRef(hd)
  hdRef.current = hd

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
      setCameraReady(false)
      setConnecting(false)
      setWaitingToken(data.token)
      setStep("waiting")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao conectar")
      setConnecting(false)
    }
  }, [roomInput, patientName])

  const startCamera = useCallback(() => {
    const videoConstraints = hdRef.current
      ? { width: { ideal: 1280 }, height: { ideal: 720 } }
      : { width: { ideal: 640 }, height: { ideal: 480 } }
    navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
      .then((s) => {
        streamRef.current = s
        if (videoRef.current) videoRef.current.srcObject = s
        setCameraReady(true)
      })
      .catch(() => toast.error("Permita acesso à câmera e microfone nas configurações do navegador"))
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraReady(false)
  }, [])

  const toggleCamera = () => setCameraOn((c) => {
    const next = !c
    if (streamRef.current) streamRef.current.getVideoTracks().forEach((t) => (t.enabled = next))
    else if (next) startCamera()
    return next
  })

  const toggleMic = () => setMicOn((c) => {
    const next = !c
    streamRef.current?.getAudioTracks().forEach((t) => (t.enabled = next))
    return next
  })

  const toggleHd = useCallback(() => {
    setHd((prev) => {
      const next = !prev
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
      setCameraReady(false)
      const videoConstraints = next
        ? { width: { ideal: 1280 }, height: { ideal: 720 } }
        : { width: { ideal: 640 }, height: { ideal: 480 } }
      navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
        .then((s) => {
          streamRef.current = s
          if (videoRef.current) videoRef.current.srcObject = s
          setCameraReady(true)
        })
        .catch(() => toast.error("Erro ao reiniciar câmera"))
      return next
    })
  }, [])

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
    return () => { streamRef.current?.getTracks().forEach((t) => t.stop()); streamRef.current = null; setCameraReady(false) }
  }, [])

  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") Notification.requestPermission()
  }, [])

  useEffect(() => {
    if (psychologistPresent && typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification("Psicólogo entrou na sala", { body: "O profissional está disponível para a sessão." })
    }
  }, [psychologistPresent])

  if (token) {
    return (
      <ErrorBoundary>
        <div className="h-screen relative bg-black">
          <LiveKitRoom
            token={token}
            serverUrl={livekitUrl}
            connect={true}
            video={cameraOn}
            audio={micOn ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false}
            onDisconnected={handleDisconnected}
            style={{ height: "100%" }}
          >
            <ErrorBoundary>
              <StartAudio label="Clique para ativar o áudio" className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 text-white text-lg font-semibold cursor-pointer" />
              <RoomAudioRenderer volume={1} />
              <ParticipantWatcher onParticipantsChange={setPsychologistPresent} />
              <InCallUI roomName={roomInput} onLeave={handleLeaveCall} />
            </ErrorBoundary>
          </LiveKitRoom>
        </div>
      </ErrorBoundary>
    )
  }

  if (step === "prejoin") {
    return (
      <PrejoinView
        roomInput={roomInput}
        patientName={patientName}
        cameraReady={cameraReady}
        connecting={connecting}
        cameraOn={cameraOn}
        micOn={micOn}
        hd={hd}
        videoRef={videoRef}
        onBack={() => { stopCamera(); setStep("welcome") }}
        onStartCamera={startCamera}
        onToggleCamera={toggleCamera}
        onToggleMic={toggleMic}
        onToggleHd={toggleHd}
        onConnect={handleConnect}
        onPatientNameChange={setPatientName}
      />
    )
  }

  if (step === "waiting") {
    return (
      <VirtualWaitingRoom
        patientName={patientName}
        connecting={connecting}
        onEnterRoom={handleEnterRoom}
      />
    )
  }

  if (step === "ended") {
    return <EndedView onNewRoom={() => { setStep("welcome"); setRoomInput("") }} />
  }

  return <WelcomeView initialRoom={roomParam} onContinue={(room) => { setRoomInput(room); setStep("prejoin"); startCamera() }} />
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
