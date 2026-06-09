# PsicoFlow — Session Log

## Goal
Deploy to Vercel + Neon PostgreSQL + LiveKit Cloud; patient video call without login; room closing with DB persistence; polished pre-join camera preview.

## Architecture
- **Auth**: NextAuth (Credentials) — psychologist only; patient bypasses auth via `?patient=true` on token API
- **Video**: LiveKit Cloud (`livekit.io`) — JWT tokens generated server-side; `@livekit/components-react` on frontend
- **DB**: Neon PostgreSQL via Prisma — stores users, sessions, closed rooms
- **Deploy**: Vercel (Hobby) + Neon free tier
- **Patient flow**: Welcome (room code) → Pre-join (camera preview + toggles) → Video call (LiveKitRoom)

## Key Decisions & History

### Room closing (ClosedRoom model)
- `prisma/schema.prisma` has `ClosedRoom` model (roomName PK, psychologistId, closedAt)
- `POST /api/livekit/rooms` → deletes room from LiveKit (best-effort) + upserts ClosedRoom
- `GET /api/livekit/rooms` → lists closed rooms (diagnostics)
- `GET /api/livekit/token` → checks ClosedRoom table, returns 410 if room was closed
- After "Encerrar Sala", a fresh room name is auto-generated in the input field

### Camera preview fix (critical)
- **Problem**: preview camera worked but video call had no camera
- **Root cause**: preview stream was still active (holding camera) when LiveKitRoom tried `getUserMedia`, OR preview was stopped too early (cleanup ran before LiveKitRoom mounted)
- **Fix**: `handleConnect` explicitly stops preview stream (`streamRef.current?.getTracks().forEach(t => t.stop())`) before `setToken()`, freeing camera for LiveKit
- **Secondary fix**: preview `getUserMedia` failure no longer sets `cameraOn=false` — LiveKitRoom still requests `video={cameraOn}` (toast only)

### UX Improvements (2026-06-08 / 2026-06-09)
- **In-call**: room name badge (top-left, translucent), "Sair" button (top-right, destructive)
- **Aguardando psicólogo**: overlay with spinner when no remote participant present; tracks via `ParticipantWatcher` component using `useRemoteParticipants` hook
- **Disconnect screen**: "Conexão encerrada" with "Entrar em outra sala" button (instead of jumping to welcome)
- **Patient name**: passed to token API (`?name=...`) and shown in LiveKit participant list
- **Token API**: accepts `name` query param from patients (defaults to "Paciente")
- **TS fix (2026-06-09)**: `@livekit/components-react` v2.9.21 `onConnected` expects `() => void` (no room arg); removed `onParticipantConnected`/`onParticipantDisconnected` props (not in LiveKitRoomProps) → replaced with `ParticipantWatcher` component

### Pre-join camera preview design
- Welcome → "Continuar" → `setStep("prejoin")` → effect calls `startCamera()` via `getUserMedia`
- Direct URL (`?room=...`) → starts in prejoin, effect calls `getUserMedia` (may fail without gesture; toast shown)
- Toggle buttons enable/disable tracks on the preview stream
- "Entrar na Sala" → stops preview stream, fetches token, mounts LiveKitRoom
- Camera preview uses `videoRef` always in DOM (hidden by CSS until stream ready)

### LiveKit Cloud setup
- URL: `wss://gestao-de-psicologia-sx5sdgua.livekit.cloud`
- API Key: `APIShuBgp6j9SpS`
- Secrets set as Vercel env vars (Production only)

