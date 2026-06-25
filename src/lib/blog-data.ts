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

const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} de ${monthNames[d.getMonth()]} de ${d.getFullYear()}`
}

export const blogPosts: BlogPost[] = [
  {
    slug: "escolher-sistema-gestao-psicologia",
    title: "Como Escolher o Melhor Sistema de Gestão para sua Clínica de Psicologia",
    excerpt: "Critérios essenciais para escolher um software de gestão que realmente atenda às necessidades do seu consultório.",
    category: "Gestão",
    readTime: "5 min",
    publishedAt: "2026-06-25",
    content: `<p>Gerenciar um consultório de psicologia envolve agenda, prontuários, pacientes, finanças, documentos e videochamadas. Um bom sistema organiza tudo em um só lugar, economiza horas de trabalho e reduz erros.</p>
<p>Neste guia, você vai aprender os <strong>6 critérios essenciais</strong> para escolher a plataforma ideal para sua clínica.</p>
<h2>1. Facilidade de uso</h2>
<p>O sistema precisa ser intuitivo. Se você leva mais tempo aprendendo do que usando, a ferramenta está atrapalhando seu trabalho. Prefira plataformas com interface limpa, onboarding guiado e suporte humano.</p>
<h2>2. Segurança dos dados</h2>
<p>Certifique-se de que o sistema oferece criptografia de ponta a ponta, backup automático e conformidade com a LGPD e as resoluções do CFP. Dados de pacientes são sensíveis — não abra mão da segurança.</p>
<h2>3. Sala virtual integrada</h2>
<p>Se você faz atendimento online, a videochamada precisa estar integrada ao prontuário e à agenda. Isso evita retrabalho e garante que cada sessão fique registrada automaticamente.</p>
<h2>4. Lembretes automáticos</h2>
<p>Sistemas que enviam lembretes por WhatsApp e email reduzem faltas em até 60%. Isso impacta diretamente seu faturamento e a adesão dos pacientes ao tratamento.</p>
<h2>5. Gestão financeira</h2>
<p>Controle de recebimentos, emissão de recibos, conciliação com Stripe e indicadores de performance economizam horas de trabalho todo mês.</p>
<h2>6. Suporte humanizado</h2>
<p>Quando algo der errado, você precisa de suporte rápido. Prefira sistemas com canal direto de atendimento, chat e tempo de resposta garantido.</p>
<h2>Conclusão</h2>
<p>O PsiHumanis atende todos esses critérios com interface moderna, suporte direto e preço competitivo. Ideal para profissionais individuais e clínicas que querem crescer com organização.</p>`
  },
  {
    slug: "atendimento-online-psicologia",
    title: "Atendimento Online em Psicologia: Guia Completo para Começar",
    excerpt: "Tudo que você precisa saber para oferecer atendimento online seguro, ético e profissional.",
    category: "Tecnologia",
    readTime: "6 min",
    publishedAt: "2026-06-23",
    content: `<p>A terapia online veio para ficar. Desde a regulamentação pelo Conselho Federal de Psicologia, o atendimento por videochamada cresceu exponencialmente e se consolidou como uma modalidade essencial para qualquer profissional.</p>
