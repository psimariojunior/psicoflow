"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Brain,
  ClipboardList,
  DollarSign,
  Video,
  FileBarChart,
  FileSignature,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  ExternalLink,
  HelpCircle,
} from "lucide-react"

const sections = [
  {
    id: "primeiros-passos",
    title: "Primeiros Passos",
    icon: Sparkles,
    gradient: "from-emerald-500 to-teal-600",
    highlight: true,
    items: [
      {
        title: "Como começar a usar o PsiHumanis",
        content:
          "Após criar sua conta, comece cadastrando seus pacientes em 'Pacientes > Novo Paciente'. Em seguida, configure seus horários de atendimento em 'Configurações > Disponibilidade' para que os pacientes possam agendar consultas pelo link público.",
      },
      {
        title: "Personalize seu perfil",
        content:
          "Acesse 'Configurações' para adicionar sua foto, dados profissionais (CRP), bio e informações de contato. Seu perfil é exibido na página pública de agendamento, então mantenha tudo atualizado.",
      },
      {
        title: "Convide pacientes",
        content:
          "Após cadastrar um paciente, envie o link do portal dele por e-mail ou WhatsApp. O paciente poderá acessar prontuários, questionários, recursos terapêuticos e a sala virtual diretamente pelo portal.",
      },
    ],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    gradient: "from-teal-500 to-indigo-600",
    items: [
      {
        title: "Como usar o dashboard principal",
        content:
          "Ao acessar o dashboard, você encontra uma visão geral do seu consultório. Os cards de métricas mostram: total de pacientes, consultas de hoje, faturamento do mês e pagamentos pendentes. Cada card inclui uma seta indicando se o valor subiu ou caiu em relação ao período anterior.",
      },
      {
        title: "Cards de métricas e gráficos",
        content:
          "Logo abaixo dos cards, você encontra gráficos interativos: Receita por Mês (barras), Consultas por Mês, Métodos de Pagamento (pizza), Crescimento de Pacientes e Indicadores-Chave (ticket médio, taxa de conclusão, cancelamento e ocupação). Passe o mouse sobre os gráficos para ver detalhes.",
      },
      {
        title: "Ações rápidas",
        content:
          "Na seção de Ações Rápidas, você tem atalhos para: Nova Consulta, Novo Paciente, Nova Sessão (prontuário) e Sala Virtual. Use o botão de exportação no canto superior direito para baixar relatórios do dashboard em PDF ou CSV.",
      },
    ],
  },
  {
    id: "pacientes",
    title: "Pacientes",
    icon: Users,
    gradient: "from-teal-600 to-sky-600",
    items: [
      {
        title: "Como cadastrar um paciente",
        content:
          "Vá em 'Pacientes' no menu lateral e clique em 'Novo Paciente'. Preencha nome, e-mail, telefone, data de nascimento e outras informações. O paciente receberá um link para criar a própria conta e acessar o portal do paciente.",
      },
      {
        title: "Editar e visualizar",
        content:
          "Na listagem de pacientes, clique no nome de qualquer paciente para abrir a página detalhada. Lá você encontra abas com informações pessoais, prontuários, sessões, financeiro e consentimentos. Use o botão 'Editar' para atualizar dados cadastrais.",
      },
      {
        title: "Prontuários e sessões",
        content:
          "Na página do paciente, a aba 'Prontuários' lista todos os registros clínicos. Você pode criar um novo prontuário com SOAP (Subjetivo, Objetivo, Avaliação, Plano) ou usar o Hermes AI para gerar automaticamente. A aba 'Sessões' mostra o histórico completo.",
      },
      {
        title: "Timeline do paciente",
        content:
          "A timeline exibe uma linha do tempo com todos os eventos do paciente: consultas realizadas, prontuários criados, recursos atribuídos, tarefas concluídas e diário emocional. É uma forma rápida de visualizar a jornada completa do paciente.",
      },
    ],
  },
  {
    id: "prontuarios",
    title: "Prontuários",
    icon: ClipboardList,
    gradient: "from-pink-500 to-rose-600",
    items: [
      {
        title: "Como criar um prontuário",
        content:
          "Na página do paciente, clique em 'Novo Prontuário'. Preencha as notas da sessão e use o botão 'Gerar com IA' para criar automaticamente um registro SOAP estruturado (Subjetivo, Objetivo, Avaliação, Plano). Salve para registrar na timeline do paciente.",
      },
      {
        title: "Visualizar histórico de prontuários",
        content:
          "Acesse a aba 'Prontuários' no perfil do paciente para ver todos os registros anteriores ordenados por data. Clique em qualquer prontuário para expandir e ler o conteúdo completo, incluindo anexos e observações.",
      },
    ],
  },
  {
    id: "agenda",
    title: "Agenda",
    icon: Calendar,
    gradient: "from-violet-500 to-purple-600",
    items: [
      {
        title: "Agendamento de consultas",
        content:
          "Acesse 'Agenda' no menu lateral. Você vê uma visão mensal ou semanal. Clique em um horário vazio ou no botão 'Nova Consulta' para agendar. Escolha o paciente, data, horário, modalidade (online) e tipo de consulta. O paciente recebe notificação por e-mail e WhatsApp.",
      },
      {
        title: "Disponibilidade",
        content:
          "Em 'Disponibilidade', você define seus horários de atendimento por dia da semana. Os pacientes veem apenas os horários disponíveis ao agendar pelo link público. Você pode configurar pausas, horário de almoço e bloquear dias específicos.",
      },
      {
        title: "Consultas recorrentes",
        content:
          "Ao criar uma consulta, ative a opção 'Repetir consulta'. Escolha a frequência (semanal ou quinzenal) e o número de repetições. O sistema cria automaticamente todas as ocorrências futuras, mantendo o mesmo horário e paciente.",
      },
    ],
  },
  {
    id: "recursos-terapeuticos",
    title: "Recursos Terapêuticos",
    icon: Brain,
    gradient: "from-teal-500 to-emerald-600",
    highlight: true,
    items: [
      {
        title: "Como criar recursos",
        content:
          "Vá em 'Recursos Terapêuticos' e clique em 'Criar Recurso'. Escolha o tipo: Exercício TCC, Psicoeducação, Meditação, Planilha ou Outro. Dê um nome, descrição e conteúdo. Categorize com tags para facilitar a busca. Recursos públicos ficam disponíveis para todos os pacientes.",
      },
      {
        title: "Como atribuir a pacientes",
        content:
          "Na listagem de recursos, clique no ícone de atribuir (usuário) em qualquer recurso. Selecione o paciente desejado. O recurso aparece automaticamente no portal do paciente, na seção 'Recursos' da página inicial. O paciente pode visualizar, marcar como concluído e registrar observações.",
      },
      {
        title: "Acompanhamento de tarefas",
        content:
          "Os recursos atribuídos viram tarefas para o paciente. Em 'Tarefas' no menu lateral, você vê o status de cada recurso: Pendente, Concluído ou Atrasado. Acompanhe o engajamento do paciente, visualize observações e remarke como necessário.",
      },
    ],
  },
  {
    id: "questionarios",
    title: "Questionários",
    icon: ClipboardList,
    gradient: "from-amber-500 to-orange-600",
    items: [
      {
        title: "PHQ-9 e GAD-7",
        content:
          "No portal do paciente, estão disponíveis os questionários PHQ-9 (depressão) e GAD-7 (ansiedade). O paciente responde diretamente pelo celular ou computador. Os resultados são calculados automaticamente com a pontuação e a classificação (mínimo, leve, moderado, grave).",
      },
      {
        title: "Como visualizar resultados",
        content:
          "No dashboard do psicólogo, acesse a aba do paciente e depois 'Questionários'. Você vê um histórico com todas as respostas, pontuações e a data de aplicação. Um gráfico de evolução mostra a variação dos escores ao longo do tempo, ajudando a avaliar a resposta ao tratamento.",
      },
      {
        title: "Anamnese digital",
        content:
          "O paciente também preenche a anamnese digital no primeiro acesso. O formulário inclui: motivo da consulta, histórico de saúde, medicações em uso, histórico familiar e hábitos de vida. As respostas ficam disponíveis no prontuário do paciente para consulta.",
      },
    ],
  },
  {
    id: "financeiro",
    title: "Financeiro",
    icon: DollarSign,
    gradient: "from-emerald-500 to-green-600",
    items: [
      {
        title: "Controle de receitas e despesas",
        content:
          "Em 'Financeiro', você registra todas as receitas (consultas, pacotes) e despesas (aluguel, materiais, impostos). Use os filtros por período, categoria ou forma de pagamento. O saldo é calculado automaticamente.",
      },
      {
        title: "Cobranças e faturas",
        content:
          "Em 'Cobranças', você emite faturas para os pacientes. Escolha o paciente, valor, vencimento e forma de pagamento. O paciente recebe um link para pagamento online via Stripe (cartão, PIX ou boleto). O status é atualizado automaticamente quando o pagamento é confirmado.",
      },
      {
        title: "Relatórios financeiros",
        content:
          "Na aba 'Financeiro', você encontra relatórios detalhados: receita por período, despesas por categoria, inadimplência, ticket médio e projeções. Exporte em PDF ou CSV para contabilidade ou para análise pessoal.",
      },
    ],
  },
  {
    id: "sala-virtual",
    title: "Sala Virtual",
    icon: Video,
    gradient: "from-cyan-500 to-teal-700",
    items: [
      {
        title: "Iniciar videochamada",
        content:
          "Vá em 'Sala Virtual' no menu lateral. Clique em 'Iniciar Sala' para gerar um novo código de sala. Compartilhe o link com o paciente. Quando o paciente entrar, você verá a indicação de participante conectado. Use os botões para ativar/desativar câmera e microfone.",
      },
      {
        title: "Compartilhar código da sala",
        content:
          "Na página da sala virtual, copie o código gerado e envie ao paciente por WhatsApp ou e-mail. O link direto é: https://psihumanis.com.br/sala-virtual/entrar?room=CODIGO. O paciente abre o link, digita o nome e entra na videochamada.",
      },
      {
        title: "Dicas de uso",
        content:
          "Teste câmera e microfone antes da chamada. Use uma conexão de internet estável (preferencialmente cabo). Feche programas pesados que possam consumir banda. Em caso de falha de áudio/vídeo, o paciente pode recarregar a página ou tentar com outro navegador.",
      },
    ],
  },
  {
    id: "relatorios",
    title: "Relatórios",
    icon: FileBarChart,
    gradient: "from-rose-500 to-pink-600",
    items: [
      {
        title: "Relatório do paciente",
        content:
          "Em cada paciente, acesse a aba 'Relatórios' para gerar um relatório completo com: dados cadastrais, resumo de sessões, questionários respondidos, recursos atribuídos e histórico financeiro. Ideal para encaminhamentos ou documentação.",
      },
      {
        title: "Relatório financeiro",
        content:
          "No módulo financeiro, gere relatórios com: receitas agrupadas por mês, despesas por categoria, saldo acumulado, taxa de inadimplência e ticket médio. Filtrável por período.",
      },
      {
        title: "Produção clínica",
        content:
          "O relatório de produção clínica mostra: número de consultas realizadas por mês, duração média, modalidades mais usadas, cancelamentos e faltas. Acompanhe sua produtividade ao longo do tempo.",
      },
      {
        title: "Exportar PDF",
        content:
          "Todos os relatórios possuem botão de exportação. Clique em 'Exportar PDF' ou 'Download' para gerar um arquivo formatado. Você pode imprimir ou enviar por e-mail diretamente.",
      },
    ],
  },
  {
    id: "consentimento-digital",
    title: "Consentimento Digital",
    icon: FileSignature,
    gradient: "from-indigo-500 to-teal-600",
    items: [
      {
        title: "Como funciona o termo LGPD",
        content:
          "Ao cadastrar um paciente, o sistema gera automaticamente um Termo de Consentimento LGPD. O paciente recebe um link para ler e aceitar digitalmente. O termo fica armazenado com data, hora e IP do aceite, garantindo conformidade com a lei.",
      },
      {
        title: "Visualização dos consentimentos",
        content:
          "No perfil do paciente, a aba 'Consentimentos' mostra todos os termos aceitos, com a data de aceitação e a versão do documento. Você pode reenviar o termo caso precise de uma nova versão ou o paciente queira reler.",
      },
    ],
  },
  {
    id: "hermes-ia",
    title: "IA nos Prontuários (Hermes)",
    icon: Sparkles,
    gradient: "from-purple-500 to-violet-600",
    items: [
      {
        title: "Como gerar SOAP automático",
        content:
          "Ao criar um prontuário, clique no botão 'Gerar com IA' (ícone de estrela). O Hermes Agent analisa as anotações da sessão e gera automaticamente um SOAP estruturado: Subjetivo (fala do paciente), Objetivo (observações), Avaliação (impressão clínica) e Plano (próximos passos).",
      },
      {
        title: "Análise de diário emocional",
        content:
          "O Hermes também analisa o diário emocional do paciente. Você obtém insights sobre padrões emocionais, gatilhos recorrentes e progressão do humor ao longo do tempo. Tudo integrado ao prontuário do paciente.",
      },
      {
        title: "Modelos gratuitos, sem limite",
        content:
          "Diferente de outras plataformas, o Hermes Agent usa modelos gratuitos via OpenRouter. Não há limite de uso nem cobrança adicional. Você pode gerar quantos SOAPs e análises precisar, sem se preocupar com custos.",
      },
    ],
  },
  {
    id: "configuracoes",
    title: "Configurações",
    icon: LayoutDashboard,
    gradient: "from-gray-500 to-slate-600",
    items: [
      {
        title: "Perfil profissional",
        content:
          "Em 'Configurações', atualize seus dados pessoais, foto, CRP, biografia e informações de contato. Essas informações aparecem na página pública de agendamento e no portal do paciente.",
      },
      {
        title: "Integração com Google Calendar",
        content:
          "Conecte sua conta Google Calendar para sincronizar automaticamente suas consultas. As consultas agendadas no PsiHumanis aparecem no seu Google Calendar e vice-versa. Acesse em 'Configurações > Google Calendar'.",
      },
      {
        title: "Disponibilidade e horários",
        content:
          "Configure seus horários de atendimento por dia da semana, incluindo pausas e horário de almoço. Os pacientes só enxergam horários disponíveis ao agendar. Você pode bloquear dias específicos para feriados ou férias.",
      },
    ],
  },
  {
    id: "planos",
    title: "Planos e Cobrança",
    icon: DollarSign,
    gradient: "from-amber-500 to-yellow-600",
    items: [
      {
        title: "Como funciona a assinatura",
        content:
          "O PsiHumanis oferece planos gratuitos e pagos. No plano gratuito, você tem acesso a funcionalidades básicas. Para desbloquear todos os recursos (sala virtual, IA, relatórios avançados), assine um plano pago diretamente em 'Configurações > Planos'.",
      },
      {
        title: "Formas de pagamento",
        content:
          "Aceitamos pagamento via cartão de crédito, PIX e boleto bancário processados pela Stripe. Sua assinatura é renovada automaticamente. Você pode cancelar a qualquer momento em 'Configurações > Planos' sem multa.",
      },
    ],
  },
]

