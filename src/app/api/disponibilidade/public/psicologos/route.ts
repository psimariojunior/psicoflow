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
    return NextResponse.json(psychologists)
  } catch {
    return NextResponse.json({ error: "Failed to fetch psychologists" }, { status: 500 })
  }
}
