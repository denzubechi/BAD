"use client"

import { AuthGuard } from "@/components/auth-guard"
import { ArticleList } from "@/components/article-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

function ArticlesContent() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Articles</h1>
          <Button asChild>
            <Link href="/creator/articles/new">
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <ArticleList />
      </main>
    </div>
  )
}

export default function ArticlesPage() {
  return (
    <AuthGuard requireCreator>
      <ArticlesContent />
    </AuthGuard>
  )
}
