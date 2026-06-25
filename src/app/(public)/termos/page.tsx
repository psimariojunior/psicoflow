import Link from "next/link"
import { Shield, FileText, Lock, AlertTriangle } from "lucide-react"

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 mb-6">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Termos de Uso</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Shield className="h-5 w-5 text-emerald-500" /> 1. Aceitação dos Termos
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Ao utilizar a plataforma PsiHumanis, você declara ter lido, compreendido e concordado
              com todos os termos e condições descritos neste documento. Caso não concorde com
              qualquer disposição, você não deve utilizar nossos serviços.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Lock className="h-5 w-5 text-emerald-500" /> 2. Privacidade e Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              A plataforma coleta e armazena dados pessoais (nome, telefone, email, CPF)
              estritamente necessários para a prestação dos serviços de agendamento e
              acompanhamento psicológico. Todos os dados são tratados em conformidade com a
              Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              Os dados sensíveis compartilhados durante as consultas e registros no diário
              emocional são criptografados e acessíveis apenas ao paciente e ao psicólogo
              responsável.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <AlertTriangle className="h-5 w-5 text-emerald-500" /> 3. Responsabilidades
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              O PsiHumanis atua como plataforma de gestão e agendamento. A responsabilidade
              pelo conteúdo das consultas, prontuários e registros é integralmente do
              profissional psicólogo responsável, registrado no CRP sob o número 04/52274.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              A plataforma não se responsabiliza por falhas técnicas temporárias que possam
              afetar a realização de consultas online, comprometendo-se a manter a
              infraestrutura com os melhores padrões de disponibilidade e segurança.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <FileText className="h-5 w-5 text-emerald-500" /> 4. Uso da Plataforma
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              O paciente compromete-se a fornecer informações verdadeiras e atualizadas.
              O psicólogo compromete-se a utilizar a plataforma em conformidade com o
              Código de Ética Profissional do Psicólogo (Resolução CFP nº 010/2005).
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              É proibido o uso da plataforma para fins ilícitos, disseminação de conteúdo
              ofensivo, ou qualquer atividade que viole direitos de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">5. Disposições Gerais</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Estes termos podem ser atualizados a qualquer momento. O usuário será notificado
              sobre alterações substanciais. O foro eleito é o da Comarca de Belo Horizonte, MG.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
          <Link href="/" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors">
            ← Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
