import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Only allow if there are no ADMIN users yet
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    if (adminCount > 0) {
      return NextResponse.json({ error: "Admin already exists" }, { status: 403 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "ADMIN" },
    })

    return NextResponse.json({ message: "You have been promoted to ADMIN" })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Setup failed" }, { status: 500 })
  }
}
