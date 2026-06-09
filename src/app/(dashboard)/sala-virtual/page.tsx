"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"
import { Video, Loader2, Link2, Copy, LogOut } from "lucide-react"
import toast from "react-hot-toast"

export default function VirtualRoomPage({ params }: { params?: { id: string } }) {
  const [roomName, setRoomName] = useState(params?.id || `sala-${Date.now()}`)
  const [token, setToken] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [ending, setEnding] = useState(false)

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || ""

  const handleConnect = useCallback(async () => {
    setConnecting(true)
    try {
      const res = await fetch(`/api/livekit/token?room=${encodeURIComponent(roomName)}`)
      if (!res.ok) throw new Error("Erro ao gerar token")
      const data = await res.json()
      setToken(data.token)
    } catch {
      toast.error("Erro ao conectar. Verifique as credenciais do LiveKit.")
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
  }, [roomName])

  const patientLink = `${typeof window !== "undefined" ? window.location.origin : ""}/sala-virtual/entrar?room=${encodeURIComponent(roomName)}`

  if (token) {
    return (
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
            audio={true}
            onDisconnected={() => setToken(null)}
            style={{ height: "100%" }}
          >
            <VideoConference />
          </LiveKitRoom>
        </div>
      </div>
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
              const url = `${window.location.origin}/sala-virtual/entrar?room=${encodeURIComponent(roomName)}`
              navigator.clipboard.writeText(url)
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
