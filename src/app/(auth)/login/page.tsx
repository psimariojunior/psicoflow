"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Eye, EyeOff, Loader2, Shield, Zap, CheckCircle, Heart, Sparkles } from "lucide-react"
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
      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) { toast.error("Email ou senha incorretos"); return }
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
      <div className="flex flex-1 items-center justify-center px-4 py-12 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-white dark:from-slate-950 dark:to-slate-950" />
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-blue-400/5 blur-3xl" />
        <div className="relative w-full max-w-md space-y-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-blue-700 shadow-2xl shadow-blue-500/30 ring-4 ring-blue-500/20 mb-2">
              <Image src="/logo.png" alt="PsiHumanis" width={80} height={80} className="w-full h-full object-cover" priority />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">PsiHumanis</h1>
            <p className="text-sm text-muted-foreground">Faça login para acessar o sistema</p>
          </div>

          <Card className="border-0 shadow-2xl shadow-blue-500/5 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
            <CardHeader className="pb-4">
              <CardTitle>Entrar</CardTitle>
              <CardDescription>Informe suas credenciais para acessar</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}>
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</> : "Entrar"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/recuperar-senha" className="text-sm text-muted-foreground hover:text-primary transition-colors">Esqueceu a senha?</Link>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Não tem uma conta?</span></div>
          </div>

          <Link href="/register"><Button variant="outline" className="w-full" size="lg">Criar Conta</Button></Link>

          <p className="text-xs text-center text-muted-foreground">
            Ao continuar, você concorda com nossos <Link href="/termos" className="text-primary hover:underline">Termos de Uso</Link> e <Link href="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>.
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-3xl" />
        <div className="relative max-w-md space-y-8 p-12">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-2">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white">Sua clínica na <span className="text-blue-200">palma da sua mão</span></h2>
            <p className="text-lg text-blue-100/80">Gerencie pacientes, agenda, finanças e muito mais em um só lugar. Moderno, seguro e intuitivo.</p>
          </div>
          <div className="grid gap-4">
            {[
              { title: "Agenda Online", desc: "Gerencie seus horários com facilidade", icon: Shield },
              { title: "Prontuários", desc: "Registros clínicos completos e seguros", icon: Zap },
              { title: "Sala Virtual", desc: "Atendimento por vídeo seguro e criptografado", icon: Heart },
              { title: "Financeiro", desc: "Controle de receitas, despesas e notas", icon: CheckCircle },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm p-4 hover:bg-white/15 transition-all">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">{item.title}</p>
                  <p className="text-sm text-blue-100/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-blue-200/60">
            <div className="flex items-center gap-1"><Shield className="h-3 w-3" /> LGPD</div>
            <div className="flex items-center gap-1"><Zap className="h-3 w-3" /> Criptografado</div>
            <div className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> CRP</div>
          </div>
        </div>
      </div>
    </div>
  )
}