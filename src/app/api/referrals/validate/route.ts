import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code")?.trim().toUpperCase()
    if (!code || code.length < 4) {
      return NextResponse.json({ valid: false })
    }

    const user = await prisma.user.findUnique({
      where: { referralCode: code },
      select: { id: true, name: true },
    })

    return NextResponse.json({
      valid: !!user,
      referrerName: user?.name?.split(" ")[0] || null,
    })
  } catch {
    return NextResponse.json({ valid: false })
  }
}
