import Link from "next/link"

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Termos de Uso</h1>
        <p className="text-gray-400 leading-relaxed">
          Esta plataforma é utilizada exclusivamente para agendamento e gestão de consultas
          psicológicas. Ao utilizar o sistema, você concorda com o tratamento dos seus dados
          conforme a Lei Geral de Proteção de Dados (LGPD).
        </p>
        <p className="text-gray-400 leading-relaxed mt-4">
          Os dados fornecidos são armazenados de forma segura e utilizados apenas para
          finalidades relacionadas ao agendamento e realização das consultas.
        </p>
        <Link href="/login" className="inline-block mt-6 text-emerald-400 hover:text-emerald-300 transition-colors">
          Voltar ao login
        </Link>
      </div>
    </div>
  )
}