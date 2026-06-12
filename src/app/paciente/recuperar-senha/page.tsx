"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/pacientes/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao enviar")
      setSent(true)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar email")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen bg-white dark:bg-slate-950">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/15 mb-6">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Email enviado!</h1>
            <p className="text-slate-500 dark:text-gray-300 text-sm leading-relaxed">
              Se o email estiver cadastrado, você receberá um link para redefinir sua senha em instantes.
            </p>
            <Link
              href="/paciente/login"
              className="inline-flex items-center gap-2 mt-6 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              <ArrowLeft className="h-4 w-4" /> Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Recuperar senha</h1>
            <p className="text-slate-500 dark:text-gray-300 text-sm">Receba um link para redefinir sua senha</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Seu email cadastrado"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-400 h-12"
            />
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl"
              disabled={loading || !email.trim()}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5 mr-2" />}
              {loading ? "Enviando..." : "Enviar link"}
            </Button>
          </form>
          <p className="text-center mt-6">
            <Link href="/paciente/login" className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
              <ArrowLeft className="h-4 w-4 inline mr-1" /> Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
