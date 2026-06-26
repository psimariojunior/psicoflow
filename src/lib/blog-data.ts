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
    slug: "psicologo-belo-horizonte-online",
    title: "Psic\u00f3logo em Belo Horizonte: Como Encontrar Atendimento Online e Presencial",
    excerpt: "Guia completo para encontrar psic\u00f3logo em BH, com dicas sobre modalidades, valores e como agendar sua primeira consulta.",
    category: "Dicas",
    readTime: "6 min",
    publishedAt: "2026-06-26",
    content: "<p>Encontrar um bom psic\u00f3logo em Belo Horizonte n\u00e3o precisa ser complicado. Com o crescimento do atendimento online, hoje voc\u00ea pode escolher entre consultas presenciais e por videochamada \u2014 sem sair de casa.</p><h2>Presencial ou online?</h2><p>Ambas as modalidades s\u00e3o regulamentadas pelo CFP e oferecem a mesma qualidade de atendimento. A diferen\u00e7a est\u00e1 na conveni\u00eancia:</p><ul><li><strong>Presencial</strong> \u2014 Ideal para quem prefere o contato face a face e tem disponibilidade de locomo\u00e7\u00e3o.</li><li><strong>Online</strong> \u2014 Permite atender de qualquer lugar, com a mesma seguran\u00e7a e sigilo. Ideal para quem tem rotina corrida ou mora longe do consult\u00f3rio.</li></ul><h2>Como escolher seu psic\u00f3logo</h2><h3>1. Verifique o CRP</h3><p>Todo psic\u00f3logo precisa ter registro ativo no Conselho Federal de Psicologia. Voc\u00ea pode consultar no site do CRF para confirmar.</p><h3>2. Escolha a abordagem</h3><p>Cada psic\u00f3logo trabalha com uma abordagem te\u00f3rica (TCC, Psican\u00e1lise, Gestalt-Terapia, etc.). Pesquise qual se encaixa melhor com seu perfil e necessidades.</p><h3>3. Agende uma sess\u00e3o experimental</h3><p>Muitos profissionais oferecem primeira sess\u00e3o com valor diferenciado. Use esse momento para avaliar o v\u00ednculo terap\u00eautico.</p><h3>4. Verifique a disponibilidade</h3><p>Um bom psic\u00f3logo oferece hor\u00e1rios variados (manh\u00e3, tarde, noite) para atender diferentes rotinas.</p><h2>Valores em Belo Horizonte</h2><p>O valor m\u00e9dio de consulta com psic\u00f3logo em BH varia entre R$ 150 e R$ 300 por sess\u00e3o. Atendimentos online tendem a ser mais acess\u00edveis, com valores a partir de R$ 100.</p><h2>Como agendar</h2><p>Com o PsiHumanis, voc\u00ea pode agendar sua consulta online de forma r\u00e1pida e segura. Escolha o profissional, selecione o hor\u00e1rio e receba a confirma\u00e7\u00e3o por email e WhatsApp.</p>"
  },
  {
    slug: "quanto-custa-psicologo",
    title: "Quanto Custa um Psic\u00f3logo? Guia de Valores 2026",
    excerpt: "Valores de consulta psicol\u00f3gica em 2026: presencial, online, por faixa de abordagem e como economizar sem perder qualidade.",
    category: "Financeiro",
    readTime: "5 min",
    publishedAt: "2026-06-24",
    content: "<p>O custo de uma consulta com psic\u00f3logo varia de acordo com a regi\u00e3o, modalidade e experi\u00eancia do profissional. Entender os valores ajuda a planejar seu tratamento sem surpresas.</p><h2>Valores m\u00e9dios no Brasil</h2><h3>Presencial</h3><ul><li><strong>Capitais</strong> \u2014 R$ 150 a R$ 300 por sess\u00e3o</li><li><strong>Interior</strong> \u2014 R$ 100 a R$ 200 por sess\u00e3o</li><li><strong>Psic\u00f3logo cl\u00ednico com experi\u00eancia</strong> \u2014 R$ 200 a R$ 400</li></ul><h3>Online</h3><ul><li><strong>M\u00e9dia nacional</strong> \u2014 R$ 100 a R$ 250 por sess\u00e3o</li><li><strong>Plataformas com gest\u00e3o integrada</strong> \u2014 R$ 80 a R$ 200</li></ul><h2>O que influi no pre\u00e7o?</h2><ul><li><strong>Experi\u00eancia do profissional</strong> \u2014 Psic\u00f3logos com mais anos de pr\u00e1tica cobram mais</li><li><strong>Abordagem</strong> \u2014 O valor pode variar conforme a abordagem e forma\u00e7\u00e3o do profissional</li><li><strong>Localiza\u00e7\u00e3o</strong> \u2014 Consult\u00f3rios em regi\u00f5es nobres cobram mais</li><li><strong>Modalidade</strong> \u2014 Online costuma ser mais acess\u00edvel</li></ul><h2>Como economizar</h2><h3>Atendimento online</h3><p>Consultas por videochamada costumam custar 20-30% menos que presenciais, sem perder qualidade.</p><h3>Cl\u00ednicas-escola</h3><p>Universidades oferecem atendimento com valor social supervisionado por profissionais experientes.</p><h3>Plataformas de gest\u00e3o</h3><p>Sistemas como o PsiHumanis oferecem planos a partir de R$ 97/m\u00eas para psic\u00f3logos, o que barateia o custo operacional e permite pre\u00e7os mais acess\u00edveis.</p><h2>Vale a pena investir?</h2><p>Sim. A sa\u00fade mental \u00e9 um investimento, n\u00e3o um custo. Pacientes que fazem acompanhamento psicol\u00f3gico regular relatam melhora na qualidade de vida, produtividade e relacionamentos.</p>"
  },
  {
    slug: "ansiedade-como-tratar",
    title: "Ansiedade: Como Tratar e Quando Procurar Um Psic\u00f3logo",
    excerpt: "Entenda os tipos de ansiedade, sintomas e quando \u00e9 hora de buscar ajuda profissional. Tratamentos baseados em evid\u00eancias.",
    category: "Dicas",
    readTime: "6 min",
    publishedAt: "2026-06-22",
    content: "<p>A ansiedade \u00e9 um dos transtornos mais comuns no Brasil, afetando mais de 18 milh\u00f5es de pessoas. Reconhecer os sinais e buscar ajuda profissional \u00e9 o primeiro passo para o tratamento.</p><h2>O que \u00e9 ansiedade?</h2><p>A ansiedade \u00e9 uma resposta natural do corpo a situa\u00e7\u00f5es de perigo ou estresse. O problema surge quando ela se torna constante, desproporcional e interfere no dia a dia.</p><h2>Sintomas comuns</h2><h3>F\u00edsicos</h3><ul><li>Taquicardia e palpita\u00e7\u00f5es</li><li>Sudorese</li><li>Tens\u00e3o muscular</li><li>Ins\u00f4nia</li><li>Fadiga</li></ul><h3>Psicol\u00f3gicos</h3><ul><li>Preocupa\u00e7\u00e3o excessiva</li><li>Irritabilidade</li><li>Dificuldade de concentra\u00e7\u00e3o</li><li>Medo desproporcional</li><li>Evita\u00e7\u00e3o de situa\u00e7\u00f5es</li></ul><h2>Quando procurar um psic\u00f3logo?</h2><p>Se a ansiedade est\u00e1 interferindo nas suas atividades diárias, relacionamentos ou trabalho, \u00e9 hora de buscar ajuda. Quanto antes iniciar o tratamento, melhores os resultados.</p><h2>Tratamentos baseados em evid\u00eancias</h2><h3>Terapia Cognitivo-Comportamental (TCC)</h3><p>A TCC \u00e9 considerada o padr\u00e3o-ouro para tratamento de ansiedade. Ela ajuda a identificar e modificar pensamentos disfuncionais.</p><h3>Terapia de Aceita\u00e7\u00e3o e Compromisso (ACT)</h3><p>A ACT ensina a conviver com emo\u00e7\u00f5es dif\u00edceis sem ser dominado por elas, promovendo flexibilidade psicol\u00f3gica.</p><h3>Psicofarmacologia</h3><p>Em casos moderados a severos, o psiquiatra pode associar medicamentos \u00e0 terapia para melhores resultados.</p><h2>Como um psic\u00f3logo pode ajudar</h2><p>Um psic\u00f3logo identifica o tipo de ansiedade, elabora um plano de tratamento personalizado e acompanha sua evolu\u00e7\u00e3o. Com o PsiHumanis, voc\u00ea pode agendar consultas online e receber lembretes autom\u00e1ticos para n\u00e3o perder nenhuma sess\u00e3o.</p>"
  },
  {
    slug: "terapia-online-vs-presencial",
    title: "Terapia Online vs Presencial: Qual a Melhor Op\u00e7\u00e3o?",
    excerpt: "Compara\u00e7\u00e3o completa entre atendimento psicol\u00f3gico online e presencial. Vantagens, desvantagens e para quem \u00e9 indicado cada modalidade.",
    category: "Tecnologia",
    readTime: "5 min",
    publishedAt: "2026-06-19",
    content: "<p>A terapia online cresceu 400% nos \u00faltimos anos no Brasil. Mas ser\u00e1 que ela \u00e9 t\u00e3o eficaz quanto a presencial? A resposta curta \u00e9: sim, desde que feita com profissional qualificado e plataforma adequada.</p><h2>Efic\u00e1cia comprovada</h2><p>Diversos estudos demonstram que a terapia online \u00e9 t\u00e3o eficaz quanto a presencial para tratamento de ansiedade, depress\u00e3o e outros transtornos. A regulamenta\u00e7\u00e3o pelo CFP (Resolu\u00e7\u00e3o 11/2018) garante a validade da modalidade.</p><h2>Vantagens da terapia online</h2><ul><li><strong>Comodidade</strong> \u2014 Atenda de qualquer lugar, sem deslocamento</li><li><strong>Flexibilidade</strong> \u2014 Hor\u00e1rios mais variados, incluindo noite e fim de semana</li><li><strong>Custo menor</strong> \u2014 Geralmente 20-30% mais acess\u00edvel</li><li><strong>Continuidade</strong> \u2014 Viajar n\u00e3o interrompe o tratamento</li><li><strong>Privacidade</strong> \u2014 Atenda do conforto do seu lar</li></ul><h2>Vantagens da terapia presencial</h2><ul><li><strong>Contato visual</strong> \u2014 Leitura corporal completa</li><li><strong>Ambiente terap\u00eautico</strong> \u2014 Espa\u00e7o f\u00edsico dedicado \u00e0 sess\u00e3o</li><li><strong>Tradi\u00e7\u00e3o</strong> \u2014 Para alguns pacientes, o presencial transmite mais seguran\u00e7a</li></ul><h2>Para quem \u00e9 indicado cada modalidade?</h2><h3>Online \u00e9 ideal para:</h3><ul><li>Pessoas com rotina corrida</li><li>Quem mora longe do consult\u00f3rio</li><li>Pacientes com mobilidade reduzida</li><li>Quem viaja frequentemente</li></ul><h3>Presencial \u00e9 ideal para:</h3><ul><li>Pacientes que preferem contato f\u00edsico</li><li>Crian\u00e7as e adolescentes (em alguns casos)</li><li>Casos que requerem avalia\u00e7\u00e3o presencial</li></ul><h2>Como come\u00e7ar</h2><p>Escolha um psic\u00f3logo com CRP ativo, verifique a plataforma de atendimento e agende sua primeira sess\u00e3o. O PsiHumanis oferece ambas as modalidades com agendamento online e sala virtual integrada.</p>"
  },
  {
    slug: "gestao-consultorio-psicologia-2026",
    title: "Gest\u00e3o de Consult\u00f3rio de Psicologia: O Guia Definitivo para 2026",
    excerpt: "Como organizar agenda, prontu\u00e1rios, finan\u00e7as e atendimento do seu consult\u00f3rio de psicologia de forma profissional e eficiente.",
    category: "Gest\u00e3o",
    readTime: "7 min",
    publishedAt: "2026-06-17",
    content: "<p>Gerenciar um consult\u00f3rio de psicologia vai al\u00e9m do atendimento cl\u00ednico. Agenda, prontu\u00e1rios, finan\u00e7as, documentos e comunica\u00e7\u00e3o com pacientes \u2014 tudo precisa estar organizado para o consult\u00f3rio funcionar bem.</p><h2>Os 5 pilares da gest\u00e3o</h2><h3>1. Agenda organizada</h3><p>Use um sistema de agendamento online que permita ao paciente escolher hor\u00e1rios dispon\u00edveis. Isso reduz faltas e elimina a necessidade de liga\u00e7\u00f5es.</p><h3>2. Prontu\u00e1rios digitais</h3><p>Papelada \u00e9 passado. Prontu\u00e1rios digitais s\u00e3o mais seguros, organizados e acess\u00edveis. Com criptografia e backup autom\u00e1tico, seus dados est\u00e3o protegidos.</p><h3>3. Controle financeiro</h3><p>Registre entradas e sa\u00eddas, emita recibos e acompanhe indicadores como ticket m\u00e9dio e taxa de recebimento.</p><h3>4. Comunica\u00e7\u00e3o automatizada</h3><p>Lembretes por WhatsApp e email reduzem faltas em at\u00e9 60%. Notifica\u00e7\u00f5es de pagamento automatizam a cobran\u00e7a.</p><h3>5. Seguran\u00e7a e compliance</h3><p>Conformidade com LGPD, CFP e normas \u00e9ticas n\u00e3o \u00e9 opcional. Use um sistema que atenda a todos os requisitos automaticamente.</p><h2>Ferramentas essenciais</h2><ul><li><strong>Agendamento online</strong> \u2014 Para que pacientes marquem consultas 24h</li><li><strong>Prontu\u00e1rio digital</strong> \u2014 Com criptografia e consentimento</li><li><strong>Gest\u00e3o financeira</strong> \u2014 Controle de recebimentos e faturas</li><li><strong>Sala virtual</strong> \u2014 Para atendimento online integrado</li><li><strong>Lembretes autom\u00e1ticos</strong> \u2014 WhatsApp e email</li></ul><h2>Como o PsiHumanis ajuda</h2><p>O PsiHumanis integra todos esses pilares em uma \u00fanica plataforma. Agenda, prontu\u00e1rio, financeiro, sala virtual e lembretes \u2014 tudo em um s\u00f3 lugar, com seguran\u00e7a e simplicidade.</p>"
  },
  {
    slug: "escolher-sistema-gestao-psicologia",
    title: "Como Escolher o Melhor Sistema de Gest\u00e3o para sua Cl\u00ednica de Psicologia",
    excerpt: "Crit\u00e9rios essenciais para escolher um software de gest\u00e3o que realmente atenda \u00e0s necessidades do seu consult\u00f3rio.",
    category: "Gest\u00e3o",
    readTime: "5 min",
    publishedAt: "2026-06-25",
    content: "<p>Gerenciar um consult\u00f3rio de psicologia envolve agenda, prontu\u00e1rios, pacientes, finan\u00e7as, documentos e videochamadas. Um bom sistema organiza tudo em um s\u00f3 lugar, economiza horas de trabalho e reduz erros.</p><p>Neste guia, voc\u00ea vai aprender os <strong>6 crit\u00e9rios essenciais</strong> para escolher a plataforma ideal para sua cl\u00ednica.</p><h2>1. Facilidade de uso</h2><p>O sistema precisa ser intuitivo. Se voc\u00ea leva mais tempo aprendendo do que usando, a ferramenta est\u00e1 atrapalhando seu trabalho. Prefira plataformas com interface limpa, onboarding guiado e suporte humano.</p><h2>2. Seguran\u00e7a dos dados</h2><p>Certifique-se de que o sistema oferece criptografia de ponta a ponta, backup autom\u00e1tico e conformidade com a LGPD e as resolu\u00e7\u00f5es do CFP. Dados de pacientes s\u00e3o sens\u00edveis \u2014 n\u00e3o abra m\u00e3o da seguran\u00e7a.</p><h2>3. Sala virtual integrada</h2><p>Se voc\u00ea faz atendimento online, a videochamada precisa estar integrada ao prontu\u00e1rio e \u00e0 agenda. Isso evita retrabalho e garante que cada sess\u00e3o fique registrada automaticamente.</p><h2>4. Lembretes autom\u00e1ticos</h2><p>Sistemas que enviam lembretes por WhatsApp e email reduzem faltas em at\u00e9 60%. Isso impacta diretamente seu faturamento e a ades\u00e3o dos pacientes ao tratamento.</p><h2>5. Gest\u00e3o financeira</h2><p>Controle de recebimentos, emiss\u00e3o de recibos, concilia\u00e7\u00e3o com Stripe e indicadores de performance economizam horas de trabalho todo m\u00eas.</p><h2>6. Suporte humanizado</h2><p>Quando algo der errado, voc\u00ea precisa de suporte r\u00e1pido. Prefira sistemas com canal direto de atendimento, chat e tempo de resposta garantido.</p><h2>Conclus\u00e3o</h2><p>O PsiHumanis atende todos esses crit\u00e9rios com interface moderna, suporte direto e pre\u00e7o competitivo. Ideal para profissionais individuais e cl\u00ednicas que querem crescer com organiza\u00e7\u00e3o.</p>"
  },
  {
    slug: "atendimento-online-psicologia",
    title: "Atendimento Online em Psicologia: Guia Completo para Come\u00e7ar",
    excerpt: "Tudo que voc\u00ea precisa saber para oferecer atendimento online seguro, \u00e9tico e profissional.",
    category: "Tecnologia",
    readTime: "6 min",
    publishedAt: "2026-06-23",
    content: "<p>A terapia online veio para ficar. Desde a regulamenta\u00e7\u00e3o pelo Conselho Federal de Psicologia, o atendimento por videochamada cresceu exponencialmente e se consolidou como uma modalidade essencial para qualquer profissional.</p><h2>O que diz o CFP?</h2><p>A Resolu\u00e7\u00e3o CFP n\u00b0 11/2018 regula os servi\u00e7os psicol\u00f3gicos prestados por meios tecnol\u00f3gicos. O principal requisito \u00e9 que a plataforma utilizada garanta <strong>sigilo, seguran\u00e7a e confidencialidade</strong> das informa\u00e7\u00f5es.</p><h2>Vantagens para o psic\u00f3logo</h2><h3>Amplie seu alcance</h3><p>Atenda pacientes de qualquer lugar do Brasil e do mundo. Sua cl\u00ednica n\u00e3o tem fronteiras geogr\u00e1ficas.</p><h3>Reduza custos</h3><p>Sem despesas de locomo\u00e7\u00e3o, aluguel de sala extra ou material f\u00edsico. Voc\u00ea pode atender de casa ou do consult\u00f3rio.</p><h3>Menos faltas</h3><p>Pacientes online faltam menos \u2014 a comodidade de estar em casa aumenta a ades\u00e3o ao tratamento em at\u00e9 40%.</p><h3>Registro autom\u00e1tico</h3><p>Com um sistema integrado, a sess\u00e3o online j\u00e1 gera prontu\u00e1rio automaticamente, sem trabalho extra.</p><h2>O que verificar na plataforma</h2><ul><li><strong>Criptografia ponta a ponta</strong> \u2014 dados protegidos durante toda a transmiss\u00e3o</li><li><strong>Servidor no Brasil</strong> \u2014 conformidade com a LGPD</li><li><strong>Qualidade adaptativa</strong> \u2014 a plataforma se ajusta \u00e0 velocidade de internet do paciente</li><li><strong>Integra\u00e7\u00e3o com prontu\u00e1rio</strong> \u2014 videochamada e registro cl\u00ednico no mesmo lugar</li></ul><h2>Como come\u00e7ar</h2><p>Escolha um sistema de gest\u00e3o que ofere\u00e7a sala virtual integrada com criptografia e conformidade com o CFP. O PsiHumanis oferece tudo isso em uma plataforma \u00fanica, com agenda, prontu\u00e1rio e videochamada.</p>"
  },
  {
    slug: "como-organizar-consultorio-psicologia",
    title: "Como Organizar seu Consult\u00f3rio de Psicologia em 2026",
    excerpt: "Dicas pr\u00e1ticas para organizar sua agenda, prontu\u00e1rios e finan\u00e7as de forma eficiente e profissional.",
    category: "Gest\u00e3o",
    readTime: "5 min",
    publishedAt: "2026-06-20",
    content: "<p>Um consult\u00f3rio bem organizado n\u00e3o apenas aumenta a produtividade, mas tamb\u00e9m melhora a experi\u00eancia do paciente. Quando o psic\u00f3logo tem seus prontu\u00e1rios, agenda e finan\u00e7as organizados, ele consegue dedicar mais tempo ao que realmente importa: o atendimento cl\u00ednico.</p><h2>5 passos para organizar seu consult\u00f3rio</h2><h3>1. Digitalize seus prontu\u00e1rios</h3><p>Papelada \u00e9 passado. Prontu\u00e1rios digitais s\u00e3o mais seguros, organizados e acess\u00edveis. Com um sistema como o PsiHumanis, voc\u00ea pode criar registros cl\u00ednicos completos em poucos cliques, com backup autom\u00e1tico e criptografia.</p><h3>2. Automatize sua agenda</h3><p>Use um sistema de agendamento online para que seus pacientes marquem consultas sem precisar ligar. A disponibilidade em tempo real reduz faltas e melhora a experi\u00eancia do paciente.</p><h3>3. Controle suas finan\u00e7as</h3><p>Registre todas as entradas e sa\u00eddas. Saiba exatamente quanto fatura por m\u00eas, quais pacientes est\u00e3o com pagamento pendente e qual seu ticket m\u00e9dio. Um financeiro organizado \u00e9 a base de um consult\u00f3rio sustent\u00e1vel.</p><h3>4. Use lembretes autom\u00e1ticos</h3><p>Envie lembretes por WhatsApp e email 24h e 1h antes da consulta. Isso reduz faltas em at\u00e9 40% e melhora a comunica\u00e7\u00e3o com o paciente.</p><h3>5. Mantenha registros atualizados</h3><p>Ap\u00f3s cada sess\u00e3o, registre as principais observa\u00e7\u00f5es no prontu\u00e1rio. Isso ajuda no acompanhamento do paciente e na continuidade do tratamento.</p><h2>Conclus\u00e3o</h2><p>Organizar seu consult\u00f3rio n\u00e3o precisa ser complicado. Com as ferramentas certas, voc\u00ea pode ter tudo funcionando em poucos dias. O PsiHumanis foi criado especificamente para isso.</p>"
  },
  {
    slug: "prontuario-digital-psicologia",
    title: "Prontu\u00e1rio Digital na Psicologia: Guia Completo de Implementa\u00e7\u00e3o",
    excerpt: "Entenda como o prontu\u00e1rio digital pode transformar a gest\u00e3o do seu consult\u00f3rio e garantir conformidade com a LGPD.",
    category: "Tecnologia",
    readTime: "7 min",
    publishedAt: "2026-06-18",
    content: "<p>O prontu\u00e1rio digital \u00e9 a vers\u00e3o eletr\u00f4nica do prontu\u00e1rio cl\u00ednico tradicional. Ele permite registrar, armazenar e consultar informa\u00e7\u00f5es do paciente de forma segura, organizada e acess\u00edvel de qualquer lugar.</p><h2>Vantagens do prontu\u00e1rio digital</h2><h3>Seguran\u00e7a</h3><p>Dados criptografados e backups autom\u00e1ticos. Diferente do papel, que pode ser perdido, danificado ou extraviado, o prontu\u00e1rio digital est\u00e1 sempre protegido e dispon\u00edvel.</p><h3>Acessibilidade</h3><p>Acesse os prontu\u00e1rios de qualquer lugar, a qualquer momento. Ideal para psic\u00f3logos que trabalham em m\u00faltiplos consult\u00f3rios ou fazem atendimento online.</p><h3>Conformidade com LGPD</h3><p>Prontu\u00e1rios digitais permitem controle preciso sobre quem acessa os dados do paciente, atendendo a todos os requisitos da Lei Geral de Prote\u00e7\u00e3o de Dados.</p><h3>Busca r\u00e1pida</h3><p>Encontre qualquer informa\u00e7\u00e3o em segundos, sem precisar folhear p\u00e1ginas. Hist\u00f3rico completo do paciente com poucos cliques.</p><h3>Sustentabilidade</h3><p>Menos papel, menos impress\u00e3o, menos armazenamento f\u00edsico. Sua contribui\u00e7\u00e3o para o meio ambiente come\u00e7a no consult\u00f3rio.</p><h2>Como implementar</h2><p>Comece escolhendo um sistema confi\u00e1vel. O PsiHumanis oferece prontu\u00e1rios digitais com criptografia, consentimento digital do paciente, backup autom\u00e1tico e logs de auditoria. O processo de migra\u00e7\u00e3o \u00e9 simples e r\u00e1pido.</p>"
  },
  {
    slug: "reduzir-faltas-consultas",
    title: "7 Estrat\u00e9gias para Reduzir Faltas em Consultas de Psicologia",
    excerpt: "Faltas s\u00e3o um dos maiores desafios da cl\u00ednica. Veja como reduzi-las com estrat\u00e9gias simples e eficazes.",
    category: "Dicas",
    readTime: "4 min",
    publishedAt: "2026-06-15",
    content: "<p>Faltas em consultas s\u00e3o um dos maiores problemas enfrentados por psic\u00f3logos. Al\u00e9m do preju\u00edzo financeiro, elas quebram a continuidade do tratamento e comprometem o v\u00ednculo terap\u00eautico.</p><p>As principais raz\u00f5es para faltas s\u00e3o: esquecimento, vergonha, falta de dinheiro e dificuldade de locomo\u00e7\u00e3o. A boa not\u00edcia \u00e9 que todas podem ser trabalhadas.</p><h2>7 estrat\u00e9gias comprovadas</h2><h3>1. Lembretes autom\u00e1ticos</h3><p>Envie lembretes 24h e 1h antes da consulta. Use WhatsApp e email para garantir que o paciente receba em m\u00faltiplos canais.</p><h3>2. Agendamento online</h3><p>Permita que o paciente escolha o hor\u00e1rio que melhor se encaixa na rotina dele. Quanto mais conveniente, menor a chance de falta.</p><h3>3. Flexibilidade de hor\u00e1rios</h3><p>Ofere\u00e7a hor\u00e1rios variados (manh\u00e3, tarde, noite) para atender diferentes rotinas e perfis de paciente.</p><h3>4. Consulta online</h3><p>A op\u00e7\u00e3o de atendimento por videochamada elimina barreiras de locomo\u00e7\u00e3o e tempo. Pacientes online faltam significativamente menos.</p><h3>5. Pol\u00edtica de cancelamento clara</h3><p>Estabele\u00e7a regras claras sobre cancelamentos e reagendamentos. Comunique com transpar\u00eancia e empatia.</p><h3>6. Follow-up entre sess\u00f5es</h3><p>Envie materiais ou exerc\u00edcios entre as consultas para manter o v\u00ednculo e a motiva\u00e7\u00e3o do paciente.</p><h3>7. Feedback positivo</h3><p>Reconhe\u00e7a o comprometimento do paciente com o tratamento. Uma simples mensagem de apoio faz diferen\u00e7a.</p><h2>Resultados</h2><p>Psic\u00f3logos que implementam essas estrat\u00e9gias relatam redu\u00e7\u00e3o de faltas em at\u00e9 60%, com melhora significativa na ades\u00e3o ao tratamento.</p>"
  },
  {
    slug: "videoconferencia-segura-psicologia",
    title: "Videoconfer\u00eancia Segura para Psic\u00f3logos: Guia Completo",
    excerpt: "Saiba como escolher e usar plataformas de videochamada seguras para atendimento online de psicologia.",
    category: "Tecnologia",
    readTime: "6 min",
    publishedAt: "2026-06-12",
    content: "<p>O atendimento online por videoconfer\u00eancia \u00e9 uma realidade na psicologia brasileira. Desde a regulamenta\u00e7\u00e3o pelo CFP, milhares de profissionais adotaram a modalidade e colhem resultados excelentes.</p><h2>Atendimento online \u00e9 seguro?</h2><p>Sim, desde que voc\u00ea use plataformas adequadas. A videoconfer\u00eancia para psicologia requer <strong>sigilo, criptografia e conformidade \u00e9tica</strong> com as resolu\u00e7\u00f5es do Conselho.</p><h2>O que verificar na plataforma</h2><h3>Criptografia ponta a ponta</h3><p>Os dados devem ser criptografados durante toda a transmiss\u00e3o, do seu dispositivo ao do paciente. Sem exce\u00e7\u00f5es.</p><h3>Servidor no Brasil</h3><p>Dados devem ser armazenados em servidores brasileiros para conformidade com a LGPD. Isso garante que a legisla\u00e7\u00e3o brasileira seja aplicada.</p><h3>Qualidade de conex\u00e3o</h3><p>A plataforma deve adaptar a qualidade \u00e0 velocidade da internet do paciente, garantindo uma experi\u00eancia fluida mesmo em conex\u00f5es mais lentas.</p><h3>Integra\u00e7\u00e3o com prontu\u00e1rio</h3><p>O ideal \u00e9 que a videochamada esteja integrada ao sistema de gest\u00e3o, para facilitar o registro da sess\u00e3o e manter o hist\u00f3rico completo.</p><h2>Como come\u00e7ar</h2><p>O PsiHumanis oferece videoconfer\u00eancia integrada com criptografia, servidor no Brasil e registro autom\u00e1tico da sess\u00e3o no prontu\u00e1rio.</p>"
  },
  {
    slug: "lgpd-psicologia",
    title: "LGPD e Psicologia: O que o psic\u00f3logo precisa saber",
    excerpt: "A Lei Geral de Prote\u00e7\u00e3o de Dados afeta diretamente o trabalho do psic\u00f3logo. Veja como se adequar sem complica\u00e7\u00e3o.",
    category: "Legal",
    readTime: "5 min",
    publishedAt: "2026-06-10",
    content: "<p>A LGPD (Lei Geral de Prote\u00e7\u00e3o de Dados) refor\u00e7a o sigilo profissional que j\u00e1 \u00e9 obrigat\u00f3rio para psic\u00f3logos. Agora, al\u00e9m das normas do CFP, voc\u00ea tamb\u00e9m precisa atender \u00e0 legisla\u00e7\u00e3o de prote\u00e7\u00e3o de dados.</p><h2>Principais pontos para psic\u00f3logos</h2><h3>Consentimento</h3><p>O paciente deve ser informado sobre como seus dados ser\u00e3o usados, armazenados e compartilhados, e dar consentimento expl\u00edcito por escrito.</p><h3>Seguran\u00e7a dos dados</h3><p>Dados pessoais e dados sens\u00edveis (como informa\u00e7\u00f5es de sa\u00fade mental) devem ser protegidos com criptografia, controle de acesso e backup regular.</p><h3>Direito ao esquecimento</h3><p>O paciente pode solicitar a exclus\u00e3o de seus dados a qualquer momento. Mantenha registros de quando e por que os dados foram coletados.</p><h3>Registro de atividades</h3><p>Mantenha um registro de todas as opera\u00e7\u00f5es realizadas com dados pessoais. Isso \u00e9 obrigat\u00f3rio por lei e pode ser solicitado a qualquer momento.</p><h3>Notifica\u00e7\u00e3o de vazamento</h3><p>Em caso de vazamento de dados, voc\u00ea deve notificar a ANPD (Autoridade Nacional de Prote\u00e7\u00e3o de Dados) e os pacientes afetados em at\u00e9 72 horas.</p><h2>Como se adequar</h2><p>Use um sistema que atenda automaticamente \u00e0 LGPD, com criptografia, consentimento digital, logs de auditoria e backup autom\u00e1tico. O PsiHumanis foi projetado com esses requisitos desde o in\u00edcio.</p>"
  },
  {
    slug: "faturamento-psicologia",
    title: "Como Faturar Mais como Psic\u00f3logo sem Aumentar Pre\u00e7os",
    excerpt: "Estrat\u00e9gias para aumentar a receita do consult\u00f3rio focando em efici\u00eancia, reten\u00e7\u00e3o e gest\u00e3o inteligente.",
    category: "Financeiro",
    readTime: "5 min",
    publishedAt: "2026-06-08",
    content: "<p>Faturar mais n\u00e3o significa cobrar mais caro. Existem v\u00e1rias formas de aumentar a receita sem aumentar o valor da consulta. O segredo est\u00e1 em otimizar a opera\u00e7\u00e3o do consult\u00f3rio.</p><h2>Estrat\u00e9gias para aumentar a receita</h2><h3>1. Reduza faltas</h3><p>Cada falta \u00e9 uma consulta que deixou de acontecer. Com lembretes autom\u00e1ticos por WhatsApp e email, voc\u00ea pode reduzir faltas em at\u00e9 60%. Isso significa mais sess\u00f5es realizadas sem aumentar o pre\u00e7o.</p><h3>2. Otimize sua agenda</h3><p>Hor\u00e1rios vagos s\u00e3o receita perdida. Use um sistema de agendamento online com disponibilidade em tempo real para preencher esses hor\u00e1rios.</p><h3>3. Ofere\u00e7a atendimento online</h3><p>Pacientes de outras cidades podem ser atendidos por videochamada, ampliando seu p\u00fablico sem custos adicionais de estrutura.</p><h3>4. Automatize cobran\u00e7as</h3><p>Lembretes de pagamento autom\u00e1ticos reduzem a inadimpl\u00eancia. Com um sistema integrado de Stripe, voc\u00ea recebe mais r\u00e1pido e com menos atrito.</p><h3>5. Organize documentos fiscais</h3><p>Emita recibos e notas de servi\u00e7o automaticamente. Pacientes que precisam de comprovantes para reembolso tendem a ser mais fi\u00e9is.</p><h2>Resultado</h2><p>Psic\u00f3logos que implementam essas estrat\u00e9gias aumentam sua receita em m\u00e9dia 30% em 6 meses, sem aumentar o valor da consulta.</p>"
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
