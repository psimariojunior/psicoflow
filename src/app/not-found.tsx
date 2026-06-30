"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, Home, Search, FileText, HelpCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-teal-50/20 to-background dark:via-teal-950/10 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-28 h-28 rounded-[2rem] bg-gradient-to-br from-teal-500 to-indigo-600 shadow-2xl shadow-teal-500/30 mb-8 ring-4 ring-teal-500/10">
          <span className="text-6xl font-bold text-white">404</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          Página não encontrada
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
          A página que você procura não existe ou foi movida. 
          Que tal tentar um dos links abaixo?
        </p>

        <div className="grid gap-3 sm:grid-cols-2 mb-8">
          {[
            { href: "/", icon: Home, label: "Voltar ao Início", desc: "Página principal" },
            { href: "/agendar", icon: Calendar, label: "Agendar Consulta", desc: "Marque um horário" },
            { href: "/blog", icon: FileText, label: "Blog", desc: "Artigos e dicas" },
            { href: "/ajuda", icon: HelpCircle, label: "Ajuda", desc: "Perguntas frequentes" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 p-4 rounded-2xl border bg-card hover:bg-accent hover:border-teal-200 dark:hover:border-teal-800 transition-all"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/10 to-indigo-500/10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar no PsiHumanis..."
            className="w-full rounded-xl border bg-card py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring/30 transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                window.location.href = `/blog?q=${encodeURIComponent((e.target as HTMLInputElement).value.trim())}`
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
