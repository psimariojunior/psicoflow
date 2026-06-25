import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { randomBytes } from "crypto"

export const dynamic = "force-dynamic"

function generateReferralCode(name: string): string {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
  const random = randomBytes(3).toString("hex").toUpperCase()
  return `${initials}-${random}`
}

async function generateUniqueReferralCode(name: string): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = generateReferralCode(name)
    const existing = await prisma.user.findUnique({ where: { referralCode: code }, select: { id: true } })
    if (!existing) return code
  }
  return `PSI-${randomBytes(4).toString("hex").toUpperCase()}`
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    if (!userId) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, id: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    let code = user.referralCode
    if (!code) {
      code = await generateUniqueReferralCode(user.name || "PSI")
      await prisma.user.update({ where: { id: userId }, data: { referralCode: code } })
    }

    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: {
        referred: {
          select: { id: true, name: true, email: true, plan: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    return NextResponse.json({
      code,
      inviteLink: `${appUrl}/register?ref=${code}`,
      referrals: referrals.map((r) => ({
        id: r.id,
        name: r.referred.name,
        email: r.referred.email,
        plan: r.referred.plan,
        rewardGranted: r.rewardGranted,
        createdAt: r.createdAt,
      })),
      totalReferrals: referrals.length,
      totalRewards: referrals.filter((r) => r.rewardGranted).length,
    })
  } catch (error) {
    console.error("[referrals] GET error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
