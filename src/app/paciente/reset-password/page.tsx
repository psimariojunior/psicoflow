"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import { Loader2, Lock, CheckCircle } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) return toast.error("Mínimo de 6 caracteres")
    if (password !== confirm) return toast.error("Senhas não conferem")
    if (!token) return toast.error("Token inválido")

    setLoading(true)
    try {
      const res = await fetch("/api/pacientes/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao redefinir senha")
      setDone(true)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao redefinir senha")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-400 dark:text-gray-400">Link inválido. Solicite um novo link de recuperação.</p>
      </div>
    )
  }

  if (done) {
    return (
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/15 mb-6">
          <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Senha redefinida!</h1>
        <p className="text-slate-500 dark:text-gray-300 text-sm mb-6">Sua senha foi alterada com sucesso.</p>
        <Button className="w-full h-12" onClick={() => router.push("/paciente/login")}>
          Ir para o login
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Nova senha</h1>
        <p className="text-slate-500 dark:text-gray-300 text-sm">Digite sua nova senha</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="password"
          placeholder="Nova senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-400 h-12"
        />
        <Input
          type="password"
          placeholder="Confirmar senha"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-400 h-12"
        />
        <Button
          type="submit"
          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl"
          disabled={loading || !password.trim() || !confirm.trim()}
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5 mr-2" />}
          {loading ? "Redefinindo..." : "Redefinir senha"}
        </Button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      <div className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
