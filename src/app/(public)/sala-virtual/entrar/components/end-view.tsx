"use client"

import { Button } from "@/components/ui/button"
import { Camera, VideoOff } from "lucide-react"

export function EndedView({ onNewRoom }: { onNewRoom: () => void }) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-white/5 mb-6">
              <VideoOff className="h-10 w-10 text-white/40" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Conexão encerrada</h1>
            <p className="text-white/60">Obrigado por utilizar o PsicoFlow.</p>
          </div>
          <Button className="w-full h-12 text-base" size="lg" onClick={onNewRoom}>
            <Camera className="mr-2 h-5 w-5" />
            Entrar em outra sala
          </Button>
        </div>
      </div>
    </div>
  )
}
