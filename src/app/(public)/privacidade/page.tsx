import Link from "next/link"

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Política de Privacidade</h1>
        <p className="text-gray-400 leading-relaxed">
          Sua privacidade é importante. As informações coletadas (nome, email, telefone, CPF)
          são utilizadas exclusivamente para identificar e contatar o paciente no contexto das
          consultas psicológicas.
        </p>
        <p className="text-gray-400 leading-relaxed mt-4">
          Nenhum dado é compartilhado com terceiros sem seu consentimento expresso.
          Você pode solicitar a exclusão dos seus dados a qualquer momento entrando em
          contato com seu psicólogo.
        </p>
        <Link href="/login" className="inline-block mt-6 text-emerald-400 hover:text-emerald-300 transition-colors">
          Voltar ao login
        </Link>
      </div>
    </div>
  )
}