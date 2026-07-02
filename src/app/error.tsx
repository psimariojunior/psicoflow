"use client"

import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #134E4A 50%, #0f172a 100%)",
          color: "white",
          padding: 20,
        }}>
          <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
            <div style={{
              width: 88, height: 88,
              background: "rgba(239,68,68,0.15)",
              border: "2px solid rgba(239,68,68,0.3)",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Algo deu errado</h1>
            <p style={{ fontSize: 14, color: "#94a3b8", marginBottom: 28, lineHeight: 1.5 }}>
              Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
            </p>
            <button
              onClick={() => reset()}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "linear-gradient(135deg, #0D9488, #0F766E)",
                color: "white", padding: "14px 28px", borderRadius: 12,
                fontWeight: 600, fontSize: 15, border: "none", cursor: "pointer",
                width: "100%", justifyContent: "center",
              }}
            >
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
              </svg>
              Tentar Novamente
            </button>
            <button
              onClick={() => { window.location.href = "/" }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "white", padding: "14px 28px", borderRadius: 12,
                fontWeight: 600, fontSize: 15, cursor: "pointer",
                width: "100%", justifyContent: "center", marginTop: 10,
              }}
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
