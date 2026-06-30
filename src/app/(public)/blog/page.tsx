"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Calendar, Clock, ArrowRight, BookOpen, Sparkles, Tag, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BreadcrumbJsonLd } from "@/lib/seo"

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  publishedAt: string
}

const categoryColors: Record<string, string> = {
  "Gestão": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Tecnologia": "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "Dicas": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "Legal": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "Financeiro": "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPosts(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => Array.from(new Set(posts.map((p) => p.category))), [posts])

  const filteredPosts = useMemo(() => {
    if (!activeCategory) return posts
    return posts.filter((p) => p.category === activeCategory)
  }, [activeCategory, posts])

  const featured = filteredPosts[0]
  const rest = filteredPosts.slice(1)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-teal-50/20 to-background dark:via-teal-950/10">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Link>
          <div className="text-center mb-12 space-y-4">
            <div className="h-6 w-20 mx-auto animate-shimmer rounded-full" />
            <div className="h-10 w-72 mx-auto animate-shimmer rounded-lg" />
            <div className="h-5 w-96 mx-auto animate-shimmer rounded-lg" />
          </div>
          <div className="flex justify-center gap-2 mb-10">
            {[...Array(5)].map((_, i) => <div key={i} className="h-9 w-24 animate-shimmer rounded-full" />)}
          </div>
          <div className="h-64 animate-shimmer rounded-3xl mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="h-48 animate-shimmer rounded-2xl" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-teal-50/20 to-background dark:via-teal-950/10">
      <BreadcrumbJsonLd items={[
        { name: "Início", item: "/" },
        { name: "Blog", item: "/blog" },
      ]} />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Início
        </Link>

        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <Badge variant="secondary" className="bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 px-4 py-1.5">
            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
            Blog
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-teal-800 to-slate-700 dark:from-white dark:via-teal-200 dark:to-slate-400 bg-clip-text text-transparent">
            Dicas para sua prática
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-7">
            Artigos sobre gestão de consultório, tecnologia, clínica e boas práticas em psicologia.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              !activeCategory
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Sparkles className="mr-1.5 h-3.5 w-3.5 inline" />
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Tag className="mr-1.5 h-3.5 w-3.5 inline" />
              {cat}
            </button>
          ))}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Nenhum artigo encontrado nesta categoria.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured Article */}
            {featured && (
              <Link href={`/blog/${featured.slug}`} className="group block">
                <article className="relative overflow-hidden rounded-[1.75rem] border bg-gradient-to-br from-teal-50/80 to-background dark:from-teal-950/20 dark:to-background p-6 md:p-8 transition-all hover:shadow-xl hover:shadow-teal-500/5 hover:-translate-y-0.5">
                  <div className="absolute top-0 right-0 w-72 h-72 bg-teal-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                  <div className="relative grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-medium", categoryColors[featured.category] || "bg-muted text-muted-foreground")}>
                          {featured.category}
                        </span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featured.readTime}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(featured.publishedAt).toLocaleDateString("pt-BR")}</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight group-hover:text-primary transition-colors">
                        {featured.title}
                      </h2>
                      <p className="text-muted-foreground leading-6 line-clamp-2">
                        {featured.excerpt}
                      </p>
                      <span className="inline-flex items-center text-sm font-medium text-primary group-hover:underline">
                        Ler artigo completo <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                    <div className="hidden md:flex items-center justify-center">
                      <div className="w-full max-w-[200px] aspect-square rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-600/10 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-teal-500/30" />
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            )}

            {/* Remaining Articles */}
            {rest.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                    <article className="h-full bg-card rounded-2xl border shadow-sm hover:shadow-xl hover:shadow-teal-500/5 transition-all duration-300 overflow-hidden hover:-translate-y-0.5">
                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium", categoryColors[post.category] || "bg-muted text-muted-foreground")}>
                            {post.category}
                          </span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(post.publishedAt).toLocaleDateString("pt-BR")}</span>
                        </div>
                        <h2 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <span className="inline-flex items-center text-xs font-medium text-primary group-hover:underline pt-1">
                          Ler mais <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                        </span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
