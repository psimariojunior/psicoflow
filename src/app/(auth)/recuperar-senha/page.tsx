"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import toast from "react-hot-toast"

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) throw new Error()
      setSent(true)
      toast.success("Email de recuperação enviado!")
    } catch {
      toast.error("Erro ao enviar email de recuperação")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 ring-4 ring-emerald-500/20 mb-1">
            <Image src="/logo.png" alt="PsiHumanis" width={80} height={80} className="w-full h-full object-cover" priority />
          </div>
          <h1 className="text-3xl font-bold">Recuperar Senha</h1>
          <p className="text-sm text-muted-foreground">
            {sent ? "Verifique seu email" : "Digite seu email para receber o link de recuperação"}
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>{sent ? "Email Enviado" : "Recuperação"}</CardTitle>
            <CardDescription>
              {sent
                ? "Enviamos um link de recuperação para seu email. Verifique sua caixa de entrada."
                : "Informe o email cadastrado na sua conta"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <Mail className="mx-auto h-12 w-12 text-primary" />
                <p className="text-sm text-muted-foreground">
                  Não recebeu o email? Verifique a caixa de spam ou{" "}
                  <button onClick={() => setSent(false)} className="text-primary hover:underline">
                    tente novamente
                  </button>
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Voltar para o login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Link de Recuperação"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/login" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  )
}
