"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { usePatientAuth } from "@/components/patient-auth-provider"
import toast from "react-hot-toast"
import { Loader2, LogIn } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { login } = usePatientAuth()

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
      router.push("/paciente/agenda")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao entrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Entrar</h1>
            <p className="text-white/50 text-sm">Acesse sua área do paciente</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12"
            />
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-12"
            />
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl"
              disabled={loading || !email.trim() || !password.trim()}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5 mr-2" />}
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="text-center mt-6">
            <a href="/paciente/cadastro" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
              Não tem conta? Cadastre-se
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
