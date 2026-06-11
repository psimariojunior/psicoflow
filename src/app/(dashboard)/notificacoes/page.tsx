"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Switch } from "@/components/ui/switch"
import { formatDate, formatDateTime } from "@/lib/utils"
import { Bell, Send, History, Mail, MessageSquare, Phone, Smartphone, Loader2 } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import toast from "react-hot-toast"

interface NotificationItem {
  id: string
  title: string
  patientName: string | null
  channel: string
  status: string
  sentAt: string | null
  createdAt: string
}

const channelIcons: Record<string, React.ReactNode> = {
  EMAIL: <Mail className="h-4 w-4" />,
  SMS: <MessageSquare className="h-4 w-4" />,
  WHATSAPP: <Phone className="h-4 w-4" />,
  PUSH: <Smartphone className="h-4 w-4" />,
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([])
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    channel: "WHATSAPP",
    patientId: "",
    sendLater: false,
    sendAt: "",
  })

  function handleChange(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await fetch("/api/notificacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error()
      toast.success("Notificação enviada com sucesso!")
      setFormData({ title: "", message: "", channel: "WHATSAPP", patientId: "", sendLater: false, sendAt: "" })
    } catch {
      toast.error("Erro ao enviar notificação")
    }
  }

  useEffect(() => {
    Promise.all([
      fetch("/api/notificacoes").then((r) => { if (!r.ok) throw new Error(); return r.json() }),
      fetch("/api/pacientes?limit=100").then((r) => { if (!r.ok) throw new Error(); return r.json() }),
    ])
      .then(([notifData, patData]) => {
        setNotifications(notifData || [])
        setPatients(patData.patients || [])
      })
      .catch(() => toast.error("Erro ao carregar dados"))
      .finally(() => setLoading(false))
  }, [])

  const columns: ColumnDef<NotificationItem>[] = [
    { accessorKey: "title", header: "Título" },
    { accessorKey: "patientName", header: "Paciente" },
    {
      accessorKey: "channel",
      header: "Canal",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {channelIcons[row.original.channel]}
          <span>{row.original.channel}</span>
        </div>
      ),
    },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { accessorKey: "sentAt", header: "Enviado em", cell: ({ row }) => row.original.sentAt ? formatDateTime(row.original.sentAt) : "-" },
  ]

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notificações</h2>
          <p className="text-muted-foreground">
            Envie lembretes e comunicações para seus pacientes
          </p>
        </div>
      </div>

      <Tabs defaultValue="send">
        <TabsList>
          <TabsTrigger value="send">
            <Send className="mr-2 h-4 w-4" />
            Enviar Notificação
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Nova Notificação</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      required
                      placeholder="Ex: Lembrete de Consulta"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mensagem</Label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      required
                      rows={4}
                      placeholder="Digite a mensagem que será enviada..."
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Canal de Envio</Label>
                      <Select value={formData.channel} onValueChange={(v) => handleChange("channel", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                          <SelectItem value="EMAIL">E-mail</SelectItem>
                          <SelectItem value="SMS">SMS</SelectItem>
                          <SelectItem value="PUSH">Push (App)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Paciente (opcional)</Label>
                      <Select value={formData.patientId} onValueChange={(v) => handleChange("patientId", v)}>
                        <SelectTrigger><SelectValue placeholder="Todos os pacientes" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          {patients.map((p) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <Switch
                      checked={formData.sendLater}
                      onCheckedChange={(v) => handleChange("sendLater", v)}
                    />
                    <div>
                      <p className="text-sm font-medium">Agendar envio</p>
                      <p className="text-xs text-muted-foreground">Defina uma data e hora para envio</p>
                    </div>
                  </div>
                  {formData.sendLater && (
                    <div className="space-y-2">
                      <Label>Data e hora de envio</Label>
                      <Input
                        type="datetime-local"
                        value={formData.sendAt}
                        onChange={(e) => handleChange("sendAt", e.target.value)}
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Notificação
                    </Button>
                    <Button type="button" variant="outline" onClick={async () => {
                      const phone = prompt("WhatsApp do psicólogo (com DDD, ex: 5511999999999):")
                      if (!phone) return
                      try {
                        const res = await fetch(`/api/cron/lembretes?testwhatsapp=true&to=${encodeURIComponent(phone)}`)
                        const data = await res.json()
                        toast[data.ok ? "success" : "error"](data.ok ? "WhatsApp funcionando!" : data.error || "Falha")
                      } catch { toast.error("Erro ao testar WhatsApp") }
                    }}>
                      <Send className="mr-2 h-4 w-4" />
                      Testar WhatsApp
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Canais Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { icon: Phone, name: "WhatsApp", desc: "Mensagens instantâneas", status: "Conectado", color: "text-emerald-500" },
                  { icon: Mail, name: "E-mail", desc: "Disparo de emails", status: "Conectado", color: "text-blue-500" },
                  { icon: MessageSquare, name: "SMS", desc: "Mensagens de texto", status: "Configurar", color: "text-amber-500" },
                  { icon: Smartphone, name: "Push", desc: "Notificações no app", status: "Ativo", color: "text-primary" },
                ].map((channel) => (
                  <div key={channel.name} className="flex items-center gap-3 rounded-lg border p-3">
                    <channel.icon className={`h-5 w-5 ${channel.color}`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{channel.name}</p>
                      <p className="text-xs text-muted-foreground">{channel.desc}</p>
                    </div>
                    <StatusBadge status={channel.status} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <DataTable columns={columns} data={notifications} searchKey="patientName" searchPlaceholder="Buscar notificação..." />
        </TabsContent>
      </Tabs>
    </div>
  )
}
