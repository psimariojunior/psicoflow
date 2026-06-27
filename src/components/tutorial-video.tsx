"use client"

import { useState } from "react"
import { Play, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface TutorialVideoProps {
  step: "welcome" | "profile" | "availability" | "public" | "done"
}

const TUTORIALS: Record<string, { title: string; duration: string; tips: string[]; visual: "sparkles" | "form" | "clock" | "eye" | "rocket" }> = {
  welcome: {
    title: "Conhecendo o PsiHumanis",
    duration: "30s",
    tips: [
      "O PsiHumanis é sua plataforma completa de gestão",
      "Agenda online, prontuários e sala virtual integrados",
      "Pacientes podem agendar consultas 24h",
    ],
    visual: "sparkles",
  },
  profile: {
    title: "Configure seu perfil profissional",
    duration: "45s",
    tips: [
      "Adicione sua foto e dados profissionais",
      "Seu CRP é verificado automaticamente",
      "A biografia aparece para seus pacientes",
    ],
    visual: "form",
  },
  availability: {
    title: "Defina seus horários",
    duration: "30s",
    tips: [
      "Marque os dias que você atende",
      "Defina horário de início e fim",
      "Pacientes só agendam nos horários disponíveis",
    ],
    visual: "clock",
  },
  public: {
    title: "Personalize seu perfil público",
    duration: "40s",
    tips: [
      "Escolha o nome que os pacientes veem",
      "Defina o valor da sessão (opcional)",
      "Adicione uma mensagem de boas-vindas",
    ],
    visual: "eye",
  },
  done: {
    title: "Explorando o PsiHumanis",
    duration: "20s",
    tips: [
      "Seu perfil está pronto para receber pacientes",
      "Explore o dashboard para ver todas as funcionalidades",
      "Comece cadastrando seu primeiro paciente",
    ],
    visual: "rocket",
  },
}

function AnimatedVisual({ type }: { type: string }) {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5">
      {/* Simulated UI */}
      <div className="absolute inset-0 p-4">
        {/* Top bar */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-red-400/60" />
          <div className="w-2 h-2 rounded-full bg-yellow-400/60" />
          <div className="w-2 h-2 rounded-full bg-green-400/60" />
          <div className="flex-1 h-3 bg-white/5 rounded-full ml-2" />
        </div>

        {type === "sparkles" && (
          <div className="flex items-center justify-center h-[calc(100%-24px)]">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center animate-pulse">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}

        {type === "form" && (
          <div className="space-y-2 mt-2">
            <div className="h-2 bg-white/10 rounded-full w-1/3" />
            <div className="h-8 bg-white/5 rounded-lg border border-white/10 animate-pulse" style={{ animationDelay: "0s" }} />
            <div className="h-2 bg-white/10 rounded-full w-1/4 mt-3" />
            <div className="h-8 bg-white/5 rounded-lg border border-white/10 animate-pulse" style={{ animationDelay: "0.3s" }} />
            <div className="h-2 bg-white/10 rounded-full w-1/3 mt-3" />
            <div className="h-16 bg-white/5 rounded-lg border border-white/10 animate-pulse" style={{ animationDelay: "0.6s" }} />
          </div>
        )}

        {type === "clock" && (
          <div className="flex items-center justify-center h-[calc(100%-24px)]">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white/10 relative">
                <div className="absolute top-1/2 left-1/2 w-0.5 h-10 bg-blue-400 origin-bottom rounded-full animate-spin" style={{ transformOrigin: "bottom center", animationDuration: "4s" }} />
                <div className="absolute top-1/2 left-1/2 w-0.5 h-7 bg-white/40 origin-bottom rounded-full animate-spin" style={{ transformOrigin: "bottom center", animationDuration: "24s" }} />
                <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 bg-blue-400 rounded-full" />
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[10px] text-blue-300 font-mono animate-pulse">08:00 - 18:00</div>
            </div>
          </div>
        )}

        {type === "eye" && (
          <div className="flex items-center justify-center h-[calc(100%-24px)]">
            <div className="w-32 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500" />
                <div className="flex-1 space-y-1">
                  <div className="h-2 bg-white/20 rounded-full" />
                  <div className="h-1.5 bg-white/10 rounded-full w-2/3" />
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full" />
              <div className="h-2 bg-white/5 rounded-full w-4/5" />
              <div className="flex gap-1 mt-2">
                <div className="px-2 py-0.5 bg-blue-500/20 rounded text-[8px] text-blue-300">Online</div>
                <div className="px-2 py-0.5 bg-green-500/20 rounded text-[8px] text-green-300">Disponível</div>
              </div>
            </div>
          </div>
        )}

        {type === "rocket" && (
          <div className="flex items-center justify-center h-[calc(100%-24px)]">
            <div className="relative">
              <div className="text-4xl animate-bounce" style={{ animationDuration: "1.5s" }}>🚀</div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-yellow-400/30 rounded-full blur-sm animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors group cursor-pointer">
        <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-white/20">
          <Play className="h-5 w-5 text-white ml-0.5" />
        </div>
      </div>
    </div>
  )
}

export function TutorialVideo({ step }: TutorialVideoProps) {
  const [expanded, setExpanded] = useState(false)
  const tutorial = TUTORIALS[step]

  return (
    <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 overflow-hidden">
      <button
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Play className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{tutorial.title}</p>
            <p className="text-[10px] text-muted-foreground">{tutorial.duration} de tutorial</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 animate-fade-in">
          <AnimatedVisual type={tutorial.visual} />
          <ul className="space-y-1.5">
            {tutorial.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
