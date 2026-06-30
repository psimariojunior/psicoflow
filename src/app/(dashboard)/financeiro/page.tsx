"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { DataTable } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Download, TrendingUp, TrendingDown, DollarSign, Wallet, CreditCard, Loader2, Receipt, ExternalLink, Copy, Check } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import toast from "react-hot-toast"

interface Transaction {
  id: string
  date: string
  description: string
  category: string
  amount: number
  type: "INCOME" | "EXPENSE"
  status: string
  patient?: string
  patientId?: string
}

interface Invoice {
  id: string
  number: string
  description: string
  amount: number
  dueDate: string
  status: string
  patientName: string
  paymentMethod: string | null
  issueDate: string
  stripeCheckoutSessionId: string | null
}

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState("transactions")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [summary, setSummary] = useState({ totalRevenue: 0, totalExpenses: 0, balance: 0 })
  const [loading, setLoading] = useState(true)
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([])
  const [txForm, setTxForm] = useState({ description: "", type: "INCOME", category: "", amount: "", paymentMethod: "", patientId: "", notes: "", dueDate: "" })
  const [invForm, setInvForm] = useState({ description: "", amount: "", patientId: "", dueDate: "" })
  const [dateRange, setDateRange] = useState({ start: "", end: "" })

  useEffect(() => {
    fetch("/api/pacientes?limit=100")
      .then(r => r.ok ? r.json() : { patients: [] })
      .then(d => setPatients(d.patients || []))
      .catch(() => {})
  }, [])

  function loadTransactions(start?: string, end?: string) {
    setLoading(true)
    let url = "/api/financeiro"
    const params = new URLSearchParams()
    if (start) params.set("startDate", start)
    if (end) params.set("endDate", end)
    const qs = params.toString()
    if (qs) url += "?" + qs

    fetch(url)
      .then((res) => { if (!res.ok) throw new Error(); return res.json() })
      .then((data) => {
        if (data.summary) setSummary(data.summary)
        const mapped = (data.transactions || []).map((t: { createdAt: string; paymentStatus: string; patient: { name: string } | null }) => ({
          ...t,
          date: t.createdAt,
          status: t.paymentStatus,
          patient: t.patient?.name || null,
        }))
        setTransactions(mapped)
      })
      .catch(() => toast.error("Erro ao carregar dados financeiros"))
      .finally(() => setLoading(false))
  }

  function loadInvoices() {
    fetch("/api/invoices")
      .then(r => r.ok ? r.json() : { invoices: [] })
      .then(data => setInvoices(data.invoices || []))
      .catch(() => {})
  }

  useEffect(() => { loadTransactions() }, [])
  useEffect(() => { if (activeTab === "invoices") loadInvoices() }, [activeTab])

  const handleCreateInvoice = async (e: React.FormEvent) => {
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
      setInvForm({ description: "", amount: "", patientId: "", dueDate: "" })
      loadInvoices()
    } catch {
      toast.error("Erro ao criar fatura")
    }
  }

  const incomeColumns: ColumnDef<Transaction>[] = [
    { accessorKey: "date", header: "Data", cell: ({ row }) => formatDate(row.original.date) },
    { accessorKey: "description", header: "Descrição" },
    { accessorKey: "category", header: "Categoria" },
    {
      accessorKey: "amount",
      header: "Valor",
      cell: ({ row }) => (
        <span className={row.original.type === "INCOME" ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
          {row.original.type === "INCOME" ? "+ " : "- "}{formatCurrency(row.original.amount)}
        </span>
      ),
    },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ]

  const invoiceColumns: ColumnDef<Invoice>[] = [
    { accessorKey: "number", header: "Nº" },
    { accessorKey: "description", header: "Descrição" },
    { accessorKey: "patientName", header: "Paciente" },
    { accessorKey: "amount", header: "Valor", cell: ({ row }) => formatCurrency(row.original.amount) },
    { accessorKey: "dueDate", header: "Vencimento", cell: ({ row }) => formatDate(row.original.dueDate) },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ]

  const totalRevenue = summary.totalRevenue || transactions.filter(t => t.type === "INCOME").reduce((acc, t) => acc + t.amount, 0)
  const totalExpenses = summary.totalExpenses || transactions.filter(t => t.type === "EXPENSE").reduce((acc, t) => acc + t.amount, 0)
  const pendingAmount = transactions.filter(t => t.type === "INCOME" && (t.status === "PENDING" || t.status === "OVERDUE")).reduce((acc, t) => acc + t.amount, 0)

  if (loading && activeTab === "transactions") {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financeiro</h2>
          <p className="text-muted-foreground">Controle de receitas, despesas e faturas</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === "transactions" && (
            <>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="h-9 w-36" />
                <span className="text-muted-foreground">até</span>
                <Input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="h-9 w-36" />
                <Button variant="secondary" size="sm" onClick={() => loadTransactions(dateRange.start, dateRange.end)}>Filtrar</Button>
                {(dateRange.start || dateRange.end) && (
                  <Button variant="ghost" size="sm" onClick={() => { setDateRange({ start: "", end: "" }); loadTransactions() }}>Limpar</Button>
                )}
              </div>
              <Button variant="outline" onClick={() => {
                try {
                  const esc = (v: string | number | null | undefined) => { if (v === null || v === undefined) return '""'; return '"' + String(v).replace(/"/g, '""') + '"' }
                  const header = "Data;Descrição;Categoria;Valor;Tipo;Status;Paciente\n"
                  const rows = transactions.map((t) =>
                    [esc(formatDate(t.date)), esc(t.description), esc(t.category), esc(t.amount), esc(t.type === "INCOME" ? "Receita" : "Despesa"), esc(t.status), esc(t.patient)].join(";")
                  ).join("\n")
                  const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url; a.download = "financeiro.csv"; a.click()
                  URL.revokeObjectURL(url)
                  toast.success("CSV exportado")
                } catch { toast.error("Erro ao exportar CSV") }
              }}>
                <Download className="mr-2 h-4 w-4" /> Exportar</Button><Button onClick={() => window.print()} variant="outline" size="sm"><Receipt className="mr-2 h-4 w-4" /> PDF</Button><Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
                <DialogTrigger asChild>
                  <Button><Plus className="mr-2 h-4 w-4" /> Nova Transação</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader><DialogTitle>Nova Transação</DialogTitle></DialogHeader>
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    try {
                      const res = await fetch("/api/financeiro", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...txForm, amount: parseFloat(txForm.amount) }),
                      })
                      if (!res.ok) throw new Error()
                      toast.success("Transação criada!")
                      setShowTransactionDialog(false)
                      setTxForm({ description: "", type: "INCOME", category: "", amount: "", paymentMethod: "", patientId: "", notes: "", dueDate: "" })
                      const data = await fetch("/api/financeiro").then(r => r.json())
                      if (data.summary) setSummary(data.summary)
                      const mapped = (data.transactions || []).map((t: { createdAt: string; paymentStatus: string; patient: { name: string } | null }) => ({ ...t, date: t.createdAt, status: t.paymentStatus, patient: t.patient?.name || null }))
                      setTransactions(mapped)
                    } catch { toast.error("Erro ao criar transação") }
                  }} className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Descrição</Label>
                      <Input required value={txForm.description} onChange={(e) => setTxForm({...txForm, description: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select value={txForm.type} onValueChange={(v) => setTxForm({...txForm, type: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INCOME">Receita</SelectItem>
                            <SelectItem value="EXPENSE">Despesa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Valor</Label>
                        <Input type="number" step="0.01" required value={txForm.amount} onChange={(e) => setTxForm({...txForm, amount: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Categoria</Label>
                        <Select value={txForm.category} onValueChange={(v) => setTxForm({...txForm, category: v})}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="session">Sessão</SelectItem>
                            <SelectItem value="package">Pacote</SelectItem>
                            <SelectItem value="supervision">Supervisão</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="rent">Aluguel</SelectItem>
                            <SelectItem value="other">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Forma de Pagamento</Label>
                        <Select value={txForm.paymentMethod} onValueChange={(v) => setTxForm({...txForm, paymentMethod: v})}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PIX">Pix</SelectItem>
                            <SelectItem value="CREDIT_CARD">Cartão de Crédito</SelectItem>
                            <SelectItem value="DEBIT_CARD">Cartão de Débito</SelectItem>
                            <SelectItem value="CASH">Dinheiro</SelectItem>
                            <SelectItem value="BOLETO">Boleto</SelectItem>
                            <SelectItem value="TRANSFER">Transferência</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Paciente (opcional)</Label>
                      <Select value={txForm.patientId} onValueChange={(v) => setTxForm({...txForm, patientId: v})}>
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Data de Vencimento</Label>
                      <Input type="date" value={txForm.dueDate} onChange={(e) => setTxForm({...txForm, dueDate: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Textarea value={txForm.notes} onChange={(e) => setTxForm({...txForm, notes: e.target.value})} rows={2} />
                    </div>
                    <Button type="submit">Criar Transação</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </>
          )}
          {activeTab === "invoices" && (
            <Dialog open={showInvoiceDialog} onOpenChange={setShowInvoiceDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Nova Fatura</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader><DialogTitle>Nova Fatura</DialogTitle></DialogHeader>
                <form onSubmit={handleCreateInvoice} className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input required value={invForm.description} onChange={(e) => setInvForm({...invForm, description: e.target.value})} placeholder="Ex: Consulta de terapia - Maio/2026" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valor (R$)</Label>
                      <Input type="number" step="0.01" required value={invForm.amount} onChange={(e) => setInvForm({...invForm, amount: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Vencimento</Label>
                      <Input type="date" required value={invForm.dueDate} onChange={(e) => setInvForm({...invForm, dueDate: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Paciente</Label>
                    <Select value={invForm.patientId} onValueChange={(v) => setInvForm({...invForm, patientId: v})}>
                      <SelectTrigger><SelectValue placeholder="Selecione o paciente" /></SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit">Criar Fatura</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Receitas</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Despesas</p>
                <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                <Wallet className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Saldo</p>
                <p className="text-xl font-bold">{formatCurrency(totalRevenue - totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <CreditCard className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">A Receber</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(pendingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="income">Receitas</TabsTrigger>
              <TabsTrigger value="expenses">Despesas</TabsTrigger>
              <TabsTrigger value="pending">Pendentes</TabsTrigger>
              <TabsTrigger value="overdue">Vencidas</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <DataTable columns={incomeColumns} data={transactions} searchKey="description" searchPlaceholder="Buscar transação..." />
            </TabsContent>
            <TabsContent value="income" className="mt-4">
              <DataTable columns={incomeColumns} data={transactions.filter(t => t.type === "INCOME")} searchKey="description" />
            </TabsContent>
            <TabsContent value="expenses" className="mt-4">
              <DataTable columns={incomeColumns} data={transactions.filter(t => t.type === "EXPENSE")} searchKey="description" />
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              <DataTable columns={incomeColumns} data={transactions.filter(t => t.status === "PENDING")} searchKey="description" />
            </TabsContent>
            <TabsContent value="overdue" className="mt-4">
              <DataTable columns={incomeColumns} data={transactions.filter(t => t.status === "OVERDUE")} searchKey="description" />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="invoices" className="mt-4">
          <DataTable columns={invoiceColumns} data={invoices} searchKey="description" searchPlaceholder="Buscar fatura..." />
        </TabsContent>
      </Tabs>
    </div>
  )
}