<h2>O que diz o CFP?</h2>
<p>A Resolução CFP n° 11/2018 regula os serviços psicológicos prestados por meios tecnológicos. O principal requisito é que a plataforma utilizada garanta <strong>sigilo, segurança e confidencialidade</strong> das informações.</p>
<h2>Vantagens para o psicólogo</h2>
<h3>Amplie seu alcance</h3>
<p>Atenda pacientes de qualquer lugar do Brasil e do mundo. Sua clínica não tem fronteiras geográficas.</p>
<h3>Reduza custos</h3>
<p>Sem despesas de locomoção, aluguel de sala extra ou material físico. Você pode atender de casa ou do consultório.</p>
<h3>Menos faltas</h3>
<p>Pacientes online faltam menos — a comodidade de estar em casa aumenta a adesão ao tratamento em até 40%.</p>
<h3>Registro automático</h3>
<p>Com um sistema integrado, a sessão online já gera prontuário automaticamente, sem trabalho extra.</p>
<h2>O que verificar na plataforma</h2>
<ul>
<li><strong>Criptografia ponta a ponta</strong> — dados protegidos durante toda a transmissão</li>
<li><strong>Servidor no Brasil</strong> — conformidade com a LGPD</li>
<li><strong>Qualidade adaptativa</strong> — a plataforma se ajusta à velocidade de internet do paciente</li>
<li><strong>Integração com prontuário</strong> — videochamada e registro clínico no mesmo lugar</li>
</ul>
<h2>Como começar</h2>
<p>Escolha um sistema de gestão que ofereça sala virtual integrada com criptografia e conformidade com o CFP. O PsiHumanis oferece tudo isso em uma plataforma única, com agenda, prontuário e videochamada.</p>`
  },
  {
    slug: "como-organizar-consultorio-psicologia",
    title: "Como Organizar seu Consultório de Psicologia em 2026",
    excerpt: "Dicas práticas para organizar sua agenda, prontuários e finanças de forma eficiente e profissional.",
    category: "Gestão",
    readTime: "5 min",
    publishedAt: "2026-06-20",
    content: `<p>Um consultório bem organizado não apenas aumenta a produtividade, mas também melhora a experiência do paciente. Quando o psicólogo tem seus prontuários, agenda e finanças organizados, ele consegue dedicar mais tempo ao que realmente importa: o atendimento clínico.</p>
<h2>5 passos para organizar seu consultório</h2>
<h3>1. Digitalize seus prontuários</h3>
<p>Papelada é passado. Prontuários digitais são mais seguros, organizados e acessíveis. Com um sistema como o PsiHumanis, você pode criar registros clínicos completos em poucos cliques, com backup automático e criptografia.</p>
<h3>2. Automatize sua agenda</h3>
<p>Use um sistema de agendamento online para que seus pacientes marquem consultas sem precisar ligar. A disponibilidade em tempo real reduz faltas e melhora a experiência do paciente.</p>
<h3>3. Controle suas finanças</h3>
<p>Registre todas as entradas e saídas. Saiba exatamente quanto fatura por mês, quais pacientes estão com pagamento pendente e qual seu ticket médio. Um financeiro organizado é a base de um consultório sustentável.</p>
<h3>4. Use lembretes automáticos</h3>
<p>Envie lembretes por WhatsApp e email 24h e 1h antes da consulta. Isso reduz faltas em até 40% e melhora a comunicação com o paciente.</p>
<h3>5. Mantenha registros atualizados</h3>
<p>Após cada sessão, registre as principais observações no prontuário. Isso ajuda no acompanhamento do paciente e na continuidade do tratamento.</p>
<h2>Conclusão</h2>
<p>Organizar seu consultório não precisa ser complicado. Com as ferramentas certas, você pode ter tudo funcionando em poucos dias. O PsiHumanis foi criado especificamente para isso.</p>`
  },
  {
    slug: "prontuario-digital-psicologia",
    title: "Prontuário Digital na Psicologia: Guia Completo de Implementação",
    excerpt: "Entenda como o prontuário digital pode transformar a gestão do seu consultório e garantir conformidade com a LGPD.",
    category: "Tecnologia",
    readTime: "7 min",
    publishedAt: "2026-06-18",
    content: `<p>O prontuário digital é a versão eletrônica do prontuário clínico tradicional. Ele permite registrar, armazenar e consultar informações do paciente de forma segura, organizada e acessível de qualquer lugar.</p>
