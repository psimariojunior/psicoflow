import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Only allow if there are no ADMIN users yet
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } })
    if (adminCount > 0) {
      return NextResponse.json({ error: "Admin already exists" }, { status: 403 })
    }

    // Find the owner account and promote to ADMIN
    const user = await prisma.user.findFirst({
      where: { email: "psi_mariojunior@hotmail.com" },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    })

    return NextResponse.json({ message: "User promoted to ADMIN", userId: user.id })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Setup failed" }, { status: 500 })
  }
}
