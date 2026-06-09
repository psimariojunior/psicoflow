"use client"

import { Suspense, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { LiveKitRoom, VideoConference } from "@livekit/components-react"
import "@livekit/components-styles"
import { Video, Loader2 } from "lucide-react"

function EntrarSalaForm() {
  const searchParams = useSearchParams()
  const [roomInput, setRoomInput] = useState(searchParams.get("room") || "")
  const [token, setToken] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL || ""

  const handleConnect = useCallback(async () => {
    if (!roomInput.trim()) return
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
      alert(e instanceof Error ? e.message : "Erro ao conectar")
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
          style={{ height: "100%" }}
        >
          <VideoConference />
        </LiveKitRoom>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Video className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Entrar na Sala Virtual</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Digite o nome da sala informado pelo seu psicólogo</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome da Sala</label>
            <Input placeholder="Ex: sala-1234567890" value={roomInput} onChange={(e) => setRoomInput(e.target.value)} />
          </div>
          <Button className="w-full" size="lg" onClick={handleConnect} disabled={connecting || !roomInput.trim()}>
            {connecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
            {connecting ? "Entrando..." : "Entrar na Sala"}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Conexão segura via LiveKit Cloud. Ao entrar, você concederá acesso à câmera e microfone.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function EntrarSalaPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <EntrarSalaForm />
    </Suspense>
  )
}
