"use client";

import { useAccount } from "wagmi";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { User, FileText, CreditCard, Settings } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const { universalAddress, isCreator, isPremium } = useAuthStore();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please connect your wallet to access the dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile
              </CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/profile">View Profile</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscriptions
              </CardTitle>
              <CardDescription>Manage your subscriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/subscriptions">View Subscriptions</Link>
              </Button>
            </CardContent>
          </Card>

          {isCreator && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  My Content
                </CardTitle>
                <CardDescription>Manage your articles</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/creator/articles">Manage Articles</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {!isCreator && (
            <Card>
              <CardHeader>
                <CardTitle>Become a Creator</CardTitle>
                <CardDescription>
                  Start publishing premium content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/become-creator">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Settings
              </CardTitle>
              <CardDescription>Configure your preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant="outline"
                className="w-full bg-transparent"
              >
                <Link href="/settings">Open Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-6 rounded-lg border border-border bg-card">
          <h2 className="text-lg font-semibold mb-2">Account Status</h2>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Wallet:</span>{" "}
              <span className="font-mono">{universalAddress}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Creator Status:</span>{" "}
              <span
                className={
                  isCreator ? "text-green-500" : "text-muted-foreground"
                }
              >
                {isCreator ? "Active" : "Not a creator"}
              </span>
            </p>
            <p>
              <span className="text-muted-foreground">Premium Status:</span>{" "}
              <span
                className={
                  isPremium ? "text-green-500" : "text-muted-foreground"
                }
              >
                {isPremium ? "Active" : "Free tier"}
              </span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
