import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { blogPosts } from "@/lib/blog-data"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const secret = request.nextUrl.searchParams.get("secret")
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updateExisting = request.nextUrl.searchParams.get("update") === "true"
    let created = 0
    let updated = 0

    for (const post of blogPosts) {
      const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } })
      if (existing) {
        if (updateExisting) {
          await prisma.blogPost.update({
            where: { slug: post.slug },
            data: {
              title: post.title,
              excerpt: post.excerpt,
              content: post.content,
              category: post.category,
              readTime: post.readTime,
            },
          })
          updated++
        }
      } else {
        await prisma.blogPost.create({
          data: {
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            category: post.category,
            readTime: post.readTime,
            publishedAt: new Date(post.publishedAt),
            published: true,
          },
        })
        created++
      }
    }

    return NextResponse.json({ ok: true, created, updated, total: blogPosts.length, ts: Date.now() })
  } catch (error) {
    console.error("[seed-blog] Error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
