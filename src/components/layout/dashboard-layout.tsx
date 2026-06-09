"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "next-themes"
import { Toaster } from "react-hot-toast"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session, status } = useSession()

  if (status === "unauthenticated") {
    redirect("/login")
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={cn(
          "transition-all duration-200",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "12px",
            background: "hsl(var(--card))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))",
          },
        }}
      />
    </div>
  )
}
