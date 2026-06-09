"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
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
  Menu,
  X,
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
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/agenda", label: "Agenda", icon: Calendar },
  { href: "/financeiro", label: "Financeiro", icon: DollarSign },
  { href: "/cobrancas", label: "Cobranças", icon: Receipt },
  { href: "/sala-virtual", label: "Sala Virtual", icon: Video },
  { href: "/prontuarios", label: "Prontuários", icon: FileText },
  { href: "/diario-emocoes", label: "Diário de Emoções", icon: Smile },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()

  const sidebarContent = (
    <div className="flex h-full flex-col bg-card border-r">
      <div className="flex h-16 items-center justify-between px-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <span className="text-sm font-bold text-white">PF</span>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              PsicoFlow
            </span>
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

      <ScrollArea className="flex-1 py-2">
        <nav className="flex flex-col gap-1 px-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        {!collapsed && (
          <div className="rounded-lg bg-gradient-to-br from-primary/5 to-blue-500/5 p-4">
            <p className="text-sm font-medium">Plano Profissional</p>
            <p className="text-xs text-muted-foreground mt-1">Até 50 pacientes</p>
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
          "hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:flex-col",
          collapsed ? "lg:w-20" : "lg:w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-card">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
