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

### UX Improvements (2026-06-08)
- **In-call**: room name badge (top-left, translucent), "Sair" button (top-right, destructive)
- **Aguardando psicólogo**: overlay with spinner when no remote participant present; checks at connect time via `onConnected` (room.remoteParticipants.size) + tracks join/leave
- **Disconnect screen**: "Conexão encerrada" with "Entrar em outra sala" button (instead of jumping to welcome)
- **Patient name**: passed to token API (`?name=...`) and shown in LiveKit participant list
- **Token API**: accepts `name` query param from patients (defaults to "Paciente")

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
- Build command: `prisma db push --accept-data-loss && next build` (definido em `vercel.json`)
- `POSTGRES_PRISMA_URL` env (non-pooled) for DDL via prisma db push
- Vercel env vars: nextauth vars, LIVEKIT_API_KEY/SECRET, LIVEKIT_URL, DATABASE_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING, ENCRYPTION_KEY, NEXTAUTH_URL
- Middleware allows unauthenticated access to `/sala-virtual/entrar` and `/api/livekit/*`
- **SSO Protection**: foi desativado no projeto Vercel (impedia acesso do paciente sem login Vercel)

## Relevant Files
- `src/app/(public)/sala-virtual/entrar/page.tsx` — patient flow (welcome → prejoin → call)
- `src/app/(dashboard)/sala-virtual/page.tsx` — psychologist room (link sharing, encerrar sala)
- `src/app/api/livekit/token/route.ts` — JWT generation + closed-room check
- `src/app/api/livekit/rooms/route.ts` — POST (close room) + GET (list closed)
- `src/middleware.ts` — auth bypass for patient routes
- `prisma/schema.prisma` — ClosedRoom model + PostgreSQL provider
- `next.config.js` — Vercel-compatible config
- `.env.local` — local dev vars
