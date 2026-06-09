import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()

    const attachment = await prisma.attachment.create({
      data: {
        name: data.name,
        type: data.type,
        url: data.url,
        size: data.size || null,
        patientId: data.patientId || null,
        recordId: data.recordId || null,
      },
    })

    return NextResponse.json(attachment, { status: 201 })
  } catch (error) {
    console.error("Error uploading attachment:", error)
    return NextResponse.json(
      { error: "Erro ao fazer upload" },
      { status: 500 }
    )
  }
}
