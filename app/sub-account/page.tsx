"use client"

import { AuthGuard } from "@/components/auth-guard"
import { SubAccountManager } from "@/components/sub-account-manager"

function SubAccountContent() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Sub-Account Management</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <SubAccountManager />
      </main>
    </div>
  )
}

export default function SubAccountPage() {
  return (
    <AuthGuard>
      <SubAccountContent />
    </AuthGuard>
  )
}
