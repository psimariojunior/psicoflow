import { google } from "googleapis"
import { randomUUID } from "crypto"
import { prisma } from "./prisma"
import { logger } from "./logger"

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

const nonceStore = new Map<string, string>()
const NONCE_TTL = 10 * 60_000

function cleanupNonces() {
  const now = Date.now()
  nonceStore.forEach((timestamp, key) => {
    if (now - Number(timestamp) > NONCE_TTL) nonceStore.delete(key)
  })
}

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/integrations/google-calendar/callback`

  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar OAuth credentials not configured")
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export function getAuthUrl(psychologistId: string): string {
  const oauth2Client = getOAuth2Client()
  const nonce = randomUUID()
  nonceStore.set(nonce, String(Date.now()))
  cleanupNonces()
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state: JSON.stringify({ id: psychologistId, nonce }),
    prompt: "consent",
  })
}

export function verifyOAuthState(state: string): { id: string; valid: boolean } {
  try {
    const parsed = JSON.parse(state)
    const stored = nonceStore.get(parsed.nonce)
    if (!stored) return { id: parsed.id, valid: false }
    nonceStore.delete(parsed.nonce)
    return { id: parsed.id, valid: true }
  } catch {
    return { id: state, valid: false }
  }
}

export async function getCalendarClient(refreshToken: string) {
  const oauth2Client = getOAuth2Client()
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  return google.calendar({ version: "v3", auth: oauth2Client as Parameters<typeof google.calendar>[0]["auth"] })
}

export async function createCalendarEvent(
  refreshToken: string,
  calendarId: string,
  event: {
    summary: string
    description?: string
    startTime: string
    endTime: string
    patientName?: string
    patientEmail?: string
    isOnline?: boolean
  }
): Promise<string> {
  const calendar = await getCalendarClient(refreshToken)

  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: { dateTime: event.startTime, timeZone: "America/Sao_Paulo" },
      end: { dateTime: event.endTime, timeZone: "America/Sao_Paulo" },
      ...(event.isOnline
        ? {
            conferenceData: {
              createRequest: { requestId: crypto.randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } },
            },
          }
        : {}),
      ...(event.patientName
        ? {
            attendees: event.patientEmail
              ? [{ email: event.patientEmail, displayName: event.patientName }]
              : undefined,
          }
        : {}),
    },
    conferenceDataVersion: event.isOnline ? 1 : undefined,
  })

  return response.data.id!
}

export async function updateCalendarEvent(
  refreshToken: string,
  calendarId: string,
  eventId: string,
  event: {
    summary?: string
    description?: string
    startTime?: string
    endTime?: string
    patientName?: string
    patientEmail?: string
    isOnline?: boolean
  }
): Promise<void> {
  const calendar = await getCalendarClient(refreshToken)

  await calendar.events.update({
    calendarId,
    eventId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      ...(event.startTime ? { start: { dateTime: event.startTime, timeZone: "America/Sao_Paulo" } } : {}),
      ...(event.endTime ? { end: { dateTime: event.endTime, timeZone: "America/Sao_Paulo" } } : {}),
      ...(event.patientName && event.patientEmail
        ? { attendees: [{ email: event.patientEmail, displayName: event.patientName }] }
        : {}),
    },
  })
}

export async function deleteCalendarEvent(
  refreshToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const calendar = await getCalendarClient(refreshToken)
  await calendar.events.delete({ calendarId, eventId })
}

export async function syncAppointmentToCalendar(
  psychologistId: string,
  appointment: { id: string; title: string | null; startTime: Date; endTime: Date; status: string; modality: string | null; notes: string | null; googleEventId: string | null; patient: { id: string; name: string; email: string | null } }
): Promise<string | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: psychologistId },
      select: { googleRefreshToken: true, googleCalendarId: true },
    })
    if (!user?.googleRefreshToken || !user?.googleCalendarId) return null

    if (appointment.status === "CANCELLED") {
      if (appointment.googleEventId) {
        await deleteCalendarEvent(user.googleRefreshToken, user.googleCalendarId, appointment.googleEventId).catch(() => {})
      }
      return null
    }

    const eventData = {
      summary: `${appointment.title || "Sessão"} - ${appointment.patient.name}`,
      description: `Paciente: ${appointment.patient.name}\nStatus: ${appointment.status}\nObservações: ${appointment.notes || "—"}`,
      startTime: appointment.startTime.toISOString(),
      endTime: appointment.endTime.toISOString(),
      patientName: appointment.patient.name,
      patientEmail: appointment.patient.email || undefined,
      isOnline: appointment.modality === "online",
    }

    if (appointment.googleEventId) {
      await updateCalendarEvent(user.googleRefreshToken, user.googleCalendarId, appointment.googleEventId, eventData)
      return appointment.googleEventId
    }

    const eventId = await createCalendarEvent(user.googleRefreshToken, user.googleCalendarId, eventData)
    return eventId
  } catch (e) {
    logger.error("syncAppointmentToCalendar failed", { error: String(e) })
    return null
  }
}