<h2>Vantagens do prontuário digital</h2>
<h3>Segurança</h3>
<p>Dados criptografados e backups automáticos. Diferente do papel, que pode ser perdido, danificado ou extraviado, o prontuário digital está sempre protegido e disponível.</p>
<h3>Acessibilidade</h3>
<p>Acesse os prontuários de qualquer lugar, a qualquer momento. Ideal para psicólogos que trabalham em múltiplos consultórios ou fazem atendimento online.</p>
<h3>Conformidade com LGPD</h3>
<p>Prontuários digitais permitem controle preciso sobre quem acessa os dados do paciente, atendendo a todos os requisitos da Lei Geral de Proteção de Dados.</p>
<h3>Busca rápida</h3>
<p>Encontre qualquer informação em segundos, sem precisar folhear páginas. Histórico completo do paciente com poucos cliques.</p>
<h3>Sustentabilidade</h3>
<p>Menos papel, menos impressão, menos armazenamento físico. Sua contribuição para o meio ambiente começa no consultório.</p>
<h2>Como implementar</h2>
<p>Comece escolhendo um sistema confiável. O PsiHumanis oferece prontuários digitais com criptografia, consentimento digital do paciente, backup automático e logs de auditoria. O processo de migração é simples e rápido.</p>`
  },
  {
    slug: "reduzir-faltas-consultas",
    title: "7 Estratégias para Reduzir Faltas em Consultas de Psicologia",
    excerpt: "Faltas são um dos maiores desafios da clínica. Veja como reduzi-las com estratégias simples e eficazes.",
    category: "Dicas",
    readTime: "4 min",
    publishedAt: "2026-06-15",
    content: `<p>Faltas em consultas são um dos maiores problemas enfrentados por psicólogos. Além do prejuízo financeiro, elas quebram a continuidade do tratamento e comprometem o vínculo terapêutico.</p>
<p>As principais razões para faltas são: esquecimento, vergonha, falta de dinheiro e dificuldade de locomoção. A boa notícia é que todas podem ser trabalhadas.</p>
<h2>7 estratégias comprovadas</h2>
<h3>1. Lembretes automáticos</h3>
<p>Envie lembretes 24h e 1h antes da consulta. Use WhatsApp e email para garantir que o paciente receba em múltiplos canais.</p>
<h3>2. Agendamento online</h3>
<p>Permita que o paciente escolha o horário que melhor se encaixa na rotina dele. Quanto mais conveniente, menor a chance de falta.</p>
<h3>3. Flexibilidade de horários</h3>
<p>Ofereça horários variados (manhã, tarde, noite) para atender diferentes rotinas e perfis de paciente.</p>
<h3>4. Consulta online</h3>
<p>A opção de atendimento por videochamada elimina barreiras de locomoção e tempo. Pacientes online faltam significativamente menos.</p>
<h3>5. Política de cancelamento clara</h3>
<p>Estabeleça regras claras sobre cancelamentos e reagendamentos. Comunique com transparência e empatia.</p>
<h3>6. Follow-up entre sessões</h3>
<p>Envie materiais ou exercícios entre as consultas para manter o vínculo e a motivação do paciente.</p>
<h3>7. Feedback positivo</h3>
<p>Reconheça o comprometimento do paciente com o tratamento. Uma simples mensagem de apoio faz diferença.</p>
<h2>Resultados</h2>
<p>Psicólogos que implementam essas estratégias relatam redução de faltas em até 60%, com melhora significativa na adesão ao tratamento.</p>`
  },
  {
    slug: "videoconferencia-segura-psicologia",
    title: "Videoconferência Segura para Psicólogos: Guia Completo",
    excerpt: "Saiba como escolher e usar plataformas de videochamada seguras para atendimento online de psicologia.",
    category: "Tecnologia",
    readTime: "6 min",
    publishedAt: "2026-06-12",
    content: `<p>O atendimento online por videoconferência é uma realidade na psicologia brasileira. Desde a regulamentação pelo CFP, milhares de profissionais adotaram a modalidade e colhem resultados excelentes.</p>
