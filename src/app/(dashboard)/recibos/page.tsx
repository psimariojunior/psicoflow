"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency, formatDateTime } from "@/lib/utils"
import { Plus, FileText, Send, XCircle, Search, Printer } from "lucide-react"
import toast from "react-hot-toast"
import Link from "next/link"

interface Receipt {
  id: string
  number: string
  patientName: string
  patientDoc?: string | null
  description: string
  amount: number
  issueDate: string
  paymentMethod?: string | null
  status: string
  sentAt?: string | null
}

interface Patient {
  id: string
  name: string
  document?: string | null
}

const STATUS_MAP: Record<string, { label: string; variant: string }> = {
  ISSUED: { label: "Emitido", variant: "info" },
  SENT: { label: "Enviado", variant: "success" },
  CANCELLED: { label: "Cancelado", variant: "outline" },
}

const PAYMENT_METHODS = [
  { value: "PIX", label: "PIX" },
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "CARTAO", label: "Cartão" },
  { value: "TRANSFERENCIA", label: "Transferência" },
  { value: "BOLETO", label: "Boleto" },
]

export default function RecibosPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientSearch, setPatientSearch] = useState("")
  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    patientDoc: "",
    appointmentId: "",
    description: "",
    amount: "",
    paymentMethod: "",
  })

  const loadReceipts = () => {
    fetch("/api/recibos")
      .then((r) => { if (!r.ok) throw new Error(); return r.json() })
      .then(setReceipts)
      .catch(() => toast.error("Erro ao carregar recibos"))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadReceipts()
    fetch("/api/pacientes?limit=100")
      .then((r) => r.ok ? r.json() : { patients: [] })
      .then((d) => setPatients(d.patients || []))
      .catch(() => {})
  }, [])

  const searchPatients = patients.filter(
    (p) =>
      !patientSearch ||
      p.name.toLowerCase().includes(patientSearch.toLowerCase())
  )

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find((p) => p.id === patientId)
    if (patient) {
      setForm({ ...form, patientId, patientName: patient.name, patientDoc: patient.document || "" })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/recibos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: parseFloat(form.amount),
        }),
      })
      if (!res.ok) throw new Error()
      toast.success("Recibo emitido!")
      setShowDialog(false)
      setForm({ patientId: "", patientName: "", patientDoc: "", appointmentId: "", description: "", amount: "", paymentMethod: "" })
      loadReceipts()
    } catch {
      toast.error("Erro ao emitir recibo")
    }
  }

  const handleCancel = async (id: string) => {
    if (!confirm("Cancelar este recibo?")) return
    try {
      const res = await fetch(`/api/recibos/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Recibo cancelado")
      loadReceipts()
    } catch {
      toast.error("Erro ao cancelar recibo")
    }
  }

  const handleSend = async (id: string) => {
    try {
      const res = await fetch(`/api/recibos/${id}/enviar`, { method: "POST" })
      if (!res.ok) throw new Error()
      toast.success("Recibo enviado por email!")
      loadReceipts()
    } catch {
      toast.error("Erro ao enviar recibo")
    }
  }

  const statusBadge = (status: string) => {
    const s = STATUS_MAP[status] || { label: status, variant: "outline" }
    const variants: Record<string, string> = {
      info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
      outline: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    }
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[s.variant] || variants.outline}`}>
        {s.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-40 animate-shimmer rounded-lg" />
            <div className="h-4 w-64 animate-shimmer rounded-lg" />
          </div>
          <div className="h-9 w-36 animate-shimmer rounded-lg" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border p-4">
              <div className="h-5 w-20 animate-shimmer rounded" />
              <div className="h-4 w-32 animate-shimmer rounded flex-1" />
              <div className="h-4 w-24 animate-shimmer rounded" />
              <div className="h-6 w-24 animate-shimmer rounded-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Recibos</h2>
          <p className="text-muted-foreground">Emissão e gerenciamento de recibos</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700"><Plus className="mr-2 h-4 w-4" /> Emitir Recibo</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader><DialogTitle>Emitir Recibo</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select value={form.patientId} onValueChange={handlePatientSelect}>
                  <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                  <SelectContent>
                    <div className="flex items-center gap-2 px-3 pb-2 border-b" onPointerDown={(e) => e.stopPropagation()}>
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <input
                        className="flex h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        placeholder="Buscar..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                      />
                    </div>
                    {searchPatients.length === 0 ? (
                      <SelectItem value="" disabled>Nenhum paciente encontrado</SelectItem>
                    ) : searchPatients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Paciente</Label>
                  <Input value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} placeholder="Nome" />
                </div>
                <div className="space-y-2">
                  <Label>CPF / Documento</Label>
                  <Input value={form.patientDoc} onChange={(e) => setForm({ ...form, patientDoc: e.target.value })} placeholder="Opcional" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Sessão de psicoterapia - 15/06/2026" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" required />
                </div>
                <div className="space-y-2">
                  <Label>Forma de Pagamento</Label>
                  <Select value={form.paymentMethod} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Emitir Recibo</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {receipts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Nenhum recibo emitido</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Emita seu primeiro recibo clicando no botão acima.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {receipts.map((receipt) => (
            <Card key={receipt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{receipt.number}</p>
                        {statusBadge(receipt.status)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{receipt.patientName}</p>
                      <p className="text-xs text-muted-foreground/60">{receipt.description}</p>
                      <p className="text-xs text-muted-foreground/50 mt-1">{formatDateTime(receipt.issueDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-lg text-blue-600">{formatCurrency(receipt.amount)}</p>
                      {receipt.paymentMethod && (
                        <p className="text-xs text-muted-foreground">{receipt.paymentMethod}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/api/recibos/${receipt.id}/pdf`} target="_blank">
                        <Button variant="ghost" size="icon" aria-label="Visualizar PDF">
                          <Printer className="h-4 w-4 text-blue-500" />
                        </Button>
                      </Link>
                      {receipt.status !== "CANCELLED" && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleSend(receipt.id)} aria-label="Enviar Email">
                            <Send className="h-4 w-4 text-emerald-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleCancel(receipt.id)} aria-label="Cancelar">
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
