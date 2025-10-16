"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Send, CheckCircle2, AlertCircle } from "lucide-react"

interface ArticleEditorProps {
  articleId?: string
}

export function ArticleEditor({ articleId }: ArticleEditorProps) {
  const router = useRouter()
  const { userId } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info")

  // Form state
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [isPremium, setIsPremium] = useState(false)
  const [articleStatus, setArticleStatus] = useState("DRAFT")

  useEffect(() => {
    if (articleId) {
      loadArticle()
    }
  }, [articleId])

  useEffect(() => {
    // Auto-generate slug from title
    if (!articleId && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      setSlug(generatedSlug)
    }
  }, [title, articleId])

  const loadArticle = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/articles/${articleId}`)
      if (response.ok) {
        const data = await response.json()
        setTitle(data.article.title)
        setSlug(data.article.slug)
        setExcerpt(data.article.excerpt || "")
        setContent(data.article.content)
        setCoverImage(data.article.coverImage || "")
        setIsPremium(data.article.isPremium)
        setArticleStatus(data.article.status)
      }
    } catch (error) {
      console.error("[v0] Error loading article:", error)
      setStatus("Failed to load article")
      setStatusType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const saveArticle = async (publish = false) => {
    if (!title || !content) {
      setStatus("Title and content are required")
      setStatusType("error")
      return
    }

    setIsSaving(true)
    setStatus(publish ? "Publishing article..." : "Saving article...")
    setStatusType("info")

    try {
      const url = articleId ? `/api/articles/${articleId}` : "/api/articles"
      const method = articleId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorId: userId,
          title,
          slug,
          excerpt: excerpt || null,
          content,
          coverImage: coverImage || null,
          isPremium,
          status: publish ? "PUBLISHED" : articleStatus,
          publishedAt: publish ? new Date().toISOString() : null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setStatus(publish ? "Article published successfully!" : "Article saved successfully!")
        setStatusType("success")
        setTimeout(() => {
          router.push("/creator/articles")
        }, 1500)
      } else {
        const error = await response.json()
        setStatus(error.error || "Failed to save article")
        setStatusType("error")
      }
    } catch (error) {
      console.error("[v0] Error saving article:", error)
      setStatus("Failed to save article")
      setStatusType("error")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {status && (
        <Alert variant={statusType === "error" ? "destructive" : "default"}>
          {statusType === "success" && <CheckCircle2 className="h-4 w-4" />}
          {statusType === "error" && <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
          <CardDescription>Fill in the details for your article</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter article title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              placeholder="article-url-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              placeholder="Brief description of your article"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL</Label>
            <Input
              id="coverImage"
              placeholder="https://example.com/image.jpg"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Write your article content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="font-mono text-sm"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label htmlFor="premium">Premium Content</Label>
              <p className="text-sm text-muted-foreground">Require subscription to view this article</p>
            </div>
            <Switch id="premium" checked={isPremium} onCheckedChange={setIsPremium} />
          </div>

          {articleId && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={articleStatus} onValueChange={setArticleStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => router.push("/creator/articles")} disabled={isSaving}>
          Cancel
        </Button>
        <Button variant="outline" onClick={() => saveArticle(false)} disabled={isSaving}>
          {isSaving ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </>
          )}
        </Button>
        <Button onClick={() => saveArticle(true)} disabled={isSaving}>
          {isSaving ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Publish
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
