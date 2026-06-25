import { prisma } from "@/lib/prisma"
import type { Metadata } from "next"
import BlogPostClient from "./client"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug },
      select: { title: true, excerpt: true, slug: true, publishedAt: true },
    })
    if (!post) return { title: "Post não encontrado" }

    const baseUrl = "https://psihumanis.vercel.app"

    return {
      title: post.title,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        type: "article",
        publishedTime: post.publishedAt.toISOString(),
        url: `${baseUrl}/blog/${post.slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
      },
      alternates: {
        canonical: `${baseUrl}/blog/${post.slug}`,
      },
    }
  } catch {
    return { title: "Post não encontrado" }
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return <BlogPostClient slug={params.slug} />
}
