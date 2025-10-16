"use client"

import { AuthGuard } from "@/components/auth-guard"
import { SpendPermissionManager } from "@/components/spend-permission-manager"

function PermissionsContent() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Spend Permissions</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <SpendPermissionManager />
      </main>
    </div>
  )
}

export default function PermissionsPage() {
  return (
    <AuthGuard>
      <PermissionsContent />
    </AuthGuard>
  )
}
