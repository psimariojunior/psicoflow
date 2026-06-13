"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { useTheme } from "next-themes"
import toast from "react-hot-toast"
import { Loader2, LogIn, Sun, Moon } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = usePatientAuth()
  const { theme, setTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/pacientes/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao entrar")

      login(data.token, data.patient)
      router.push("/paciente")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao entrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="float-right flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
              aria-label="Alternar tema"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>
            <h1 className="text-2xl font-bold text-foreground mb-1">Entrar</h1>
            <p className="text-muted-foreground text-sm">Acesse sua área do paciente</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading || !email.trim() || !password.trim()}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5 mr-2" />}
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center text-sm">
              <Link href="/paciente/recuperar-senha" className="text-muted-foreground hover:text-primary transition-colors">
                Esqueci minha senha
              </Link>
            </div>
          </form>

          <p className="text-center mt-6">
            <Link href="/paciente/cadastro" className="text-sm text-primary hover:text-primary/80 transition-colors">
              Não tem conta? Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
