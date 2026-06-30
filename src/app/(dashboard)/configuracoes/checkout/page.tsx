"use client"

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard, AlertCircle } from "lucide-react"

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") || "pro"
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const createCheckout = useCallback(async () => {
    try {
      const res = await fetch("/api/subscription/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao criar checkout")
      if (data.url) {
        window.location.href = data.url
      } else {
        setError("URL de checkout não recebida")
        setLoading(false)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao criar checkout")
      setLoading(false)
    }
  }, [plan])

  useEffect(() => { createCheckout() }, [createCheckout])

  if (error) {
    return (
      <div className="max-w-lg mx-auto p-6 space-y-6">
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold">Erro ao criar checkout</h1>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={() => window.location.href = "/configuracoes"}>Voltar</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-teal-500" />
            Assinando plano {plan === "clinica" ? "Clínica" : "Pro"}...
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500 mx-auto" />
          <p className="text-muted-foreground mt-4">Redirecionando para o Stripe...</p>
        </CardContent>
      </Card>
    </div>
  )
}
