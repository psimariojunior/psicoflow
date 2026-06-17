"use client"

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Erro</h1>
        <p className="text-gray-600 mb-6">Algo deu errado. Tente novamente.</p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
