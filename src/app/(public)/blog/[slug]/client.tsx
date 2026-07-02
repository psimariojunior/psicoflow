"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import DOMPurify from "dompurify"

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  readTime: string
  publishedAt: string
}

export default function BlogPostClient({ slug }: { slug: string }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((p: BlogPost) => p.slug === slug)
          setPost(found || null)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">Post não encontrado</p>
          <Link href="/blog" className="text-primary hover:underline">
            Voltar ao Blog
          </Link>
        </div>
      </div>
    )
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: {
      "@type": "Person",
      name: "PsiHumanis",
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-teal-50/30 dark:to-teal-950/10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Blog
        </Link>

        <article className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">{post.category}</Badge>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(post.publishedAt).toLocaleDateString("pt-BR")}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{post.title}</h1>
          </div>

          <div className="prose prose-teal dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, { ALLOWED_TAGS: ["p", "br", "strong", "em", "h1", "h2", "h3", "h4", "ul", "ol", "li", "a", "blockquote", "code", "pre", "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "hr", "span", "div"], ALLOWED_ATTR: ["href", "src", "alt", "title", "className", "target", "rel"] }) }} />

          <div className="border-t pt-6 mt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Gostou? Compartilhe com outros psicólogos.</p>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Share2 className="mr-2 h-4 w-4" /> Copiar Link
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
