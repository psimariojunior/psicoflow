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
      <body className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="text-center px-6">
          <h1 className="text-6xl font-bold text-blue-600 mb-4">500</h1>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-200 mb-2">Erro interno</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6 max-w-md">
            Ocorreu um erro inesperado. Nossa equipe foi notificada.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
