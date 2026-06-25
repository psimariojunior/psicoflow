import webPush from "web-push"

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY

function getOrGenerateKeys() {
  if (publicKey && privateKey) {
    webPush.setVapidDetails(
      "mailto:psi_mariojunior@hotmail.com",
      publicKey,
      privateKey
    )
    return { publicKey, privateKey }
  }
  return null
}

export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null
}

export function sendPushNotification(
  subscription: webPush.PushSubscription,
  payload: { title: string; body: string; url?: string; tag?: string }
): Promise<webPush.SendResult> {
  const keys = getOrGenerateKeys()
  if (!keys) return Promise.reject(new Error("VAPID keys not configured"))
  return webPush.sendNotification(
    subscription,
    JSON.stringify(payload),
    { TTL: 86400 }
  )
}

export function sendPushToSubscriptions(
  subscriptions: { endpoint: string; keys: { p256dh: string; auth: string } }[],
  payload: { title: string; body: string; url?: string; tag?: string }
): Promise<{ sent: number; failed: number }> {
  let sent = 0
  let failed = 0
  return Promise.all(
    subscriptions.map(async (sub) => {
      try {
        const subscription: webPush.PushSubscription = {
          endpoint: sub.endpoint,
          keys: sub.keys,
        }
        await sendPushNotification(subscription, payload)
        sent++
      } catch {
        failed++
      }
    })
  ).then(() => ({ sent, failed }))
}
