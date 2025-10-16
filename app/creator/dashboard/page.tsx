"use client"

import { AuthGuard } from "@/components/auth-guard"
import { CreatorStats } from "@/components/creator-stats"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, FileText, Users, Settings } from "lucide-react"

function CreatorDashboardContent() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Creator Dashboard</h1>
          <Button asChild>
            <Link href="/creator/articles/new">
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <CreatorStats />

          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/creator/articles"
              className="p-6 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
            >
              <FileText className="w-8 h-8 mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Manage Articles</h3>
              <p className="text-sm text-muted-foreground">Create, edit, and publish your content</p>
            </Link>

            <Link
              href="/creator/subscribers"
              className="p-6 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
            >
              <Users className="w-8 h-8 mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Subscribers</h3>
              <p className="text-sm text-muted-foreground">View and manage your subscriber base</p>
            </Link>

            <Link
              href="/creator/settings"
              className="p-6 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
            >
              <Settings className="w-8 h-8 mb-3 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Settings</h3>
              <p className="text-sm text-muted-foreground">Update your creator profile and pricing</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CreatorDashboardPage() {
  return (
    <AuthGuard requireCreator>
      <CreatorDashboardContent />
    </AuthGuard>
  )
}
