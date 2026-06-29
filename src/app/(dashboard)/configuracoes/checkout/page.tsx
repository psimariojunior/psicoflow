"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { loadStripe } from "@stripe/stripe-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle, CreditCard } from "lucide-react"
import toast from "react-hot-toast"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "pro"
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const paymentRef = useRef<HTMLDivElement>(null)

  const createCheckout = useCallback(async () => {
    try {
      const res = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao criar checkout")
      setClientSecret(data.clientSecret)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar checkout")
    } finally {
      setLoading(false)
    }
  }, [plan])

  useEffect(() => { createCheckout() }, [createCheckout])

  useEffect(() => {
    if (!clientSecret || !paymentRef.current) return

    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!pk) { setError("Chave pública do Stripe não configurada"); return }

    let cancelled = false

    loadStripe(pk).then((stripe) => {
      if (cancelled || !stripe || !paymentRef.current) return

      const elements = stripe.elements({
        clientSecret,
        appearance: { theme: "stripe", variables: { colorPrimary: "#3B82F6" } },
      })

      const paymentElement = elements.create("payment")
      if (!cancelled) paymentElement.mount(paymentRef.current)
    })

    return () => { cancelled = true }
  }, [clientSecret])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentRef.current) return

    const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    if (!pk) return

    setProcessing(true)
    try {
      const stripe = await loadStripe(pk)
      if (!stripe) throw new Error("Stripe não carregou")

      const elements = stripe.elements({ clientSecret: clientSecret! })
      const { error: submitError } = await elements.submit()
      if (submitError) {
        setError(submitError.message || "Erro ao processar pagamento")
        setProcessing(false)
        return
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/configuracoes?checkout=success`,
        },
      })

      if (error) {
        setError(error.message || "Erro ao processar pagamento")
      } else {
        setSuccess(true)
        toast.success("Pagamento confirmado!")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao processar pagamento")
    } finally {
      setProcessing(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-6">
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold">Pagamento Confirmado!</h1>
            <p className="text-muted-foreground">Seu plano foi ativado com sucesso.</p>
            <Button onClick={() => window.location.href = "/configuracoes"}>Voltar</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6 space-y-6">
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-500" />
            Assinar Plano {plan === "clinica" ? "Clínica" : "Pro"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg mb-4">
            <p className="text-2xl font-bold text-blue-600">
              R$ {plan === "clinica" ? "197" : "97"}
              <span className="text-sm font-normal text-muted-foreground">/mês</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">14 dias de trial grátis</p>
          </div>

          {loading && (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800 mb-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div ref={paymentRef} className="min-h-[250px] mb-4" />

            <Button type="submit" disabled={loading || processing || !clientSecret} className="w-full">
              {processing ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Confirmar Pagamento
                </span>
              )}
            </Button>
          </form>

          <Button variant="ghost" onClick={() => window.location.href = "/configuracoes"} className="w-full mt-2">
            Cancelar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
