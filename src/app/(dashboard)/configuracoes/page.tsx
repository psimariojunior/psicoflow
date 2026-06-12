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
import { Save, User, Bell, Lock, Globe, Palette, Shield, CreditCard, Users, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

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
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

        <TabsContent value="schedule" className="mt-4">
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
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Integração Google Calendar</p>
                  <p className="text-sm text-muted-foreground">Sincronizar agenda com Google</p>
                </div>
                <Button variant="outline">Conectar</Button>
              </div>
              <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" /> Salvar</Button>
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
