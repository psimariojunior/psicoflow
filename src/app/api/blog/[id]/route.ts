import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.blogPost.findUnique({ where: { id: params.id } })
    if (!post) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })
    return NextResponse.json(post)
  } catch {
    return NextResponse.json({ error: "Erro ao buscar post" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const body = await request.json()
    const { slug, title, excerpt, content, category, readTime, published, image } = body

    const existing = await prisma.blogPost.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })

    if (slug && slug !== existing.slug) {
      const slugTaken = await prisma.blogPost.findUnique({ where: { slug } })
      if (slugTaken) return NextResponse.json({ error: "Slug já existe" }, { status: 409 })
    }

    const post = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        ...(slug && { slug }),
        ...(title && { title }),
        ...(excerpt && { excerpt }),
        ...(content && { content }),
        ...(category && { category }),
        ...(readTime && { readTime }),
        ...(typeof published === "boolean" && { published }),
        ...(image !== undefined && { image: image || null }),
      },
    })
    return NextResponse.json(post)
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar post" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const existing = await prisma.blogPost.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: "Post não encontrado" }, { status: 404 })

    await prisma.blogPost.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro ao deletar post" }, { status: 500 })
  }
}
