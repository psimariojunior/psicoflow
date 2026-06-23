"use client"

import { useEffect, useState } from "react"
import { usePatientAuth } from "@/components/patient-auth-provider"
import { Button } from "@/components/ui/button"
import { Loader2, Receipt, CheckCircle, Clock, AlertCircle, FileText, Copy, Check, CreditCard } from "lucide-react"
import toast from "react-hot-toast"

interface Invoice {
  id: string
  number: string
  description: string
  amount: number
  totalAmount: number
  dueDate: string
  paidDate: string | null
  paymentMethod: string | null
  status: string
  issueDate: string
  psychologistName: string
  pixKey: string | null
  paymentInfo: string | null
}

interface InvoicesResponse {
  invoices: Invoice[]
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "Pendente", color: "text-amber-400", icon: Clock },
  PAID: { label: "Pago", color: "text-primary", icon: CheckCircle },
  OVERDUE: { label: "Vencido", color: "text-red-400", icon: AlertCircle },
  CANCELLED: { label: "Cancelado", color: "text-muted-foreground", icon: FileText },
}

const methodLabels: Record<string, string> = {
  PIX: "PIX",
  CREDIT_CARD: "Cartão de Crédito",
  BOLETO: "Boleto",
  CASH: "Dinheiro",
  TRANSFER: "Transferência",
}

export default function PatientInvoicesPage() {
  const { token } = usePatientAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [payingId, setPayingId] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    fetch("/api/pacientes/invoices", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: InvoicesResponse) => setInvoices(data.invoices || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("pt-BR")
  }

  const copyPix = async (key: string, id: string) => {
    try {
      await navigator.clipboard.writeText(key)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {}
  }

  const totalPending = invoices
    .filter((i) => i.status === "PENDING" || i.status === "OVERDUE")
    .reduce((a, i) => a + i.totalAmount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Minhas Faturas</h1>
        <p className="text-muted-foreground text-sm mt-1">Histórico de cobranças</p>
      </div>

      {totalPending > 0 && (
        <div className="bg-amber-500/10 rounded-2xl p-4 ring-1 ring-amber-500/20 mb-6 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
          <p className="text-amber-300 text-sm">
            Você possui <strong>R$ {totalPending.toFixed(2)}</strong> em faturas pendentes.
          </p>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 ring-1 ring-border text-center">
          <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhuma fatura encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => {
            const config = statusConfig[inv.status] || statusConfig.PENDING
            const Icon = config.icon
            const isUnpaid = inv.status === "PENDING" || inv.status === "OVERDUE"
            return (
              <div key={inv.id} className="bg-card rounded-2xl p-5 ring-1 ring-border">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      <span className="text-foreground font-medium">{inv.description}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Fatura {inv.number}</p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                      <span className="text-foreground">
                        <strong>Vencimento:</strong> {formatDate(inv.dueDate)}
                      </span>
                      {inv.paidDate && (
                        <span className="text-primary">
                          <strong>Pago em:</strong> {formatDate(inv.paidDate)}
                        </span>
                      )}
                    </div>
                    {inv.paymentMethod && (
                      <span className="text-xs text-muted-foreground">
                        Pagamento: {methodLabels[inv.paymentMethod] || inv.paymentMethod}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">
                      R$ {inv.totalAmount.toFixed(2)}
                    </p>
                    <p className={`text-xs mt-1 ${config.color}`}>{config.label}</p>
                  </div>
                </div>

                {isUnpaid && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <p className="text-sm font-medium text-foreground">
                      Dados para pagamento
                    </p>

                    {inv.pixKey && (
                      <div className="bg-card rounded-xl p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-0.5">PIX</p>
                            <p className="text-sm text-foreground font-mono truncate">{inv.pixKey}</p>
                          </div>
                          <button
                            onClick={() => copyPix(inv.pixKey!, inv.id)}
                            className="flex-shrink-0 ml-3 p-2 rounded-lg bg-card hover:bg-accent transition-colors"
                            aria-label="Copiar chave PIX"
                          >
                            {copiedId === inv.id ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : (
                              <Copy className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                        {inv.paymentInfo && (
                          <p className="text-xs text-muted-foreground whitespace-pre-line">{inv.paymentInfo}</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-muted-foreground">ou</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    <Button
                      onClick={async () => {
                        setPayingId(inv.id)
                        try {
                          const headers: Record<string, string> = { "Content-Type": "application/json" }
                          if (token) headers["Authorization"] = `Bearer ${token}`
                          const res = await fetch("/api/pagamentos/public-checkout", {
                            method: "POST",
                            headers,
                            body: JSON.stringify({ invoiceId: inv.id }),
                          })
                          const data = await res.json()
                          if (res.ok && data.url) {
                            window.location.href = data.url
                          } else {
                            toast.error(data.error || "Erro ao processar pagamento")
                          }
                        } catch {
                          toast.error("Erro ao conectar com gateway de pagamento")
                        } finally {
                          setPayingId(null)
                        }
                      }}
                      disabled={payingId === inv.id}
                      className="w-full"
                    >
                      {payingId === inv.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="mr-2 h-4 w-4" />
                      )}
                      Pagar com Cartão ou Boleto
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}