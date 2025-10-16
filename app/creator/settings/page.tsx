"use client"

import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DollarSign, User, Bell } from "lucide-react"
import { useState } from "react"

function CreatorSettingsContent() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Creator Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Creator Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Creator Profile
              </CardTitle>
              <CardDescription>Manage your public creator profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input id="display-name" placeholder="Your creator name" disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell your audience about your content..."
                  rows={4}
                  disabled={!isEditing}
                  className="resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar-url">Avatar URL</Label>
                <Input id="avatar-url" placeholder="https://..." disabled={!isEditing} />
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Subscription Pricing
              </CardTitle>
              <CardDescription>Set your monthly subscription price</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Monthly Price (ETH)</Label>
                <Input id="price" type="number" step="0.001" placeholder="0.05" />
                <p className="text-sm text-muted-foreground">
                  This is the amount subscribers will pay monthly to access your premium content
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Current Pricing</p>
                <p className="text-2xl font-bold">0.05 ETH/month</p>
                <p className="text-sm text-muted-foreground mt-1">≈ $150 USD (estimated)</p>
              </div>

              <Button>Update Pricing</Button>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Creator Notifications
              </CardTitle>
              <CardDescription>Manage notifications for your creator account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Subscribers</p>
                  <p className="text-sm text-muted-foreground">Get notified when someone subscribes</p>
                </div>
                <Button variant="outline" size="sm">
                  On
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Subscription Renewals</p>
                  <p className="text-sm text-muted-foreground">Updates about subscription renewals</p>
                </div>
                <Button variant="outline" size="sm">
                  On
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Revenue Updates</p>
                  <p className="text-sm text-muted-foreground">Monthly revenue reports</p>
                </div>
                <Button variant="outline" size="sm">
                  On
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payout Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
              <CardDescription>Configure how you receive payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Payout Wallet</p>
                <code className="text-sm font-mono">0x1234...5678</code>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                Change Payout Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function CreatorSettingsPage() {
  return (
    <AuthGuard requireCreator>
      <CreatorSettingsContent />
    </AuthGuard>
  )
}
