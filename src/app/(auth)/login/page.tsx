"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Email ou senha incorretos")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Erro ao fazer login")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 ring-4 ring-emerald-500/20 mb-2">
              <img src="/logo.png" alt="PsicoFlow" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">PsicoFlow</h1>
            <p className="text-sm text-muted-foreground">
              Faça login para acessar o sistema
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Entrar</CardTitle>
              <CardDescription>
                Informe suas credenciais para acessar
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <Link
                      href="/recuperar-senha"
                      className="text-xs text-primary hover:underline"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
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
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Separator />
              <p className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Cadastre-se
                </Link>
              </p>
            </CardFooter>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Ao continuar, você concorda com nossos{" "}
            <Link href="/termos" className="underline hover:text-primary">
              Termos de Uso
            </Link>{" "}
            e{" "}
            <Link href="/privacidade" className="underline hover:text-primary">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/5 via-primary/10 to-blue-500/20 items-center justify-center">
        <div className="max-w-md space-y-8 p-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold tracking-tight">
              Sua clínica na palma da sua mão
            </h2>
            <p className="text-lg text-muted-foreground">
              Gerencie pacientes, agenda, finanças e muito mais em um só lugar.
              Moderno, seguro e intuitivo.
            </p>
          </div>
          <div className="grid gap-4">
            {[
              { title: "Agenda Online", desc: "Gerencie seus horários com facilidade" },
              { title: "Prontuários", desc: "Registros clínicos completos e seguros" },
              { title: "Sala Virtual", desc: "Atendimento por vídeo, chat e voz" },
              { title: "Financeiro", desc: "Controle de receitas, despesas e notas" },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-3 rounded-xl bg-background/50 p-4 backdrop-blur-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                  {item.title[0]}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
