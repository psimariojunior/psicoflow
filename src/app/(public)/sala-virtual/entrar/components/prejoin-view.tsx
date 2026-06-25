"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Video, VideoOff, Mic, MicOff, Shield, Wifi, Loader2, ArrowLeft } from "lucide-react"

export function PrejoinView({
  roomInput,
  patientName,
  cameraReady,
  connecting,
  cameraOn,
  micOn,
  hd,
  videoRef,
  onBack,
  onStartCamera,
  onToggleCamera,
  onToggleMic,
  onToggleHd,
  onConnect,
  onPatientNameChange,
}: {
  roomInput: string
  patientName: string
  cameraReady: boolean
  connecting: boolean
  cameraOn: boolean
  micOn: boolean
  hd: boolean
  videoRef: React.Ref<HTMLVideoElement>
  onBack: () => void
  onStartCamera: () => void
  onToggleCamera: () => void
  onToggleMic: () => void
  onToggleHd: () => void
  onConnect: () => void
  onPatientNameChange: (name: string) => void
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-[#0a1120] to-slate-900">
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

        <div className="w-full max-w-4xl relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-all hover:gap-3">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </button>
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <Shield className="h-3.5 w-3.5" />
              Sala {roomInput}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] ring-1 ring-white/10 shadow-2xl backdrop-blur-xl">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-slate-800 to-black">
                  <video ref={videoRef as React.LegacyRef<HTMLVideoElement>} autoPlay muted playsInline className={`w-full h-full object-cover scale-x-[-1] ${cameraReady ? "block" : "hidden"}`} />

                  {!cameraReady && !connecting && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8">
                      <div className="h-20 w-20 rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.08] flex items-center justify-center">
                        <Camera className="h-9 w-9 text-white/30" />
                      </div>
                      <div className="text-center space-y-1">
                        <p className="text-white/50 text-base font-medium">Câmera desativada</p>
                        <p className="text-white/30 text-sm">Ative sua câmera para ver como aparece</p>
                      </div>
                      <Button variant="secondary" size="default" onClick={onStartCamera} className="rounded-full px-6 shadow-xl">
                        <Camera className="mr-2 h-4 w-4" /> Ativar Câmera
                      </Button>
                    </div>
                  )}

                  {cameraReady && (
                    <div className="absolute inset-0">
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md ring-1 ring-white/10">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50" />
                        Câmera ativa
                        <span className="ml-2 text-[10px] uppercase tracking-wider opacity-60">{hd ? "HD" : "SD"}</span>
                      </div>
                      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-4">
                        <Button size="icon" aria-label="Alternar câmera" variant={cameraOn ? "secondary" : "destructive"} onClick={onToggleCamera} className="rounded-full h-12 w-12 shadow-2xl ring-1 ring-white/20 hover:scale-105 transition-transform">
                          {cameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                        </Button>
                        <Button size="icon" aria-label="Alternar microfone" variant={micOn ? "secondary" : "destructive"} onClick={onToggleMic} className="rounded-full h-12 w-12 shadow-2xl ring-1 ring-white/20 hover:scale-105 transition-transform">
                          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                        </Button>
                        <Button size="icon" variant={hd ? "secondary" : "default"} onClick={onToggleHd} className="rounded-full h-12 w-12 shadow-2xl ring-1 ring-white/20 hover:scale-105 transition-transform text-xs font-bold">
                          {hd ? "HD" : "SD"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {connecting && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 backdrop-blur-sm">
                      <div className="text-center text-white">
                        <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-emerald-400" />
                        <p className="text-lg font-medium">Conectando à sala...</p>
                        <p className="text-sm text-white/50 mt-1">Preparando ambiente seguro</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:col-span-1 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-500/50" />
                  <span className="text-xs text-emerald-400 font-semibold uppercase tracking-[0.2em]">Você está na sala</span>
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight">Pronto para sua<br />sessão?</h2>
                <p className="text-white/50 text-sm leading-relaxed">
                  Respire fundo. Este é um espaço seguro e acolhedor para você compartilhar. Seu psicólogo entrará em instantes.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-white/40 font-medium uppercase tracking-wider">Como prefere ser chamado</label>
                <Input placeholder="Seu nome" value={patientName} onChange={(e) => onPatientNameChange(e.target.value)} className="bg-white/[0.06] border-white/10 text-white placeholder:text-white/20 h-12 rounded-xl text-base" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Shield, label: "Privacidade", desc: "Criptografia" },
                  { icon: Wifi, label: "Conexão", desc: "Estável" },
                  { icon: Mic, label: "Áudio", desc: "Opcional" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="bg-white/[0.04] rounded-xl p-3 text-center ring-1 ring-white/[0.06]">
                    <Icon className="h-4 w-4 text-emerald-400/70 mx-auto mb-1.5" />
                    <p className="text-[11px] text-white/60 font-medium">{label}</p>
                    <p className="text-[10px] text-white/30">{desc}</p>
                  </div>
                ))}
              </div>

              <Button
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
                onClick={onConnect}
                disabled={connecting}
              >
                {connecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                {connecting ? "Conectando..." : "Entrar na Sala"}
              </Button>

              <p className="text-[11px] text-white/25 text-center leading-relaxed">
                Ao entrar, você aceita os termos de uso e política de privacidade do PsiHumanis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
