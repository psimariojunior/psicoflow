"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import { Loader2, Mail, ArrowLeft, CheckCircle, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { theme, setTheme } = useTheme()

  // Rate limit: max 1 request per email every 2 minutes
  const [lastRequest, setLastRequest] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    const now = Date.now()
    if (now - lastRequest < 120_000) {
      toast.error("Aguarde 2 minutos para uma nova tentativa")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/pacientes/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao enviar email")
      setLastRequest(now)
      setSent(true)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar email")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm text-center">
            <Card>
              <CardContent className="pt-6">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/15 mb-6">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">Email enviado!</h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Se o email estiver cadastrado, você receberá um link para redefinir sua senha em instantes.
                </p>
                <Link
                  href="/paciente/login"
                  className="inline-flex items-center gap-2 mt-6 text-sm text-primary hover:text-primary/80"
                >
                  <ArrowLeft className="h-4 w-4" /> Voltar ao login
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-2 text-center mb-8">
            <h1 className="text-2xl font-bold text-foreground">Recuperar senha</h1>
            <p className="text-muted-foreground text-sm">Receba um link para redefinir sua senha</p>
          </div>

          <Card>
            <CardHeader className="relative">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="absolute right-4 top-4 flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                aria-label="Alternar tema"
              >
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </button>
              <CardTitle>Recuperar senha</CardTitle>
              <CardDescription>Informe seu email para receber o link</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Seu email cadastrado"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold"
                  disabled={loading || !email.trim()}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5 mr-2" />}
                  {loading ? "Enviando..." : "Enviar link"}
                </Button>
              </form>
              <p className="text-center mt-6">
                <Link href="/paciente/login" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  <ArrowLeft className="h-4 w-4 inline mr-1" /> Voltar ao login
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
