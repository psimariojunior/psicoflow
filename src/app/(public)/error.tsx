"use client"

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold text-emerald-600 mb-4">Ops!</h1>
        <p className="text-gray-600 mb-6">Algo deu errado ao carregar esta página.</p>
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
