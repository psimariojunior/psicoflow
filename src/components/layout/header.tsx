"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getInitials } from "@/lib/utils"
import { Bell, Menu, LogOut, User, Settings, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handler)
    return () => window.removeEventListener("scroll", handler)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-20 h-16 border-b bg-background/80 backdrop-blur-xl transition-all duration-200",
        scrolled && "shadow-sm"
      )}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Olá, {session?.user?.name?.split(" ")[0] || "Psicólogo"}</h1>
            <p className="text-xs text-muted-foreground">Bem-vindo de volta</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-destructive" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(session?.user?.name || "U")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{session?.user?.name}</span>
                  <span className="text-xs text-muted-foreground">{session?.user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/configuracoes" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/configuracoes" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
