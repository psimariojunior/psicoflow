import { blogPosts, getBlogPost } from "@/lib/blog-data"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, BookOpen, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug)
  if (!post) return { title: "Post não encontrado" }
  return {
    title: `${post.title} | PsicoFlow Blog`,
    description: post.excerpt,
    openGraph: { title: post.title, description: post.excerpt },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug)
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-blue-50/30 dark:to-blue-950/10">
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

          <div className="prose prose-blue dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div className="border-t pt-6 mt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Gostou? Compartilhe com outros psicólogos.
              </p>
              <Button variant="outline" size="sm" onClick={() => {
                navigator.clipboard.writeText(window.location.href)
              }}>
                <Share2 className="mr-2 h-4 w-4" /> Copiar Link
              </Button>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}
