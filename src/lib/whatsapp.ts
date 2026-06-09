import { logger } from "./logger"

const WHATSAPP_API_BASE = "https://graph.facebook.com/v18.0"

interface WhatsAppConfig {
  phoneNumberId: string
  token: string
}

function getConfig(): WhatsAppConfig | null {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_API_TOKEN
  if (!phoneNumberId || !token) {
    logger.warn("WhatsApp not configured. Missing WHATSAPP_PHONE_NUMBER_ID or WHATSAPP_API_TOKEN.")
    return null
  }
  return { phoneNumberId, token }
}

export async function sendWhatsAppMessage(
  to: string,
  templateName: string,
  bodyParams: string[]
): Promise<boolean> {
  const config = getConfig()
  if (!config) return false

  const formattedTo = to.replace(/\D/g, "")
  if (formattedTo.length < 10) {
    logger.warn("Invalid WhatsApp number", { to })
    return false
  }

  try {
    const res = await fetch(
      `${WHATSAPP_API_BASE}/${config.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedTo,
          type: "template",
          template: {
            name: templateName,
            language: { code: "en" },
            components: [{
              type: "body",
              parameters: bodyParams.map((p) => ({ type: "text", text: p })),
            }],
          },
        }),
      }
    )

    const body = await res.json()
    if (!res.ok) {
      logger.error("WhatsApp API error", { to, templateName, status: res.status, error: body })
      return false
    }

    logger.info("WhatsApp message sent", { to, templateName, messageId: body.messages?.[0]?.id })
    return true
  } catch (err) {
    logger.error("Failed to send WhatsApp message", { to, templateName, error: String(err) })
    return false
  }
}

export async function sendAppointmentReminderWhatsApp(
  phone: string,
  patientName: string,
  date: string,
  time: string
): Promise<boolean> {
  return sendWhatsAppMessage(phone, "lembrete_consulta", [patientName, date, time])
}
