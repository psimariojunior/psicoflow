export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return
  const w = window as unknown as { gtag?: (...args: unknown[]) => void }
  if (w.gtag) {
    w.gtag("event", name, params)
  }
}

export function trackConversion(step: string) {
  trackEvent("conversion_step", { step })
}

export function trackRegister(method: string = "email") {
  trackEvent("sign_up", { method })
  trackConversion("register")
}

export function trackLogin(method: string = "email") {
  trackEvent("login", { method })
  trackConversion("login")
}

export function trackCheckout(plan: string) {
  trackEvent("begin_checkout", { currency: "BRL", value: plan === "pro" ? 97 : 197, items: [{ item_name: plan }] })
  trackConversion("checkout")
}

export function trackPurchase(plan: string, value: number) {
  trackEvent("purchase", { currency: "BRL", value, transaction_id: plan })
  trackConversion("purchase")
}

export function trackTrialStart() {
  trackEvent("trial_start", { trial_type: "14_days" })
  trackConversion("trial_start")
}

export function trackFeatureUsed(feature: string) {
  trackEvent("feature_used", { feature })
}

export function trackPageView(page: string) {
  trackEvent("page_view", { page_path: page })
}
