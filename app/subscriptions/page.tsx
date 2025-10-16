"use client"

import { AuthGuard } from "@/components/auth-guard"
import { SubscriptionList } from "@/components/subscription-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function SubscriptionsContent() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Subscriptions</h1>
          <Button asChild variant="outline">
            <Link href="/explore">Discover Creators</Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <SubscriptionList />
      </main>
    </div>
  )
}

export default function SubscriptionsPage() {
  return (
    <AuthGuard>
      <SubscriptionsContent />
    </AuthGuard>
  )
}
