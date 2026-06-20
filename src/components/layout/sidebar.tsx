"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Video,
  FileText,
  Bell,
  BarChart3,
  Smile,
  Settings,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Receipt,
  ClipboardList,
  Sparkles,
  Heart,
  BookOpen,
  ListTodo,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onMobileClose: () => void
}

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/disponibilidade", label: "Disponibilidade", icon: Clock },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/cobrancas", label: "Cobranças", icon: Receipt },
  { href: "/sala-virtual", label: "Sala Virtual", icon: Video },
  { href: "/sessoes", label: "Sessões", icon: ClipboardList },
  { href: "/questionarios", label: "Questionários", icon: ClipboardList },
  { href: "/prontuarios", label: "Prontuários", icon: FileText },
  { href: "/diario-emocoes", label: "Diário de Emoções", icon: Smile },
  { href: "/tarefas",        label: "Tarefas",           icon: ListTodo },
  { href: "/notificacoes",   label: "Notificações",     icon: Bell },
  { href: "/comunicacao",    label: "Comunicação",      icon: MessageSquare },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
  { href: "/ajuda", label: "Ajuda", icon: BookOpen },
]

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <div className="flex h-full flex-col bg-background dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border-r relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/[0.03] to-transparent pointer-events-none" />
      <div className="flex h-16 items-center justify-between px-4 border-b relative">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300 group-hover:scale-105 ring-2 ring-blue-500/20">
            <Image src="/logo.png" alt="PsicoFlow" width={40} height={40} className="w-full h-full object-cover" priority />
          </div>
          {!collapsed && (
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-sky-400 bg-clip-text text-transparent">
                PsicoFlow
              </span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Gestão em Psicologia</p>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="hidden lg:flex"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-2 relative">
        <nav className="flex flex-col gap-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative group/item",
                  !collapsed && "hover:pl-4",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5" />
                )}
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-blue-500 to-sky-500" />
                )}
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 shrink-0",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground group-hover/item:bg-accent group-hover/item:text-foreground"
                )}>
                  <item.icon className="h-4 w-4" />
                </div>
                {!collapsed && <span className="relative">{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4 relative">
        {!collapsed ? (
          <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-lg shadow-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-blue-200" />
              <p className="text-sm font-semibold">CRP 04/52274</p>
            </div>
            <p className="text-xs text-blue-100/80 leading-relaxed">
              Mário Júnior · Gestalt-Terapia
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-lg shadow-blue-500/20">
              <Heart className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:flex-col transition-[width] duration-300 ease-in-out",
          collapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/50 animate-in fade-in duration-200" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
