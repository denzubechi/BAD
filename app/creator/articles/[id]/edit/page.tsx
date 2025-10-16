"use client"

import { AuthGuard } from "@/components/auth-guard"
import { ArticleEditor } from "@/components/article-editor"
import { use } from "react"

function EditArticleContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Edit Article</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ArticleEditor articleId={id} />
      </main>
    </div>
  )
}

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AuthGuard requireCreator>
      <EditArticleContent params={params} />
    </AuthGuard>
  )
}
