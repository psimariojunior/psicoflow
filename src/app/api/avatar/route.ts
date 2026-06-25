import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("psychologistId")
    if (!id) return NextResponse.json({ error: "psychologistId é obrigatório" }, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { id },
      select: { avatarUrl: true },
    })

    if (!user?.avatarUrl || !user.avatarUrl.startsWith("data:image")) {
      return NextResponse.json({ error: "Avatar não encontrado" }, { status: 404 })
    }

    const base64Data = user.avatarUrl.split(",")[1]
    const mimeType = user.avatarUrl.split(";")[0].split(":")[1] || "image/jpeg"
    const buffer = Buffer.from(base64Data, "base64")

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
