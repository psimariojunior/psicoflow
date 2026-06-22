export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  readTime: string
  publishedAt: string
  image?: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: "como-organizar-consultorio-psicologia",
    title: "Como Organizar seu Consultório de Psicologia em 2026",
    excerpt: "Dicas práticas para organizar sua agenda, prontuários e finanças de forma eficiente.",
    category: "Gestão",
    readTime: "5 min",
    publishedAt: "2026-06-20",
    content: `<h2>Por que a organização é essencial?</h2>
<p>Um consultório bem organizado não apenas aumenta a produtividade, mas também melhora a experiência do paciente. Quando o psicólogo tem seus prontuários, agenda e finanças organizados, ele consegue dedicar mais tempo ao que realmente importa: o atendimento.</p>

<h2>5 passos para organizar seu consultório</h2>

<h3>1. Digitalize seus prontuários</h3>
<p>Papelada é passado. Prontuários digitais são mais seguros, organizados e acessíveis. Com um sistema como o PsicoFlow, você pode criar registros clínicos completos em poucos cliques.</p>

<h3>2. Automatize sua agenda</h3>
<p>Use um sistema de agendamento online para que seus pacientes marquem consultas sem precisar ligar. Isso reduz faltas e melhora a experiência.</p>

<h3>3. Controle suas finanças</h3>
<p>Registre todas as entradas e saídas. Saiba exatamente quanto fatura por mês e quais pacientes estão com pagamento pendente.</p>

<h3>4. Use lembretes automáticos</h3>
<p>Envie lembretes por WhatsApp e email 24h e 1h antes da consulta. Isso reduz faltas em até 40%.</p>

<h3>5. Mantenha registros atualizados</h3>
<p>Após cada sessão, registre as principais observações no prontuário. Isso ajuda no acompanhamento do paciente.</p>

<h2>Conclusão</h2>
<p>Organizar seu consultório não precisa ser complicado. Com as ferramentas certas, você pode ter tudo funcionando em poucos dias. O PsicoFlow foi criado especificamente para isso.</p>`
  },
  {
    slug: "prontuario-digital-psicologia",
    title: "Prontuário Digital: O que é e como implementar na sua clínica",
    excerpt: "Entenda como o prontuário digital pode transformar a gestão do seu consultório e garantir conformidade com a LGPD.",
    category: "Tecnologia",
    readTime: "7 min",
    publishedAt: "2026-06-18",
    content: `<h2>O que é um prontuário digital?</h2>
<p>O prontuário digital é a versão eletrônica do prontuário clínico tradicional. Ele permite registrar, armazenar e consultar informações do paciente de forma segura e organizada.</p>

<h2>Vantagens do prontuário digital</h2>

<h3>Segurança</h3>
<p>Dados criptografados e backups automáticos. Diferente do papel, que pode ser perdido ou danificado, o prontuário digital está sempre protegido.</p>

<h3>Acessibilidade</h3>
<p>Acesse os prontuários de qualquer lugar, a qualquer momento. Ideal para psicólogos que trabalham em múltiplos consultórios.</p>

<h3>Conformidade com LGPD</h3>
<p>Prontuários digitais permitem controle preciso sobre quem acessa os dados do paciente, atendendo aos requisitos da Lei Geral de Proteção de Dados.</p>

<h3>Busca rápida</h3>
<p>Encontre qualquer informação em segundos, sem precisar folhear páginas.</p>

<h2>Como implementar</h2>
<p>Comece escolhendo um sistema confiável. O PsicoFlow oferece prontuários digitais com criptografia, consentimento digital e backup automático. O processo de migração é simples e rápido.</p>`
  },
  {
    slug: "reduzir-faltas-consultas",
    title: "7 Estratégias para Reduzir Faltas em Consultas de Psicologia",
    excerpt: "Faltas são um dos maiores problemas da psicologia. Veja como reduzi-las com estratégias simples e eficazes.",
    category: "Dicas",
    readTime: "4 min",
    publishedAt: "2026-06-15",
    content: `<h2>Por que pacientes faltam?</h2>
<p>As principais razões são: esquecimento, vergonha, falta de dinheiro e dificuldade de locomoção. A boa notícia é que muitas dessas causas podem ser trabalhadas.</p>

<h2>7 estratégias comprovadas</h2>

<h3>1. Lembretes automáticos</h3>
<p>Envie lembretes 24h e 1h antes da consulta. Use WhatsApp e email para garantir que o paciente receba.</p>

<h3>2. Agendamento online</h3>
<p>Permita que o paciente escolha o horário que melhor se encaixa na rotina dele.</p>

<h3>3. Flexibilidade de horários</h3>
<p>Ofereça horários variados (manhã, tarde, noite) para atender diferentes rotinas.</p>

<h3>4. Consulta online</h3>
<p>A opção de atendimento por videochamada elimina barreiras de locomoção e tempo.</p>

<h3>5. Política de cancelamento clara</h3>
<p>Estabeleça regras claras sobre cancelamentos e reagendamentos.</p>

<h3>6. Follow-up entre sessões</h3>
<p>Envie materiais ou exercícios entre as consultas para manter o vínculo.</p>

<h3>7. Feedback positivo</h3>
<p>Reconheça o comprometimento do paciente com o tratamento.</p>

<h2>Resultados</h3>
<p>Psicólogos que implementam essas estratégias reduzem faltas em até 60%.</p>`
  },
  {
    slug: "videoconferencia-segura-psicologia",
    title: "Videoconferência Segura para Psicólogos: Guia Completo",
    excerpt: "Saiba como escolher e usar plataformas de videochamada seguras para atendimento online.",
    category: "Tecnologia",
    readTime: "6 min",
    publishedAt: "2026-06-12",
    content: `<h2>Atendimento online: é seguro?</h2>
<p>Sim, desde que você use plataformas adequadas. A videoconferência para psicologia requer sigilo, criptografia e conformidade ética.</p>

<h2>O que verificar na plataforma</h2>

<h3>Criptografia ponta a ponta</h3>
<p>Os dados devem ser criptografados durante toda a transmissão.</p>

<h3>Servidor no Brasil</h3>
<p>Dados devem ser armazenados em servidores brasileiros para conformidade com a LGPD.</p>

<h3>Qualidade de conexão</h3>
<p>A plataforma deve adaptar a qualidade à velocidade da internet do paciente.</p>

<h3>Integração com prontuário</h3>
<p>O ideal é que a videochamada esteja integrada ao sistema de gestão, para facilitar o registro da sessão.</p>

<h2>Como começar</h2>
<p>O PsicoFlow oferece videoconferência integrada com criptografia, servidor no Brasil e gravação automática de dados da sessão.</p>`
  },
  {
    slug: "lgpd-psicologia",
    title: "LGPD e Psicologia: O que o psicólogo precisa saber",
    excerpt: "A Lei Geral de Proteção de Dados afeta diretamente o trabalho do psicólogo. Veja como se adequar.",
    category: "Legal",
    readTime: "5 min",
    publishedAt: "2026-06-10",
    content: `<h2>A LGPD e o sigilo profissional</h2>
<p>A LGPD reforça o sigilo profissional que já é obrigatório para psicólogos. Agora, além do CFP, você também precisa atender à legislação de proteção de dados.</p>

<h2>Principais pontos para psicólogos</h2>

<h3>Consentimento</h3>
<p>O paciente deve ser informado sobre como seus dados serão usados e dar consentimento explícito.</p>

<h3>Segurança dos dados</h3>
<p>Dados pessoais e dados sensíveis (informações de saúde mental) devem ser protegidos com criptografia e controle de acesso.</p>

<h3>Direito ao esquecimento</h3>
<p>O paciente pode solicitar a exclusão de seus dados. Mantenha registros de quando e por que os dados foram coletados.</p>

<h3>Registro de atividades</h3>
<p>Mantenha um registro de todas as operações realizadas com dados pessoais.</p>

<h2>Como se adequar</h2>
<p>Use um sistema que atenda automaticamente à LGPD, com criptografia, consentimento digital e logs de auditoria. O PsicoFlow foi projetado com esses requisitos em mente.</p>`
  },
  {
    slug: "faturamento-psicologia",
    title: "Como Faturar Mais como Psicólogo sem Aumentar Preços",
    excerpt: "Estratégias para aumentar a receita do consultório focando em eficiência e retenção de pacientes.",
    category: "Financeiro",
    readTime: "5 min",
    publishedAt: "2026-06-08",
    content: `<h2>Faturar mais não significa cobrar mais</h2>
<p>Existem várias formas de aumentar a receita sem aumentar o valor da consulta. O segredo é otimizar a operação.</p>

<h2>Estratégias para aumentar a receita</h2>

<h3>1. Reduza faltas</h3>
<p>Cada falta é uma consulta que deixou de acontecer. Com lembretes automáticos, você pode reduzir faltas em até 60%.</p>

<h3>2. Otimize sua agenda</h3>
<p>Horários vagos significam receita perdida. Use um sistema de agendamento online para preencher esses horários.</p>

<h3>3. Ofereça atendimento online</h3>
<p>Pacientes de outras cidades podem ser atendidos por videochamada, ampliando seu público.</p>

<h3>4. Implemente cobrança automática</h3>
<p>Lembrete de pagamento automático reduz inadimplência.</p>

<h3>5. Organize seus documentos</h3>
<p>Emita recibos e notas de serviço automaticamente, evitando perdas financeiras.</p>

<h2>Resultado</h2>
<p>Psicólogos que implementam essas estratégias aumentam sua receita em média 30% em 6 meses.</p>`
  }
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug)
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(post => post.category === category)
}
