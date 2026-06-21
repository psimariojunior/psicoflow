"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getInitials } from "@/lib/utils"
import { Save, User, Bell, Lock, Globe, Palette, Shield, CreditCard, Users, Loader2, Calendar, CheckCircle, XCircle, ExternalLink, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"

function GoogleCalendarStatus() {
  const [connected, setConnected] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ synced?: number; failed?: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [configMissing, setConfigMissing] = useState(false)

  useEffect(() => {
    fetch("/api/integrations/google-calendar")
      .then((r) => r.json())
      .then((data) => {
        if (data.connected !== undefined) setConnected(data.connected)
        if (data.configMissing) setConfigMissing(true)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleConnect = () => {
    window.location.href = "/api/integrations/google-calendar/auth"
  }

  const handleDisconnect = async () => {
    try {
      const res = await fetch("/api/integrations/google-calendar", { method: "POST" })
      if (res.ok) {
        setConnected(false)
        toast.success("Google Calendar desconectado")
      }
    } catch {
      toast.error("Erro ao desconectar")
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch("/api/integrations/google-calendar/sync", { method: "POST" })
      const data = await res.json()
      setSyncResult(data)
      if (res.ok) {
        toast.success(`${data.synced} consulta(s) sincronizada(s)`)
      }
    } catch {
      toast.error("Erro ao sincronizar")
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Verificando integração...
      </div>
    )
  }

  if (configMissing) {
    return (
      <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <p className="font-medium text-amber-700 dark:text-amber-300">Integração não configurada</p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Configure as variáveis de ambiente <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">GOOGLE_CALENDAR_CLIENT_ID</code> e <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded text-xs">GOOGLE_CALENDAR_CLIENT_SECRET</code> no Vercel para ativar a integração.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (connected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="font-medium text-emerald-700 dark:text-emerald-300">Google Calendar conectado</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Suas consultas serão sincronizadas automaticamente</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleDisconnect} className="text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950">
            <XCircle className="mr-1 h-4 w-4" /> Desconectar
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSync} disabled={syncing}>
            {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
            {syncing ? "Sincronizando..." : "Sincronizar Agora"}
          </Button>
          <Button variant="outline" asChild>
            <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Abrir Google Agenda
            </a>
          </Button>
        </div>

        {syncResult && (
          <div className="rounded-lg border p-3 text-sm space-y-1">
            <p className={syncResult.failed ? "text-amber-500" : "text-emerald-500"}>
              Sincronização concluída: {syncResult.synced} criado(s)
              {syncResult.failed ? `, ${syncResult.failed} falha(s)` : ""}
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium">Conectar Google Calendar</p>
          <p className="text-sm text-muted-foreground">Agende consultas diretamente do Google Agenda</p>
        </div>
        <Button onClick={handleConnect}>
          <Calendar className="mr-2 h-4 w-4" /> Conectar
        </Button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    crp: "",
    phone: "",
    specialty: "",
    bio: "",
    pixKey: "",
    paymentInfo: "",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/configuracoes")
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then((data) => {
        if (data.name) setProfile({
          name: data.name || "",
          email: data.email || "",
          crp: data.crp || "",
          phone: data.phone || "",
          specialty: data.specialty || "",
          bio: data.bio || "",
          pixKey: data.pixKey || "",
          paymentInfo: data.paymentInfo || "",
        })
      })
      .catch(() => toast.error("Erro ao carregar configurações"))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    try {
      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error()
      toast.success("Configurações salvas com sucesso!")
    } catch {
      toast.error("Erro ao salvar configurações")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-44 animate-shimmer rounded-lg" />
          <div className="h-4 w-64 animate-shimmer rounded-lg" />
        </div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-28 animate-shimmer rounded-lg" />
          ))}
        </div>
        <div className="rounded-xl border p-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="h-4 w-32 animate-shimmer rounded" />
                <div className="h-3 w-48 animate-shimmer rounded" />
              </div>
              <div className="h-9 w-20 animate-shimmer rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie suas preferências e configurações do sistema
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="flex-wrap">
          <TabsTrigger value="profile"><User className="mr-2 h-4 w-4" />Perfil</TabsTrigger>
          <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notificações</TabsTrigger>
          <TabsTrigger value="security"><Lock className="mr-2 h-4 w-4" />Segurança</TabsTrigger>
          <TabsTrigger value="appearance"><Palette className="mr-2 h-4 w-4" />Aparência</TabsTrigger>
          <TabsTrigger value="schedule"><Globe className="mr-2 h-4 w-4" />Agenda</TabsTrigger>
          <TabsTrigger value="financial"><CreditCard className="mr-2 h-4 w-4" />Pagamentos</TabsTrigger>
          <TabsTrigger value="team"><Users className="mr-2 h-4 w-4" />Equipe</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Perfil</CardTitle>
              <CardDescription>Atualize suas informações pessoais e profissionais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline">Alterar Foto</Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome completo</Label>
                  <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>CRP</Label>
                  <Input value={profile.crp} onChange={(e) => setProfile({...profile, crp: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Input value={profile.specialty} onChange={(e) => setProfile({...profile, specialty: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Biografia</Label>
                <Textarea rows={4} value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} />
              </div>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" /> Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificações</CardTitle>
              <CardDescription>Configure como deseja ser notificado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "WhatsApp", desc: "Receber notificações via WhatsApp", enabled: true },
                { title: "E-mail", desc: "Receber notificações por email", enabled: true },
                { title: "SMS", desc: "Receber notificações por SMS", enabled: false },
                { title: "Push", desc: "Notificações push no navegador", enabled: true },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.enabled} />
                </div>
              ))}
              <Separator />
              <div className="space-y-3">
                <p className="font-medium">Lembretes Automáticos</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lembrar paciente 24h antes</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Lembrar paciente 1h antes</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Confirmar presença após agendamento</span>
                  <Switch defaultChecked />
                </div>
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>Proteja sua conta e dados dos pacientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Alterar Senha</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Senha atual</Label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Nova senha</Label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar nova senha</Label>
                    <Input type="password" />
                  </div>
                </div>
                <Button variant="outline">Alterar Senha</Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Autenticação em Dois Fatores (2FA)</h3>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança à sua conta
                </p>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Autenticação 2FA</p>
                    <p className="text-sm text-muted-foreground">Proteção adicional no login</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sessões Ativas</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">Windows • Chrome</p>
                      <p className="text-xs text-muted-foreground">Ativo agora • São Paulo</p>
                    </div>
                    <span className="text-xs text-emerald-500">Atual</span>
                  </div>
                  <Button variant="destructive" size="sm">Encerrar Todas as Sessões</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Aparência</CardTitle>
              <CardDescription>Personalize a aparência do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Tema Escuro</p>
                  <p className="text-sm text-muted-foreground">Alternar entre tema claro e escuro</p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label>Idioma</Label>
                <Select defaultValue="pt-BR">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Agenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Duração padrão da sessão (minutos)</Label>
                <Select defaultValue="40">
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="40">40 min</SelectItem>
                    <SelectItem value="50">50 min</SelectItem>
                    <SelectItem value="60">60 min</SelectItem>
                    <SelectItem value="90">90 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Intervalo entre consultas (minutos)</Label>
                <Select defaultValue="10">
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sem intervalo</SelectItem>
                    <SelectItem value="10">10 min</SelectItem>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Google Calendar</CardTitle>
              <CardDescription>Sincronize seus agendamentos automaticamente com o Google Agenda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GoogleCalendarStatus />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Pagamentos</CardTitle>
              <CardDescription>Configure como os pacientes podem pagar pelas consultas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Chave PIX</Label>
                <Input
                  value={profile.pixKey}
                  onChange={(e) => setProfile({...profile, pixKey: e.target.value})}
                  placeholder="CPF, CNPJ, email, telefone ou chave aleatória"
                />
                <p className="text-sm text-muted-foreground">
                  A chave PIX será exibida nas faturas para o paciente realizar o pagamento
                </p>
              </div>
              <div className="space-y-2">
                <Label>Instruções de Pagamento</Label>
                <Textarea
                  rows={4}
                  value={profile.paymentInfo}
                  onChange={(e) => setProfile({...profile, paymentInfo: e.target.value})}
                  placeholder="Ex: Após o pagamento, envie o comprovante via WhatsApp..."
                />
                <p className="text-sm text-muted-foreground">
                  Informações adicionais exibidas nas faturas do paciente
                </p>
              </div>
              <div className="rounded-lg border bg-card p-4 space-y-2">
                <p className="text-sm font-medium">Pré-visualização na fatura do paciente</p>
                <div className="rounded-md bg-slate-100 dark:bg-slate-800 p-3 text-sm space-y-1">
                  {profile.pixKey ? (
                    <p><strong>PIX:</strong> {profile.pixKey}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Nenhuma chave PIX configurada</p>
                  )}
                  {profile.paymentInfo && (
                    <p className="text-muted-foreground whitespace-pre-line">{profile.paymentInfo}</p>
                  )}
                </div>
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Equipe</CardTitle>
              <CardDescription>Convide outros profissionais para sua clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">Seu plano atual: Profissional</p>
                <p className="text-xs text-muted-foreground">Limite: 1 usuário</p>
                <Button variant="outline" size="sm" className="mt-2">Fazer Upgrade</Button>
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
