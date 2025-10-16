"use client"

import { AuthGuard } from "@/components/auth-guard"
import { SubscriberList } from "@/components/subscriber-list"

function SubscribersContent() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">My Subscribers</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <SubscriberList />
      </main>
    </div>
  )
}

export default function SubscribersPage() {
  return (
    <AuthGuard requireCreator>
      <SubscribersContent />
    </AuthGuard>
  )
}
