"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "next-themes"
import toast from "react-hot-toast"
import { Eye, EyeOff, Loader2, Lock, CheckCircle, Sun, Moon } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { theme, setTheme } = useTheme()

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
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Link inválido. Solicite um novo link de recuperação.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (done) {
    return (
      <div className="w-full max-w-sm text-center">
        <Card>
          <CardContent className="pt-6">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/15 mb-6">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Senha redefinida!</h1>
            <p className="text-muted-foreground text-sm mb-6">Sua senha foi alterada com sucesso.</p>
            <Button className="w-full h-12" onClick={() => router.push("/paciente/login")}>
              Ir para o login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
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
          <CardTitle>Nova senha</CardTitle>
          <CardDescription>Digite sua nova senha</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Repita a senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading || !password.trim() || !confirm.trim()}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5 mr-2" />}
              {loading ? "Redefinindo..." : "Redefinir senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
