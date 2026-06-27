import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email) return NextResponse.json({ done: false })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { name: true, crp: true },
  })

  const done = !!(user?.name && user?.crp)
  return NextResponse.json({ done })
}
