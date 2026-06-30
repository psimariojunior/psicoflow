"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Plus, Download, Receipt, Barcode, FileText, Trash2, CheckCircle } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import toast from "react-hot-toast"

interface Invoice {
  id: string
  number: string
  patientName: string
  description: string
  amount: number
  dueDate: string
  status: string
  issueDate: string
  paymentMethod?: string
}

const PAYMENT_METHODS = [
  { value: "PIX", label: "PIX" },
  { value: "CREDIT_CARD", label: "Cartão de Crédito" },
  { value: "BOLETO", label: "Boleto" },
  { value: "CASH", label: "Dinheiro" },
  { value: "TRANSFER", label: "Transferência" },
]

export default function CobrancasPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([])
  const [invForm, setInvForm] = useState({ description: "", amount: "", dueDate: "", patientId: "", notes: "" })
  const [payDialog, setPayDialog] = useState<Invoice | null>(null)
  const [payMethod, setPayMethod] = useState("PIX")
  const [detailDialog, setDetailDialog] = useState<Invoice | null>(null)
  const [pixKey, setPixKey] = useState("")
  const [paymentInfo, setPaymentInfo] = useState("")

  useEffect(() => {
    fetch("/api/pacientes?limit=100")
      .then(r => r.ok ? r.json() : { patients: [] })
      .then(d => setPatients(d.patients || []))
      .catch(() => {})
    fetch("/api/configuracoes")
      .then(r => r.ok ? r.json() : Promise.resolve({} as { pixKey?: string; paymentInfo?: string }))
      .then((d: { pixKey?: string; paymentInfo?: string }) => {
        setPixKey(d.pixKey || "")
        setPaymentInfo(d.paymentInfo || "")
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then((data) => setInvoices(data.invoices || []))
      .catch(() => toast.error("Erro ao carregar faturas"))
      .finally(() => setLoading(false))
  }, [])

  const columns: ColumnDef<Invoice>[] = [
    {
      accessorKey: "number",
      header: "Nº",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.original.number}</span>
        </div>
      ),
    },
    { accessorKey: "patientName", header: "Paciente" },
    { accessorKey: "description", header: "Descrição" },
    { accessorKey: "amount", header: "Valor", cell: ({ row }) => formatCurrency(row.original.amount) },
    { accessorKey: "dueDate", header: "Vencimento", cell: ({ row }) => formatDate(row.original.dueDate) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const inv = row.original
        return (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setDetailDialog(inv)} aria-label="Detalhes">
              <FileText className="h-4 w-4" />
            </Button>
            {inv.status !== "PAID" && inv.status !== "CANCELLED" && (
              <Button variant="ghost" size="icon" onClick={() => { setPayDialog(inv); setPayMethod("PIX") }} aria-label="Marcar como pago">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              </Button>
            )}
            <Button variant="ghost" size="icon" aria-label="Excluir fatura" onClick={async () => {
              if (!confirm("Excluir esta fatura?")) return
              try {
                const res = await fetch(`/api/invoices/${inv.id}`, { method: "DELETE" })
                if (!res.ok) throw new Error()
                toast.success("Fatura excluída")
                setInvoices(prev => prev.filter(i => i.id !== inv.id))
              } catch { toast.error("Erro ao excluir") }
            }}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )
      },
    },
  ]

  const totalOpen = invoices.filter(i => i.status === "PENDING" || i.status === "OVERDUE").reduce((a, i) => a + i.amount, 0)
  const totalOverdue = invoices.filter(i => i.status === "OVERDUE").reduce((a, i) => a + i.amount, 0)

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
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-xl border p-5 space-y-3">
              <div className="h-4 w-24 animate-shimmer rounded" />
              <div className="h-8 w-20 animate-shimmer rounded" />
              <div className="h-3 w-16 animate-shimmer rounded" />
            </div>
          ))}
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
          <h2 className="text-2xl font-bold tracking-tight">Cobranças</h2>
          <p className="text-muted-foreground">Gerenciamento de faturas e cobranças</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => {
            const rows = [["Nº","Paciente","Descrição","Valor","Vencimento","Status"]]
            invoices.forEach((i) => {
              rows.push([i.number, i.patientName, i.description, String(i.amount), formatDate(i.dueDate), i.status])
            })
            const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\n")
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url; a.download = "cobrancas.csv"; a.click()
            URL.revokeObjectURL(url)
            toast.success("CSV exportado!")
          }}><Download className="mr-2 h-4 w-4" /> Exportar</Button>
          <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Nova Fatura</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader><DialogTitle>Nova Fatura</DialogTitle></DialogHeader>
              <form onSubmit={async (e) => {
                e.preventDefault()
                try {
                  const res = await fetch("/api/invoices", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ...invForm, amount: parseFloat(invForm.amount) }),
                  })
                  if (!res.ok) throw new Error()
                  toast.success("Fatura criada!")
                  setShowInvoiceDialog(false)
                  setInvForm({ description: "", amount: "", dueDate: "", patientId: "", notes: "" })
                  const data = await fetch("/api/invoices").then(r => r.json())
                  setInvoices(data.invoices || [])
                } catch { toast.error("Erro ao criar fatura") }
              }} className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input required value={invForm.description} onChange={(e) => setInvForm({...invForm, description: e.target.value})} placeholder="Ex: Sessões de Março" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input type="number" step="0.01" required value={invForm.amount} onChange={(e) => setInvForm({...invForm, amount: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Vencimento</Label>
                    <Input type="date" required value={invForm.dueDate} onChange={(e) => setInvForm({...invForm, dueDate: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <Select value={invForm.patientId} onValueChange={(v) => setInvForm({...invForm, patientId: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {patients.length === 0 ? (
                        <SelectItem value="" disabled>Nenhum paciente cadastrado</SelectItem>
                      ) : patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Observações (opcional)</Label>
                  <Textarea value={invForm.notes} onChange={(e) => setInvForm({...invForm, notes: e.target.value})} rows={2} />
                </div>
                <Button type="submit">Criar Fatura</Button>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={!!payDialog} onOpenChange={(o) => { if (!o) setPayDialog(null) }}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader><DialogTitle>Receber Pagamento</DialogTitle></DialogHeader>
              {payDialog && (
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  try {
                    const res = await fetch(`/api/invoices/${payDialog.id}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "PAID", paymentMethod: payMethod }),
                    })
                    if (!res.ok) throw new Error()
                    toast.success("Pagamento registrado!")
                    setPayDialog(null)
                    const data = await fetch("/api/invoices").then(r => r.json())
                    setInvoices(data.invoices || [])
                  } catch { toast.error("Erro ao registrar pagamento") }
                }} className="space-y-4 py-4">
                  <div className="text-sm text-muted-foreground">
                    Fatura: <strong>{payDialog.number}</strong> — {formatCurrency(payDialog.amount)}
                  </div>
                  <div className="space-y-2">
                    <Label>Método de Pagamento</Label>
                    <Select value={payMethod} onValueChange={setPayMethod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">Confirmar Pagamento</Button>
                </form>
              )}
            </DialogContent>
          </Dialog>
          <Dialog open={!!detailDialog} onOpenChange={(o) => { if (!o) setDetailDialog(null) }}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader><DialogTitle>Detalhes da Fatura</DialogTitle></DialogHeader>
              {detailDialog && (
                <div className="space-y-4 py-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Nº:</span> <strong>{detailDialog.number}</strong></div>
                    <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={detailDialog.status} /></div>
                    <div><span className="text-muted-foreground">Paciente:</span> <strong>{detailDialog.patientName}</strong></div>
                    <div><span className="text-muted-foreground">Valor:</span> <strong>{formatCurrency(detailDialog.amount)}</strong></div>
                    <div><span className="text-muted-foreground">Descrição:</span> <span>{detailDialog.description}</span></div>
                    <div><span className="text-muted-foreground">Vencimento:</span> <span>{formatDate(detailDialog.dueDate)}</span></div>
                    {detailDialog.paymentMethod && (
                      <div><span className="text-muted-foreground">Pagamento:</span> <span>{PAYMENT_METHODS.find(m => m.value === detailDialog.paymentMethod)?.label || detailDialog.paymentMethod}</span></div>
                    )}
                    <div className="col-span-2"><span className="text-muted-foreground">Criada em:</span> <span>{formatDate(detailDialog.issueDate)}</span></div>
                  </div>
                  {detailDialog.status !== "CANCELLED" && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Dados para pagamento</p>
                        <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-2">
                          {pixKey ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-muted-foreground text-xs">PIX</p>
                                <p className="font-mono text-sm">{pixKey}</p>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(pixKey); toast.success("Chave PIX copiada!") }}>Copiar</Button>
                            </div>
                          ) : (
                            <p className="text-muted-foreground italic text-xs">Nenhuma chave PIX configurada em Configurações &gt; Pagamentos</p>
                          )}
                          {paymentInfo && (
                            <p className="text-xs text-muted-foreground whitespace-pre-line">{paymentInfo}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <Receipt className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total de Faturas</p>
                <p className="text-xl font-bold">{invoices.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Barcode className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Faturas Pagas</p>
                <p className="text-xl font-bold">{invoices.filter(i => i.status === "PAID").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Receipt className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Aberto</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(totalOpen)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <Receipt className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vencido</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalOverdue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="overdue">Vencidas</TabsTrigger>
          <TabsTrigger value="paid">Pagas</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <DataTable columns={columns} data={invoices} searchKey="patientName" searchPlaceholder="Buscar fatura..." />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <DataTable columns={columns} data={invoices.filter(i => i.status === "PENDING")} searchKey="patientName" />
        </TabsContent>
        <TabsContent value="overdue" className="mt-4">
          <DataTable columns={columns} data={invoices.filter(i => i.status === "OVERDUE")} searchKey="patientName" />
        </TabsContent>
        <TabsContent value="paid" className="mt-4">
          <DataTable columns={columns} data={invoices.filter(i => i.status === "PAID")} searchKey="patientName" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
