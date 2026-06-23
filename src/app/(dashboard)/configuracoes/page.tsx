"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getInitials } from "@/lib/utils"
import { Save, User, Bell, Lock, Globe, Palette, Shield, CreditCard, Users, Loader2, Calendar, CheckCircle, XCircle, ExternalLink, AlertTriangle, Camera, Download, FileJson, FileSpreadsheet } from "lucide-react"
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
    avatarUrl: "",
    sessionDuration: 50,
    sessionInterval: 10,
  })
  const [loading, setLoading] = useState(true)
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [subInfo, setSubInfo] = useState<{
    plan: string
    planExpiresAt: string | null
    subscriptionStatus: string
    stripeCustomerId: string | null
    subscription: {
      cancelAtPeriodEnd: boolean
      currentPeriodEnd: string | null
    } | null
  } | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [upgradeLoading, setUpgradeLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState<"csv" | "json" | null>(null)
  const [lastExport, setLastExport] = useState<{ at: string; format: string } | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem("psicoflow_last_export")
    if (raw) {
      try { setLastExport(JSON.parse(raw)) } catch {}
    }
  }, [])

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
            avatarUrl: data.avatarUrl || "",
            sessionDuration: data.sessionDuration || 50,
            sessionInterval: data.sessionInterval || 10,
          })
      })
      .catch(() => toast.error("Erro ao carregar configurações"))
      .finally(() => setLoading(false))

    fetch("/api/subscription/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.plan) setSubInfo(data)
      })
      .catch(() => {})
  }, [])

  const handlePortal = async () => {
    setPortalLoading(true)
    try {
      const res = await fetch("/api/subscription/portal", { method: "POST" })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "Erro ao abrir portal")
      }
    } catch {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setPortalLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setUpgradeLoading(true)
    try {
      const res = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "Erro ao criar checkout")
      }
    } catch {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setUpgradeLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwords.current || !passwords.new) {
      toast.error("Preencha a senha atual e a nova senha")
      return
    }
    if (passwords.new.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres")
      return
    }
    if (passwords.new !== passwords.confirm) {
      toast.error("As senhas não coincidem")
      return
    }
    setPasswordLoading(true)
    try {
      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Erro ao alterar senha")
        return
      }
      toast.success("Senha alterada com sucesso!")
      setPasswords({ current: "", new: "", confirm: "" })
    } catch {
      toast.error("Erro ao alterar senha")
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB")
      return
    }
    if (!file.type.startsWith("image/")) {
      toast.error("O arquivo deve ser uma imagem")
      return
    }
    setAvatarLoading(true)
    try {
      // Resize image to 200x200 for avatar
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!
      const img = new window.Image()
      const base64 = await new Promise<string>((resolve, reject) => {
        img.onload = () => {
          canvas.width = 200
          canvas.height = 200
          ctx.drawImage(img, 0, 0, 200, 200)
          resolve(canvas.toDataURL("image/jpeg", 0.8))
        }
        img.onerror = reject
        img.src = URL.createObjectURL(file)
      })
      const res = await fetch("/api/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: base64 }),
      })
      if (!res.ok) throw new Error()
      setProfile(prev => ({ ...prev, avatarUrl: base64 }))
      toast.success("Foto atualizada com sucesso!")
    } catch {
      toast.error("Erro ao enviar foto")
    } finally {
      setAvatarLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

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

  const handleExport = async (format: "csv" | "json") => {
    setExportLoading(format)
    try {
      const res = await fetch(`/api/export?format=${format}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const disp = res.headers.get("Content-Disposition") || ""
      const match = disp.match(/filename="([^"]+)"/)
      a.download = match ? match[1] : `psicoflow-backup.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      const entry = { at: new Date().toISOString(), format }
      localStorage.setItem("psicoflow_last_export", JSON.stringify(entry))
      setLastExport(entry)
      toast.success(`Exportação ${format.toUpperCase()} concluída!`)
    } catch {
      toast.error("Erro ao exportar dados")
    } finally {
      setExportLoading(null)
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
          <TabsTrigger value="export"><Download className="mr-2 h-4 w-4" />Exportação</TabsTrigger>
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
                  <AvatarImage src={profile.avatarUrl || undefined} alt={profile.name} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarLoading}
                >
                  {avatarLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                  Alterar Foto
                </Button>
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
                    <Input type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nova senha</Label>
                    <Input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar nova senha</Label>
                    <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
                  </div>
                </div>
                <Button variant="outline" onClick={handleChangePassword} disabled={passwordLoading}>
                  {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Alterar Senha
                </Button>
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
                <Select value={String(profile.sessionDuration)} onValueChange={(v) => setProfile({...profile, sessionDuration: parseInt(v)})}>
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
                <Select value={String(profile.sessionInterval)} onValueChange={(v) => setProfile({...profile, sessionInterval: parseInt(v)})}>
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
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Seu plano atual:{" "}
                      <span className="text-emerald-600 dark:text-emerald-400 capitalize">
                        {subInfo?.plan || "trial"}
                      </span>
                    </p>
                    {subInfo?.plan === "trial" && subInfo.planExpiresAt && (
                      <p className="text-xs text-muted-foreground">
                        Trial expira em {new Date(subInfo.planExpiresAt).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                    {subInfo?.subscription?.cancelAtPeriodEnd && subInfo.subscription?.currentPeriodEnd && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Cancelamento agendado para {new Date(subInfo.subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                  {subInfo?.subscriptionStatus && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      subInfo.subscriptionStatus === "active" || subInfo.subscriptionStatus === "trialing"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                        : subInfo.subscriptionStatus === "past_due"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}>
                      {subInfo.subscriptionStatus === "active" ? "Ativo" :
                       subInfo.subscriptionStatus === "trialing" ? "Trial" :
                       subInfo.subscriptionStatus === "past_due" ? "Pagamento pendente" :
                       subInfo.subscriptionStatus}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {subInfo?.stripeCustomerId ? (
                    <Button variant="outline" size="sm" onClick={handlePortal} disabled={portalLoading}>
                      {portalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Gerenciar Assinatura
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleUpgrade} disabled={upgradeLoading}>
                      {upgradeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Fazer Upgrade
                    </Button>
                  )}
                </div>
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Exportação de Dados</CardTitle>
              <CardDescription>Baixe uma cópia de segurança de todos os seus dados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium text-amber-700 dark:text-amber-300">Aviso de LGPD</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Os dados exportados contêm informações pessoais e sensíveis de pacientes protegidos
                      pela Lei Geral de Proteção de Dados (LGPD). Mantenha o arquivo em local seguro e
                      restrito. O compartilhamento indevido pode gerar sanções legais.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start gap-2 p-4"
                  onClick={() => handleExport("csv")}
                  disabled={exportLoading !== null}
                >
                  <div className="flex w-full items-center gap-2">
                    {exportLoading === "csv" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                    )}
                    <span className="font-medium">Exportar CSV</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Planilha compatível com Excel e Google Sheets
                  </p>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col items-start gap-2 p-4"
                  onClick={() => handleExport("json")}
                  disabled={exportLoading !== null}
                >
                  <div className="flex w-full items-center gap-2">
                    {exportLoading === "json" ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <FileJson className="h-5 w-5 text-blue-500" />
                    )}
                    <span className="font-medium">Exportar JSON</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    Backup estruturado para restauração completa
                  </p>
                </Button>
              </div>

              {lastExport && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  Última exportação ({lastExport.format.toUpperCase()}):{" "}
                  {new Date(lastExport.at).toLocaleString("pt-BR")}
                </div>
              )}

              <div className="space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Pacientes, consultas e sessões</p>
                <p className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Transações financeiras e faturas</p>
                <p className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Dados restritos ao seu usuário</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
