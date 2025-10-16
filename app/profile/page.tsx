"use client"

import { AuthGuard } from "@/components/auth-guard"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, Wallet, Shield } from "lucide-react"
import { useState } from "react"

function ProfileContent() {
  const { universalAddress, isCreator, isPremium, subAccount } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your account details and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Wallet Address</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{universalAddress}</code>
                  </div>
                </div>

                {subAccount && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Sub-Account Address</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{subAccount.address}</code>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Creator Status</Label>
                    <p className={`text-sm font-medium mt-1 ${isCreator ? "text-green-500" : "text-muted-foreground"}`}>
                      {isCreator ? "Active Creator" : "Not a Creator"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Premium Status</Label>
                    <p className={`text-sm font-medium mt-1 ${isPremium ? "text-green-500" : "text-muted-foreground"}`}>
                      {isPremium ? "Premium Member" : "Free Tier"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Details */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your public profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter your username" disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" type="email" placeholder="your@email.com" disabled={!isEditing} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  rows={4}
                  disabled={!isEditing}
                  className="resize-none"
                />
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

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates about your subscriptions</p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Privacy Settings</p>
                  <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  )
}
