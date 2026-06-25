import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const psychologists = await prisma.user.findMany({
      where: { role: { in: ["PSYCHOLOGIST", "ADMIN"] }, active: true },
      select: {
        id: true,
        name: true,
        specialty: true,
        bio: true,
        avatarUrl: true,
        publicName: true,
        publicBio: true,
        sessionPrice: true,
        welcomeMessage: true,
        clinicAddress: true,
      },
    })
    const result = psychologists.map((p) => ({
      ...p,
      avatarUrl: p.avatarUrl?.startsWith("data:image")
        ? `/api/avatar?psychologistId=${p.id}`
        : p.avatarUrl,
    }))
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: "Failed to fetch psychologists" }, { status: 500 })
  }
}
