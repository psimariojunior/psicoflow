"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    crp: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Senhas não conferem")
        return
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          crp: formData.crp,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Erro ao cadastrar")
        return
      }

      toast.success("Conta criada com sucesso!")
      router.push("/login")
    } catch {
      toast.error("Erro ao cadastrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 ring-4 ring-emerald-500/20 mb-1">
            <img src="/logo.png" alt="PsicoFlow" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold">Criar Conta</h1>
          <p className="text-sm text-muted-foreground">
            Comece a gerenciar sua clínica
          </p>
        </div>

        {step === 1 ? (
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>Informe seus dados para criar sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crp">CRP (opcional)</Label>
                  <Input
                    id="crp"
                    placeholder="00/00000"
                    value={formData.crp}
                    onChange={(e) => setFormData({ ...formData, crp: e.target.value })}
                  />
                </div>
                <Button onClick={() => setStep(2)} className="w-full">
                  Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Crie uma senha forte para sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <div className="flex gap-2 text-xs">
                    <span className={formData.password.length >= 8 ? "text-emerald-500" : "text-muted-foreground"}>
                      <CheckCircle2 className="mr-1 inline h-3 w-3" />
                      8+ caracteres
                    </span>
                    <span className={/[A-Z]/.test(formData.password) ? "text-emerald-500" : "text-muted-foreground"}>
                      Maiúscula
                    </span>
                    <span className={/[0-9]/.test(formData.password) ? "text-emerald-500" : "text-muted-foreground"}>
                      Número
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repita a senha"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="flex items-center gap-1 text-xs text-destructive">
                      <AlertCircle className="h-3 w-3" />
                      Senhas não conferem
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Voltar
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      "Criar Conta"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
