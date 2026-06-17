"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { Command } from "cmdk"
import {
  LayoutDashboard, Users, Calendar, Clock, DollarSign, Receipt, Video,
  ClipboardList, FileText, Smile, Bell, MessageSquare, BarChart3, Settings,
  UserPlus, Plus, Search, Moon, Sun, LogOut, Home, Sparkles, Heart,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, keywords: "home inicio" },
  { href: "/pacientes", label: "Pacientes", icon: Users, keywords: "clientes" },
  { href: "/agenda", label: "Agenda", icon: Calendar, keywords: "calendario consultas" },
  { href: "/disponibilidade", label: "Disponibilidade", icon: Clock, keywords: "horarios" },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign, keywords: "dinheiro receita" },
  { href: "/cobrancas", label: "Cobranças", icon: Receipt, keywords: "faturas boletos" },
  { href: "/sala-virtual", label: "Sala Virtual", icon: Video, keywords: "videochamada" },
  { href: "/sessoes", label: "Sessões", icon: ClipboardList, keywords: "atendimentos" },
  { href: "/prontuarios", label: "Prontuários", icon: FileText, keywords: "documentos" },
  { href: "/diario-emocoes", label: "Diário de Emoções", icon: Smile, keywords: "humor" },
  { href: "/notificacoes", label: "Notificações", icon: Bell, keywords: "alertas" },
  { href: "/comunicacao", label: "Comunicação", icon: MessageSquare, keywords: "mensagens" },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3, keywords: "graficos" },
  { href: "/configuracoes", label: "Configurações", icon: Settings, keywords: "ajustes" },
]

const quickActions = [
  { id: "new-patient", label: "Cadastrar Paciente", icon: UserPlus, href: "/pacientes/novo", keywords: "novo criar" },
  { id: "new-appointment", label: "Nova Consulta", icon: Plus, href: "/agenda", keywords: "agendar criar" },
  { id: "new-session", label: "Registrar Sessão", icon: ClipboardList, href: "/sessoes", keywords: "nova" },
  { id: "new-prontuario", label: "Criar Prontuário", icon: FileText, href: "/prontuarios/novo", keywords: "novo" },
  { id: "virtual-room", label: "Iniciar Sala Virtual", icon: Video, href: "/sala-virtual", keywords: "videochamada" },
]

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const run = useCallback((href: string) => {
    onOpenChange(false)
    setSearch("")
    router.push(href)
  }, [router, onOpenChange])

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]",
        open ? "visible" : "invisible pointer-events-none"
      )}
    >
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <Command
        className={cn(
          "relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden",
          "bg-background text-foreground",
          open ? "animate-in fade-in zoom-in-95 duration-200" : ""
        )}
        label="Paleta de Comandos"
      >
        <div className="flex items-center border-b px-4">
          <Search className="mr-3 h-4 w-4 shrink-0 text-muted-foreground" />
          <Command.Input
            ref={inputRef}
            value={search}
            onValueChange={setSearch}
            placeholder="Buscar páginas, ações..."
            className="flex h-14 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
            ⌘K
          </kbd>
        </div>

        <Command.List className="max-h-72 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground/50" />
              <span>Nenhum resultado para <strong className="text-foreground">&ldquo;{search}&rdquo;</strong></span>
            </div>
          </Command.Empty>

          {search.length === 0 && (
            <>
              <Command.Group heading="Ações Rápidas">
                {quickActions.map((action) => (
                  <Command.Item
                    key={action.id}
                    value={action.id + " " + action.label + " " + action.keywords}
                    onSelect={() => run(action.href)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{action.label}</span>
                      <span className="text-xs text-muted-foreground">{action.href}</span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>

              <Command.Separator className="my-1 h-px bg-border" />

              <Command.Group heading="Navegação">
                {menuItems.map((item) => (
                  <Command.Item
                    key={item.href}
                    value={item.label + " " + item.keywords}
                    onSelect={() => run(item.href)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span>{item.label}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            </>
          )}

          {search.length > 0 && (
            <Command.Group heading="Resultados">
              {[...quickActions, ...menuItems].map((item: any) => (
                <Command.Item
                  key={item.href || item.id}
                  value={(item.label + " " + (item.keywords || "")).toLowerCase()}
                  onSelect={() => run(item.href)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                >
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg",
                    item.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span>{item.label}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Separator className="my-1 h-px bg-border" />

          <div className="px-3 py-2">
            <Command.Item
              onSelect={() => {
                setTheme(theme === "dark" ? "light" : "dark")
                onOpenChange(false)
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-muted-foreground">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </div>
              <span>Alternar para modo {theme === "dark" ? "claro" : "escuro"}</span>
            </Command.Item>
          </div>
        </Command.List>
      </Command>
    </div>
  )
}
