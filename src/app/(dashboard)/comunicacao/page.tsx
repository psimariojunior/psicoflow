"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  MessageSquare, Send, Phone, Calendar, Clock, CheckCircle,
  XCircle, Loader2, Search, User, ChevronRight, AlertCircle,
  History, RefreshCw, Smartphone, ExternalLink,
} from "lucide-react"
import toast from "react-hot-toast"

interface Patient {
  id: string
  name: string
  phone: string | null
  email?: string | null
  photoUrl?: string | null
  lastAppointment?: string | null
}

interface MessageLog {
  id: string
  patientId: string
  patientName: string
  phone: string
  message: string
  type: string
  status: string
  createdAt: string
}

export default function ComunicacaoPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState<MessageLog[]>([])
  const [loadingPatients, setLoadingPatients] = useState(true)
  const [tab, setTab] = useState<"send" | "history">("send")

  useEffect(() => {
    fetch("/api/pacientes")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.patients || []
        setPatients(list.filter((p: Patient) => p.phone))
      })
      .catch(() => toast.error("Erro ao carregar pacientes"))
      .finally(() => setLoadingPatients(false))
  }, [])

  const loadHistory = useCallback(async () => {
    try {
      const r = await fetch("/api/notificacoes?channel=WHATSAPP&limit=50")
      const data = await r.json()
      setHistory(Array.isArray(data) ? data : [])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadHistory() }, [loadHistory])

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  )

  const handleSend = async () => {
    if (!selectedPatient || !message.trim()) return
    setSending(true)
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          phone: selectedPatient.phone,
          message: message.trim(),
          type: "text",
        }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success("Mensagem enviada com sucesso!")
        setMessage("")
        loadHistory()
      } else {
        toast.error(data.error || "Erro ao enviar")
      }
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setSending(false)
    }
  }

  const handleSendReminder = async () => {
    if (!selectedPatient) return
    setSending(true)
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          phone: selectedPatient.phone,
          patientName: selectedPatient.name,
          message: `Lembrete de consulta para ${selectedPatient.name}`,
          type: "reminder",
          date: new Date().toLocaleDateString("pt-BR"),
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        }),
      })
      const data = await res.json()
      if (data.ok) {
        toast.success("Lembrete enviado!")
        loadHistory()
      } else {
        toast.error(data.error || "Erro ao enviar lembrete")
      }
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setSending(false)
    }
  }

  const openWhatsAppWeb = () => {
    if (!selectedPatient?.phone) return
    const clean = selectedPatient.phone.replace(/\D/g, "")
    window.open(`https://wa.me/55${clean}`, "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
            Comunicação
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Envie mensagens WhatsApp para seus pacientes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadHistory}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel — Patient list */}
        <div className="lg:col-span-1 rounded-xl border bg-card overflow-hidden">
          <div className="p-3 border-b bg-muted/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          <ScrollArea className="h-[500px]">
            {loadingPatients ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                <Smartphone className="h-8 w-8" />
                <p className="text-sm">Nenhum paciente com WhatsApp</p>
              </div>
            ) : (
              filteredPatients.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 border-b last:border-b-0",
                    "hover:bg-accent/50 hover:pl-5",
                    selectedPatient?.id === p.id
                      ? "bg-emerald-500/10 border-l-2 border-emerald-500"
                      : "border-l-2 border-transparent"
                  )}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-sm font-medium shadow-sm">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.phone}</p>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 text-muted-foreground transition-opacity",
                    selectedPatient?.id === p.id ? "opacity-100" : "opacity-0"
                  )} />
                </button>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Right panel — Chat / Actions */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedPatient ? (
            <div className="flex flex-col items-center justify-center h-[500px] rounded-xl border bg-card">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                <MessageSquare className="h-8 w-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-semibold">Selecione um paciente</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Escolha um paciente ao lado para enviar mensagens
              </p>
            </div>
          ) : (
            <>
              {/* Patient info card */}
              <div className="rounded-xl border bg-gradient-to-br from-emerald-500/5 to-teal-500/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-lg font-bold shadow-md">
                      {selectedPatient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{selectedPatient.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Smartphone className="h-3.5 w-3.5" />
                        {selectedPatient.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={openWhatsAppWeb}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Abrir WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSendReminder} disabled={sending}>
                      {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calendar className="mr-2 h-4 w-4" />}
                      Lembrete
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tab selector */}
              <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
                <button onClick={() => setTab("send")} className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all",
                  tab === "send" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}>
                  <Send className="inline h-4 w-4 mr-1.5" />
                  Enviar Mensagem
                </button>
                <button onClick={() => setTab("history")} className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-all",
                  tab === "history" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}>
                  <History className="inline h-4 w-4 mr-1.5" />
                  Histórico
                </button>
              </div>

              {/* Tab content */}
              {tab === "send" ? (
                <div className="rounded-xl border bg-card p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">
                        Mensagem
                      </label>
                      <Textarea
                        placeholder="Digite sua mensagem aqui..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {message.length}/4096 caracteres
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleSend}
                        disabled={!message.trim() || sending}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/25"
                      >
                        {sending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="mr-2 h-4 w-4" />
                        )}
                        Enviar via WhatsApp
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        A mensagem será enviada como texto comum
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border bg-card overflow-hidden">
                  <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Últimas mensagens</h3>
                    <span className="text-xs text-muted-foreground">{history.length} registros</span>
                  </div>
                  <ScrollArea className="h-[300px]">
                    {history.length === 0 ? (
                      <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                        <History className="h-8 w-8" />
                        <p className="text-sm">Nenhuma mensagem enviada ainda</p>
                      </div>
                    ) : (
                      history
                        .filter((h) => h.patientId === selectedPatient.id || h.patientName === selectedPatient.name)
                        .map((h) => (
                          <div key={h.id} className="flex items-start gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-accent/30 transition-colors">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                              {h.status === "SENT" ? (
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                              ) : h.status === "FAILED" ? (
                                <XCircle className="h-3.5 w-3.5 text-destructive" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-amber-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-xs font-medium px-1.5 py-0.5 rounded",
                                  h.type === "reminder" ? "bg-blue-500/10 text-blue-600" : "bg-emerald-500/10 text-emerald-600"
                                )}>
                                  {h.type === "reminder" ? "Lembrete" : "Texto"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(h.createdAt).toLocaleString("pt-BR")}
                                </span>
                              </div>
                              <p className="text-sm mt-0.5 line-clamp-2">{h.message}</p>
                            </div>
                          </div>
                        ))
                    )}
                  </ScrollArea>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