export default function AjudaPage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleItem = (key: string) => {
    setExpandedItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-indigo-900 p-8 sm:p-12 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-xl bg-white/15 p-2.5 backdrop-blur-sm">
              <HelpCircle className="h-7 w-7" />
            </div>
            <Badge variant="info" className="bg-white/20 text-white border-none text-xs">
              Guia Completo
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Guia do PsiHumanis
          </h1>
          <p className="text-teal-100 text-lg sm:text-xl max-w-2xl">
            Tudo que você precisa saber para usar o sistema
          </p>
        </div>
      </div>

      <div className="grid gap-5">
        {sections.map((section) => {
          const Icon = section.icon
          const isExpanded = expandedSections[section.id] ?? false

          return (
            <Card
              key={section.id}
              className={cn(
                "overflow-hidden transition-all duration-300",
                section.highlight && "ring-2 ring-emerald-400/40 dark:ring-emerald-500/30 shadow-lg shadow-emerald-500/5",
              )}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full text-left focus-visible:outline-none"
                aria-expanded={isExpanded}
              >
                <CardHeader
                  className={cn(
                    "flex flex-row items-center justify-between gap-4 py-4 px-6 cursor-pointer select-none",
                    section.highlight && "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "rounded-xl p-2.5 shrink-0 bg-gradient-to-br text-white shadow-md",
                        section.gradient,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base sm:text-lg">{section.title}</CardTitle>
                        {section.highlight && (
                          <Badge variant="success" className="text-[10px] px-2 py-0.5 leading-normal">
                            Destaque
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {section.items.length} {section.items.length === 1 ? "tópico" : "tópicos"}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-muted-foreground">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CardHeader>
              </button>
              {isExpanded && (
                <CardContent className="px-6 pb-6 pt-2 space-y-3">
                  {section.items.map((item, idx) => {
                    const itemKey = `${section.id}-${idx}`
                    const isItemExpanded = expandedItems[itemKey] ?? false

                    return (
                      <div
                        key={itemKey}
                        className={cn(
                          "rounded-xl border transition-all duration-200",
                          isItemExpanded
                            ? "border-teal-200 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20 shadow-sm"
                            : "border-border hover:border-teal-200 dark:hover:border-teal-800 hover:bg-accent/30",
                        )}
                      >
                        <button
                          onClick={() => toggleItem(itemKey)}
                          className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 focus-visible:outline-none"
                          aria-expanded={isItemExpanded}
                        >
                          <span className="text-sm font-medium">{item.title}</span>
                          <div
                            className={cn(
                              "shrink-0 rounded-full p-0.5 transition-colors",
                              isItemExpanded
                                ? "text-teal-500"
                                : "text-muted-foreground",
                            )}
                          >
                            {isItemExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </button>
                        {isItemExpanded && (
                          <div className="px-4 pb-4 pt-0">
                            <Separator className="mb-3" />
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.content}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      <Card className="overflow-hidden border-teal-200 dark:border-teal-800">
        <div className="bg-gradient-to-r from-teal-600 to-indigo-700 px-6 py-5">
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Precisa de ajuda? Entre em contato
          </h2>
        </div>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Nossa equipe está pronta para ajudar com qualquer dúvida sobre o PsiHumanis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3 rounded-xl border p-4 flex-1 hover:border-teal-200 dark:hover:border-teal-800 transition-colors">
              <div className="rounded-xl bg-teal-100 dark:bg-teal-900/40 p-2.5 text-teal-600 dark:text-teal-400">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">E-mail</p>
                <a
                  href="mailto:suporte@psihumanis.com"
                  className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline"
                >
                  suporte@psihumanis.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border p-4 flex-1 hover:border-teal-200 dark:hover:border-teal-800 transition-colors">
              <div className="rounded-xl bg-teal-100 dark:bg-teal-900/40 p-2.5 text-teal-600 dark:text-teal-400">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">WhatsApp</p>
                <a
                  href="https://wa.me/5531992863861"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
                >
                  (31) 99286-3861
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-muted-foreground">
              Horário de atendimento: Seg a Sex, 9h às 18h
            </p>
            <Link
              href="/configuracoes"
              className="text-xs text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1"
            >
              Configurações da conta
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
