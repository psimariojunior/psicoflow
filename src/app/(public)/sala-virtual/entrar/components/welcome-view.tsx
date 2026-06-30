"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Calendar, Shield, Wifi, Video } from "lucide-react"

export function WelcomeView({
  initialRoom,
  onContinue,
}: {
  initialRoom: string
  onContinue: (room: string) => void
}) {
  const [roomInput, setRoomInput] = useState(initialRoom)

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary/30 to-teal-500/30 mb-6 shadow-lg">
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
                onClick={() => { if (roomInput.trim()) onContinue(roomInput.trim()) }}
                disabled={!roomInput.trim()}
              >
                <Camera className="mr-2 h-5 w-5" />
                Continuar
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

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40 mb-3">Ainda não tem consulta agendada?</p>
              <a
                href="/agendar"
                className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                <Calendar className="h-4 w-4" />
                Agende sua consulta
              </a>
            </div>
          </div>

          <p className="mt-6 text-xs text-white/30">
            PsiHumanis &mdash; Tecnologia a serviço da saúde mental
          </p>
        </div>
      </div>
    </div>
  )
}
