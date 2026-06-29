import { prisma } from "./prisma"

export async function checkPlanAccess(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true, subscriptionStatus: true },
  })

  if (!user) return { allowed: false, reason: "Usuário não encontrado" }
  if (user.plan === "pro" || user.plan === "clinica") return { allowed: true }
  if (user.plan === "trial" && user.planExpiresAt && new Date(user.planExpiresAt) > new Date()) {
    return { allowed: true }
  }
  if (user.plan === "trial" && user.planExpiresAt && new Date(user.planExpiresAt) <= new Date()) {
    return { allowed: false, reason: "Trial expirado" }
  }
  // free plan with no expiry - allow basic access
  return { allowed: true }
}

export async function requireClinicPlan(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, planExpiresAt: true, subscriptionStatus: true },
  })

  if (!user) return { allowed: false, reason: "Usuário não encontrado" }

  if (user.plan === "clinica") return { allowed: true }

  if (user.plan === "trial" && user.planExpiresAt && new Date(user.planExpiresAt) > new Date()) {
    return { allowed: true, reason: "trial" }
  }

  return {
    allowed: false,
    reason: user.plan === "pro"
      ? "Funcionalidades de clínica requerem o plano Clínica. Atualize seu plano em Configurações."
      : user.plan === "trial" && user.planExpiresAt && new Date(user.planExpiresAt) <= new Date()
        ? "Trial expirado. Assine o plano Clínica para acessar recursos de clínica."
        : "Funcionalidades de clínica requerem o plano Clínica. Acesse /pricing para assinar."
  }
}
