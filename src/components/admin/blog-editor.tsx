"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Save, Plus, Trash2, Edit, Eye, EyeOff, Clock, Loader2, ArrowLeft, BookOpen, AlertTriangle } from "lucide-react"
import toast from "react-hot-toast"

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  readTime: string
  publishedAt: string
  published: boolean
  image?: string | null
}

const defaultPost = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  category: "Gestão",
  readTime: "5 min",
  published: true,
  image: "",
}

const categories = ["Gestão", "Tecnologia", "Dicas", "Legal", "Financeiro"]
const readTimes = ["3 min", "4 min", "5 min", "6 min", "7 min", "8 min", "10 min"]

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export function BlogEditor() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<BlogPost | null>(null)
  const [form, setForm] = useState(defaultPost)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [view, setView] = useState<"list" | "edit">("list")

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/blog?all=true")
      const data = await res.json()
      if (Array.isArray(data)) setPosts(data)
    } catch {
      toast.error("Erro ao carregar posts")
    } finally {
      setLoading(false)
    }
  }

  const handleNew = () => {
    setEditing(null)
    setForm({ ...defaultPost })
    setView("edit")
  }

  const handleEdit = (post: BlogPost) => {
    setEditing(post)
    setForm({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      readTime: post.readTime,
      published: post.published,
      image: post.image || "",
    })
    setView("edit")
  }

  const handleSave = async () => {
    if (!form.title || !form.excerpt || !form.content || !form.category) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }
    setSaving(true)
    try {
      const slug = form.slug || slugify(form.title)
      const body = { ...form, slug }

      if (editing) {
        const res = await fetch(`/api/blog/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          toast.error(err?.error || "Erro ao salvar")
          return
        }
        toast.success("Post atualizado!")
      } else {
        const res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        if (!res.ok) {
          const err = await res.json().catch(() => null)
          toast.error(err?.error || "Erro ao criar")
          return
        }
        toast.success("Post criado!")
      }
      setView("list")
      fetchPosts()
    } catch {
      toast.error("Erro ao salvar post")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/blog/${deleteId}`, { method: "DELETE" })
      if (!res.ok) throw new Error()
      toast.success("Post removido!")
      setDeleteId(null)
      fetchPosts()
    } catch {
      toast.error("Erro ao remover post")
    } finally {
      setDeleting(false)
    }
  }

  const handleAutoSlug = () => {
    if (form.title && !editing) {
      setForm({ ...form, slug: slugify(form.title) })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 animate-shimmer rounded-xl" />
        ))}
      </div>
    )
  }

  if (view === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setView("list")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Button>
          <h3 className="text-lg font-semibold">{editing ? "Editar Post" : "Novo Post"}</h3>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Título *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  onBlur={handleAutoSlug}
                  placeholder="Título do artigo"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="slug-do-artigo"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">Gerado automaticamente se vazio</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resumo *</Label>
              <Textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Breve descrição do artigo"
              />
            </div>

            <div className="space-y-2">
              <Label>Conteúdo HTML *</Label>
              <Textarea
                rows={16}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="<p>Conteúdo do artigo em HTML...</p>"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Use tags HTML: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, etc.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tempo de leitura</Label>
                <Select value={form.readTime} onValueChange={(v) => setForm({ ...form, readTime: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {readTimes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Imagem (URL)</Label>
                <Input
                  value={form.image || ""}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.published}
                onCheckedChange={(v) => setForm({ ...form, published: v })}
              />
              <Label>{form.published ? "Publicado" : "Rascunho"}</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {editing ? "Salvar Alterações" : "Criar Post"}
          </Button>
          <Button variant="outline" onClick={() => setView("list")}>Cancelar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-teal-500" />
            Posts do Blog ({posts.length})
          </h3>
          <p className="text-sm text-muted-foreground">Crie e gerencie artigos do seu blog</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" /> Novo Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum post criado ainda</p>
            <Button onClick={handleNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Criar primeiro post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold truncate">{post.title}</h4>
                      {post.published ? (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 shrink-0">
                          <Eye className="mr-1 h-3 w-3" /> Publicado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-950/30 shrink-0">
                          <EyeOff className="mr-1 h-3 w-3" /> Rascunho
                        </Badge>
                      )}
                      <Badge variant="secondary" className="shrink-0">{post.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                      <span>•</span>
                      <span>{new Date(post.publishedAt).toLocaleDateString("pt-BR")}</span>
                      <span>•</span>
                      <span className="font-mono text-xs">{post.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(post.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