<h2>Atendimento online é seguro?</h2>
<p>Sim, desde que você use plataformas adequadas. A videoconferência para psicologia requer <strong>sigilo, criptografia e conformidade ética</strong> com as resoluções do Conselho.</p>
<h2>O que verificar na plataforma</h2>
<h3>Criptografia ponta a ponta</h3>
<p>Os dados devem ser criptografados durante toda a transmissão, do seu dispositivo ao do paciente. Sem exceções.</p>
<h3>Servidor no Brasil</h3>
<p>Dados devem ser armazenados em servidores brasileiros para conformidade com a LGPD. Isso garante que a legislação brasileira seja aplicada.</p>
<h3>Qualidade de conexão</h3>
<p>A plataforma deve adaptar a qualidade à velocidade da internet do paciente, garantindo uma experiência fluida mesmo em conexões mais lentas.</p>
<h3>Integração com prontuário</h3>
<p>O ideal é que a videochamada esteja integrada ao sistema de gestão, para facilitar o registro da sessão e manter o histórico completo.</p>
<h2>Como começar</h2>
<p>O PsiHumanis oferece videoconferência integrada com criptografia, servidor no Brasil e registro automático da sessão no prontuário.</p>`
  },
  {
    slug: "lgpd-psicologia",
    title: "LGPD e Psicologia: O que o psicólogo precisa saber",
    excerpt: "A Lei Geral de Proteção de Dados afeta diretamente o trabalho do psicólogo. Veja como se adequar sem complicação.",
    category: "Legal",
    readTime: "5 min",
    publishedAt: "2026-06-10",
    content: `<p>A LGPD (Lei Geral de Proteção de Dados) reforça o sigilo profissional que já é obrigatório para psicólogos. Agora, além das normas do CFP, você também precisa atender à legislação de proteção de dados.</p>
<h2>Principais pontos para psicólogos</h2>
<h3>Consentimento</h3>
<p>O paciente deve ser informado sobre como seus dados serão usados, armazenados e compartilhados, e dar consentimento explícito por escrito.</p>
<h3>Segurança dos dados</h3>
<p>Dados pessoais e dados sensíveis (como informações de saúde mental) devem ser protegidos com criptografia, controle de acesso e backup regular.</p>
<h3>Direito ao esquecimento</h3>
<p>O paciente pode solicitar a exclusão de seus dados a qualquer momento. Mantenha registros de quando e por que os dados foram coletados.</p>
<h3>Registro de atividades</h3>
<p>Mantenha um registro de todas as operações realizadas com dados pessoais. Isso é obrigatório por lei e pode ser solicitado a qualquer momento.</p>
<h3>Notificação de vazamento</h3>
<p>Em caso de vazamento de dados, você deve notificar a ANPD (Autoridade Nacional de Proteção de Dados) e os pacientes afetados em até 72 horas.</p>
<h2>Como se adequar</h2>
<p>Use um sistema que atenda automaticamente à LGPD, com criptografia, consentimento digital, logs de auditoria e backup automático. O PsiHumanis foi projetado com esses requisitos desde o início.</p>`
  },
  {
    slug: "faturamento-psicologia",
    title: "Como Faturar Mais como Psicólogo sem Aumentar Preços",
    excerpt: "Estratégias para aumentar a receita do consultório focando em eficiência, retenção e gestão inteligente.",
    category: "Financeiro",
    readTime: "5 min",
    publishedAt: "2026-06-08",
    content: `<p>Faturar mais não significa cobrar mais caro. Existem várias formas de aumentar a receita sem aumentar o valor da consulta. O segredo está em otimizar a operação do consultório.</p>
<h2>Estratégias para aumentar a receita</h2>
<h3>1. Reduza faltas</h3>
<p>Cada falta é uma consulta que deixou de acontecer. Com lembretes automáticos por WhatsApp e email, você pode reduzir faltas em até 60%. Isso significa mais sessões realizadas sem aumentar o preço.</p>
<h3>2. Otimize sua agenda</h3>
<p>Horários vagos são receita perdida. Use um sistema de agendamento online com disponibilidade em tempo real para preencher esses horários.</p>
<h3>3. Ofereça atendimento online</h3>
<p>Pacientes de outras cidades podem ser atendidos por videochamada, ampliando seu público sem custos adicionais de estrutura.</p>
<h3>4. Automatize cobranças</h3>
<p>Lembretes de pagamento automáticos reduzem a inadimplência. Com um sistema integrado de Stripe, você recebe mais rápido e com menos atrito.</p>
<h3>5. Organize documentos fiscais</h3>
<p>Emita recibos e notas de serviço automaticamente. Pacientes que precisam de comprovantes para reembolso tendem a ser mais fiéis.</p>
<h2>Resultado</h2>
<p>Psicólogos que implementam essas estratégias aumentam sua receita em média 30% em 6 meses, sem aumentar o valor da consulta.</p>`
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug)
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(post => post.category === category)
}

export function getAllCategories(): string[] {
  return Array.from(new Set(blogPosts.map(p => p.category)))
}
