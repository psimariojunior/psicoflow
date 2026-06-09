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
import { Plus, Download, Receipt, Barcode, FileText, Loader2 } from "lucide-react"
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
}

export default function CobrancasPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([])
  const [invForm, setInvForm] = useState({ description: "", amount: "", dueDate: "", patientId: "", notes: "" })

  useEffect(() => {
    fetch("/api/pacientes?limit=100")
      .then(r => r.ok ? r.json() : { patients: [] })
      .then(d => setPatients(d.patients || []))
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
  ]

  const totalOpen = invoices.filter(i => i.status === "PENDING" || i.status === "OVERDUE").reduce((a, i) => a + i.amount, 0)
  const totalOverdue = invoices.filter(i => i.status === "OVERDUE").reduce((a, i) => a + i.amount, 0)

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
          <h2 className="text-2xl font-bold tracking-tight">Cobranças</h2>
          <p className="text-muted-foreground">Gerenciamento de faturas e cobranças</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Exportar</Button>
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
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Receipt className="h-5 w-5 text-blue-600" />
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
