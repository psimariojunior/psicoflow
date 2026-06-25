"use client"

export default function PatientError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Erro</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-2">Não foi possível carregar esta página.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Tente novamente ou volte mais tarde.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Tentar novamente
          </button>
          <a
            href="/paciente"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  )
}
