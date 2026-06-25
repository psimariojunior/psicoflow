import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const showAll = request.nextUrl.searchParams.get("all") === "true" && session

    const where = showAll ? {} : { published: true }
    const posts = await prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
    })
    return NextResponse.json(posts)
  } catch {
    return NextResponse.json({ error: "Erro ao buscar posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    const body = await request.json()
    const { slug, title, excerpt, content, category, readTime, published, image } = body

    if (!slug || !title || !excerpt || !content || !category) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    const existing = await prisma.blogPost.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: "Slug já existe" }, { status: 409 })
    }

    const post = await prisma.blogPost.create({
      data: {
        slug,
        title,
        excerpt,
        content,
        category,
        readTime: readTime || "5 min",
        published: published ?? true,
        image: image || null,
        publishedAt: new Date(),
      },
    })
    return NextResponse.json(post, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erro ao criar post" }, { status: 500 })
  }
}
