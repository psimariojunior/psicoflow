import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-2xl shadow-emerald-500/30 mb-8">
          <span className="text-5xl font-bold text-white">404</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Página não encontrada
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          A página que você procura não existe ou foi movida.
          Verifique o endereço ou volte para o início.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 transition-all"
          >
            Voltar ao Início
          </Link>
          <Link
            href="/agendar"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            Agendar Consulta
          </Link>
        </div>
      </div>
    </div>
  )
}
