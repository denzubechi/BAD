"use client"

import { AuthGuard } from "@/components/auth-guard"
import { BecomeCreatorForm } from "@/components/become-creator-form"

function BecomeCreatorContent() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Become a Creator</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <BecomeCreatorForm />
      </main>
    </div>
  )
}

export default function BecomeCreatorPage() {
  return (
    <AuthGuard>
      <BecomeCreatorContent />
    </AuthGuard>
  )
}