### Vercel deployment
- Git repo: `https://github.com/psimariojunior/psicoflow`
- Production URL: `https://psicoflow-iota.vercel.app`
- Build command: `prisma db push --accept-data-loss && next build` (vercel.json)
- `POSTGRES_PRISMA_URL` env (non-pooled) for DDL via prisma db push
- Vercel env vars: nextauth vars, LIVEKIT_API_KEY/SECRET, LIVEKIT_URL, DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, ENCRYPTION_KEY, NEXTAUTH_URL, WHATSAPP_API_TOKEN, WHATSAPP_PHONE_NUMBER_ID, RESEND_API_KEY, EMAIL_FROM
- Middleware allows unauthenticated access to `/sala-virtual/entrar`, `/api/livekit/*`, and `/api/cron/*`
- **SSO Protection**: foi desativado no projeto Vercel (impedia acesso do paciente sem login Vercel)

## Recentes (2026-06-10) — Lembretes Automáticos

### O que foi implementado
- **Email**: `sendEmail()` genérico + template HTML de lembrete de consulta em `src/lib/email.ts`; via Resend API
- **WhatsApp**: Cliente Meta Cloud API em `src/lib/whatsapp.ts`; envia template `lembrete_consulta` com nome/data/hora
- **Engine de notificações** (`src/lib/notifications.ts`):
  - `scheduleReminders()` — cria notificações PENDING para 24h e 1h antes da consulta
  - `cancelPendingReminders()` — cancela pendentes ao cancelar consulta
  - `dispatchNotification()` — envia email ou WhatsApp e marca SENT/FAILED
  - `processPendingNotifications()` — processa todos PENDING com scheduledAt <= agora
- **Cron**: `/api/cron/lembretes` (GET + POST) — público, para ser chamado por cron-job.org a cada 30min
- **Integração na agenda**:
  - `POST /api/agendamentos` → agenda reminders automaticamente na criação
  - `PUT /api/agendamentos/[id]` → agenda ao confirmar, cancela ao cancelar/deletar
  - `DELETE /api/agendamentos/[id]` → cancela pendentes
- **Botão "Enviar Lembrete"**: no diálogo de detalhes da consulta (disparo imediato)
- **`POST /api/notificacoes`**: dispara imediatamente quando `sendAt` não é informado
- **Schema Prisma**: Notification ganhou campos `scheduledAt` (DateTime?), `appointmentId` (FK para Appointment), e relação `appointment`

### Para fazer o WhatsApp funcionar
1. Criar template `lembrete_consulta` no WhatsApp Manager (Meta Business)
2. Gerar token permanente no Graph API Explorer
3. Adicionar `WHATSAPP_API_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID` nas env vars do Vercel

### Para o cron automático
1. Criar conta em https://cron-job.org
2. Criar job: `https://psicoflow-iota.vercel.app/api/cron/lembretes` a cada 30 min

### Email: migrado de SMTP Outlook para Resend (2026-06-10)
- **Problema**: Outlook SMTP aceitava conexão mas descartava emails silenciosamente (FROM não coincidia com SMTP AUTH user)
- **Solução**: Substituído `nodemailer` por `resend` (API HTTP, sem SMTP)
- `src/lib/email.ts` agora usa `new Resend(process.env.RESEND_API_KEY)`
- Env vars antigas removidas: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- Env vars novas: `RESEND_API_KEY`, `EMAIL_FROM`
- Setup: criar conta em https://resend.com, verificar domínio (ou usar `onboarding@resend.dev` para testes), gerar API key

### Setup Details
Ver `LEMBRETES_SETUP.md` na raiz do projeto.

## Relevant Files
- `src/app/(public)/sala-virtual/entrar/page.tsx` — patient flow (welcome → prejoin → call)
- `src/app/(dashboard)/sala-virtual/page.tsx` — psychologist room (link sharing, encerrar sala)
- `src/app/api/livekit/token/route.ts` — JWT generation + closed-room check
- `src/app/api/livekit/rooms/route.ts` — POST (close room) + GET (list closed)
- `src/middleware.ts` — auth bypass for patient routes
- `prisma/schema.prisma` — ClosedRoom model + PostgreSQL provider
- `next.config.js` — Vercel-compatible config
- `.env.local` — local dev vars
