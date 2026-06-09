# Setup — Lembretes Automáticos

## 1. Email (Já funciona)

SMTP Outlook já configurado no Vercel:
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

Teste: crie uma consulta na agenda → o sistema agenda lembretes (24h + 1h antes).

---

## 2. WhatsApp — Meta Cloud API

### 2.1 Criar conta Meta Business

1. Acesse https://business.facebook.com/overview
2. Crie uma **Conta Comercial** (se não tiver)
3. Adicione seu WhatsApp pessoal em **Contas do WhatsApp**

### 2.2 Criar template de mensagem

1. Vá em https://business.facebook.com/wa/manage/message-templates/
2. Clique **Criar template**
3. Dados:
   - **Nome**: `lembrete_consulta`
   - **Idioma**: `Português (Brasil)`
   - **Categoria**: `Utility`
4. No corpo da mensagem:
   ```
   Olá {{1}}, lembrete da sua consulta em {{2}} às {{3}}.
   ```
5. Adicione um botão (opcional): "Ver detalhes" com link para o site
6. Envie para aprovação (geralmente leva minutos)

### 2.3 Gerar token de acesso

1. Vá em https://developers.facebook.com/apps/
2. Crie um **App do tipo "Empresa"**
3. Adicione o produto **WhatsApp**
4. Configure o número de telefone:
   - **Phone Number ID** → anote este ID
5. Gere um **Token de Acesso Permanente**:
   - Vá em Ferramentas → **Graph API Explorer**
   - Selecione o app, permissão `whatsapp_business_messaging`
   - Gere o token, depois use o `Access Token Tool` para torná-lo permanente

### 2.4 Configurar no Vercel

Adicione estas env vars no Vercel (Production):

```
WHATSAPP_API_TOKEN=<token_permanente>
WHATSAPP_PHONE_NUMBER_ID=<id_do_numero>
```

---

## 3. Cron Job — Disparo Automático

O Vercel Hobby **não tem cron nativo**. Use cron-job.org (grátis):

1. Crie conta em https://cron-job.org
2. Clique **Create Cronjob**
3. Configure:
   - **URL**: `https://psicoflow-iota.vercel.app/api/cron/lembretes`
   - **Execution interval**: `Every 30 minutes`
   - **Request Method**: `GET`
4. Salve

A cada 30 min, a rota verifica notificações pendentes com `scheduledAt <= agora` e dispara.

---

## 4. Verificar se está funcionando

1. Crie uma consulta na agenda para daqui a 2 horas
2. Acesse `https://psicoflow-iota.vercel.app/api/cron/lembretes` manualmente (uma vez)
3. Veja o log no Vercel:
   - `Dashboard` → `Deployments` → clique no último → `Functions`
   - Procure `api/cron/lembretes`
   - Deve mostrar: `Notifications processed: { total: 2, sent: 2, failed: 0 }`

---

## 5. Envio manual (botão na agenda)

Na tela de detalhes da consulta, clique **Enviar Lembrete**:
- Dispara imediatamente para o email do paciente
- Se paciente tem WhatsApp cadastrado, também envia por WhatsApp
- O envio é **síncrono** — você vê toast de sucesso ou erro
