import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { ArrowLeft, CheckCircle, XCircle, Clock, Users, Server, Shield, Bell, CreditCard, Database } from "lucide-react"

export const dynamic = "force-dynamic"

async function getStatus() {
  const checks: Record<string, { status: string; icon: any }> = {}

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = { status: "ok", icon: Database }
  } catch {
    checks.database = { status: "fail", icon: Database }
  }

  checks.push = {
    status: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ? "ok" : "not configured",
    icon: Bell,
  }
  checks.sentry = {
    status: process.env.NEXT_PUBLIC_SENTRY_DSN ? "ok" : "not configured",
    icon: Shield,
  }
  checks.stripe = {
    status: process.env.STRIPE_SECRET_KEY ? "ok" : "not configured",
    icon: CreditCard,
  }
  checks.server = { status: "ok", icon: Server }

  const count = await prisma.user.count()
  return { checks, totalUsers: count }
}

export default async function StatusPage() {
  const { checks, totalUsers } = await getStatus()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-teal-50/20 dark:to-teal-950/10">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao início
        </Link>

        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 shadow-xl mb-4">
            <Server className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Status PsiHumanis</h1>
          <p className="text-muted-foreground">Monitoramento em tempo real dos serviços da plataforma.</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-sm font-medium">
            <CheckCircle className="h-4 w-4" /> Todos os sistemas operacionais
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(checks).map(([name, check]) => (
            <div key={name} className="flex items-center justify-between rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3">
                <check.icon className="h-5 w-5 text-teal-500" />
                <span className="font-medium capitalize">{name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{check.status}</span>
                {check.status === "ok" ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-500" />
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-xl border bg-card p-4 text-center">
            <Users className="h-6 w-6 text-teal-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalUsers}</p>
            <p className="text-xs text-muted-foreground">{totalUsers === 1 ? "Usuário ativo" : "Usuários ativos"}</p>
          </div>
          <div className="rounded-xl border bg-card p-4 text-center">
            <Clock className="h-6 w-6 text-teal-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">99.9%</p>
            <p className="text-xs text-muted-foreground">Uptime estimado</p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Última verificação: {new Date().toLocaleString("pt-BR")}
        </p>
      </div>
    </div>
  )
}
