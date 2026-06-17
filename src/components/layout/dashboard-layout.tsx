"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { redirect } from "next/navigation"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { CommandPalette } from "@/components/command-palette"
import { KeyboardShortcutsHint } from "@/components/keyboard-shortcuts"
import { OnboardingTour } from "@/components/onboarding-tour"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const { data: session, status } = useSession()
  const pathname = usePathname()

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
        <Header onMenuClick={() => setMobileOpen(true)} onPaletteOpen={() => setPaletteOpen(true)} />
        <main className="p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        <KeyboardShortcutsHint />
        <OnboardingTour />
      </div>
    </div>
  )
}
