import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const VM_API = "http://137.131.184.53:8899"
const API_SECRET = "psicoflow-hermes-2026"

async function callVM(endpoint: string, body: any) {
  try {
    const res = await fetch(`${VM_API}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_SECRET}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Erro ao conectar com IA" }))
      return { success: false, error: err.error || "Erro na IA" }
    }
    return await res.json()
  } catch (error: any) {
    if (error?.name === "TimeoutError" || error?.code === "UND_ERR_CONNECT_TIMEOUT") {
      return { success: false, error: "IA temporariamente indisponível (timeout)" }
    }
    return { success: false, error: "Servidor de IA indisponível" }
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { action, ...payload } = body

    if (action === "gerar-soap") {
      const result = await callVM("/api/hermes/gerar-soap", { keywords: payload.keywords })
      return NextResponse.json(result)
    }

    if (action === "analisar-diario") {
      const result = await callVM("/api/hermes/analisar-diario", { entries: payload.entries })
      return NextResponse.json(result)
    }

    if (action === "health") {
      const result = await callVM("/api/hermes/health", {})
      return NextResponse.json({ available: result.status === "ok" })
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 })
  } catch (error) {
    console.error("Erro no Hermes API:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}