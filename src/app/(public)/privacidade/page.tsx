import Link from "next/link"
import { Shield, Lock, Eye, Trash2, Mail } from "lucide-react"

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-16 md:py-24">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/20 mb-6">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Política de Privacidade</h1>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Shield className="h-5 w-5 text-emerald-500" /> 1. Dados Coletados
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Coletamos os seguintes dados pessoais fornecidos voluntariamente pelo usuário:
              nome completo, endereço de email, número de telefone, CPF e data de nascimento.
              Durante o uso da plataforma, também registramos dados de agendamento,
              prontuários e entradas no diário emocional.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Lock className="h-5 w-5 text-emerald-500" /> 2. Armazenamento e Segurança
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Seus dados são armazenados em servidores seguros com criptografia em trânsito
              (TLS 1.3) e em repouso (AES-256). Utilizamos PostgreSQL em infraestrutura
              Neon, com backups diários e replicação automática.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              O acesso aos dados é restrito ao psicólogo responsável (CRP 04/52274) e
              ao próprio paciente, através de autenticação segura com tokens JWT.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Eye className="h-5 w-5 text-emerald-500" /> 3. Compartilhamento de Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Nenhum dado pessoal é compartilhado com terceiros sem o consentimento expresso
              do titular. Exceções aplicam-se apenas a obrigações legais ou ordem judicial.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              Utilizamos serviços de terceiros para funcionalidades específicas:
              Resend (envio de emails), LiveKit Cloud (videochamadas) e Neon (banco de dados).
              Cada um desses serviços possui suas próprias políticas de privacidade e segurança.
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Trash2 className="h-5 w-5 text-emerald-500" /> 4. Exclusão de Dados
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              O paciente pode solicitar a exclusão de seus dados a qualquer momento.
              A solicitação deve ser feita por email para o psicólogo responsável.
              Os dados serão removidos em até 30 dias, exceto quando houver obrigação
              legal de retenção (como prontuários, que devem ser mantidos pelo prazo
              mínimo de 5 anos conforme legislação vigente).
            </p>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900 dark:text-white">
              <Mail className="h-5 w-5 text-emerald-500" /> 5. Contato
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Para exercer seus direitos como titular de dados (acesso, correção, exclusão,
              portabilidade), entre em contato pelo email:
              <a href="mailto:psi_mariojunior@hotmail.com" className="text-emerald-600 dark:text-emerald-400 hover:underline ml-1">
                psi_mariojunior@hotmail.com
              </a>
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              Psicólogo Responsável: Mário Júnior — CRP 04/52274
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">6. Atualizações</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Esta política pode ser atualizada periodicamente. A versão mais recente estará
              sempre disponível nesta página. Recomendamos a revisão periódica.
            </p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-2">
              Última atualização: junho de 2026.
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
