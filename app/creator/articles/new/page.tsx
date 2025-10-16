"use client"

import { AuthGuard } from "@/components/auth-guard"
import { ArticleEditor } from "@/components/article-editor"

function NewArticleContent() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Create New Article</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ArticleEditor />
      </main>
    </div>
  )
}

export default function NewArticlePage() {
  return (
    <AuthGuard requireCreator>
      <NewArticleContent />
    </AuthGuard>
  )
}
