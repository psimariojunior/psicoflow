"use client"

import { Suspense, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"
import { Video, Loader2, Shield, Wifi } from "lucide-react"
import toast from "react-hot-toast"

function EntrarSalaForm() {
  const searchParams = useSearchParams()
  const roomParam = searchParams.get("room") || ""
  const [roomInput, setRoomInput] = useState(roomParam)
  const [token, setToken] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || ""

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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao conectar")
    } finally {
      setConnecting(false)
    }
  }, [roomInput])

  if (token) {
    return (
      <div className="h-screen">
        <LiveKitRoom
          token={token}
          serverUrl={livekitUrl}
          connect={true}
          video={true}
          audio={true}
          onDisconnected={() => { setToken(null); setRoomInput("") }}
          style={{ height: "100%" }}
        >
          <VideoConference />
        </LiveKitRoom>
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
                onClick={handleConnect}
                disabled={connecting || !roomInput.trim()}
              >
                {connecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {connecting ? "Entrando..." : "Entrar na Sala"}
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
