export type Plan = "free" | "trial" | "pro" | "clinica"

export const PLAN_FEATURES: Record<Plan, { maxPatients: number; maxAppointments: number; videoCall: boolean; ai: boolean; reports: boolean }> = {
  free: { maxPatients: 5, maxAppointments: 20, videoCall: false, ai: false, reports: false },
  trial: { maxPatients: 50, maxAppointments: 100, videoCall: true, ai: true, reports: true },
  pro: { maxPatients: 200, maxAppointments: -1, videoCall: true, ai: true, reports: true },
  clinica: { maxPatients: -1, maxAppointments: -1, videoCall: true, ai: true, reports: true },
}

export const PLAN_PRICES: Record<Plan, { amount: number; label: string }> = {
  free: { amount: 0, label: "Grátis" },
  trial: { amount: 0, label: "Trial (14 dias)" },
  pro: { amount: 9700, label: "R$ 97/mês" },
  clinica: { amount: 19700, label: "R$ 197/mês" },
}

export function canAccess(userPlan: Plan, feature: keyof (typeof PLAN_FEATURES)[Plan]): boolean {
  const val = PLAN_FEATURES[userPlan]?.[feature]
  return val === true || val === -1
}

export function isPlanActive(userPlan: Plan, planExpiresAt: Date | null | undefined): boolean {
  if (userPlan === "free") return true
  if (userPlan === "trial" && planExpiresAt && new Date(planExpiresAt) < new Date()) return false
  return true
}
