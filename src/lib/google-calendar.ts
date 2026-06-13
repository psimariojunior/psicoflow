import { google } from "googleapis"

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/integrations/google-calendar`

  if (!clientId || !clientSecret) {
    throw new Error("Google Calendar OAuth credentials not configured")
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export function getAuthUrl(psychologistId: string): string {
  const oauth2Client = getOAuth2Client()
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state: psychologistId,
    prompt: "consent",
  })
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
