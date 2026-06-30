"use client"

import * as Sentry from "@sentry/nextjs"
import NextError from "next/error"
import { useEffect } from "react"

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => { Sentry.captureException(error) }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
      <div className="text-center px-6">
        <h2 className="text-2xl font-bold mb-4">Algo deu errado</h2>
        <p className="text-slate-400 mb-6">Ocorreu um erro inesperado. Nossa equipe foi notificada.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
