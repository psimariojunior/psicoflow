"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center px-6">
          <h1 className="text-6xl font-bold text-emerald-600 mb-4">500</h1>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro interno</h2>
          <p className="text-gray-500 mb-6 max-w-md">
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
