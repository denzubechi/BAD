"use client";

import { useAccount, useBalance, useConnections } from "wagmi";
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
import { User, FileText, CreditCard, Settings, Droplet } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { USDC } from "@/lib/usdc";
import { useFaucet } from "@/hooks/use-faucet";
import { useFaucetEligibility } from "@/hooks/use-faucet-eligibility";
import { toast } from "sonner";
import { useMemo, useCallback } from "react";

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const { universalAddress, isCreator, isPremium } = useAuthStore();
  const connections = useConnections();

  const [_subAccount, universalAccount] = useMemo(() => {
    return connections.flatMap((connection) => connection.accounts);
  }, [connections]);

  const { data: balance } = useBalance({
    address: universalAccount,
    token: USDC.address,
    query: {
      refetchInterval: 5000,
      enabled: !!universalAccount,
    },
  });

  const faucetEligibility = useFaucetEligibility(balance?.value);
  const faucetMutation = useFaucet();

  const handleFundAccount = useCallback(async () => {
    if (!universalAccount) {
      toast.error("No universal account found");
      return;
    }

    if (!faucetEligibility.isEligible) {
      toast.error("Not eligible for faucet", {
        description: faucetEligibility.reason,
      });
      return;
    }

    const fundingToastId = toast.loading("Requesting USDC from faucet...");

    faucetMutation.mutate(
      { address: universalAccount },
      {
        onSuccess: (data) => {
          toast.dismiss(fundingToastId);
          toast.success("Account funded successfully!");
        },
        onError: (error) => {
          toast.dismiss(fundingToastId);
          const errorMessage =
            error instanceof Error ? error.message : "Please try again later";
          toast.error("Failed to fund account", {
            description: errorMessage,
          });
        },
      }
    );
  }, [universalAccount, faucetMutation, faucetEligibility]);

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
          <h2 className="text-lg font-semibold mb-4">Account Status</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Wallet Address</p>
              <p className="font-mono text-sm mt-1">{universalAddress}</p>
            </div>
            {balance && (
              <div>
                <p className="text-sm text-muted-foreground">USDC Balance</p>
                <p className="font-mono text-sm mt-1">
                  {Number.parseFloat(balance.formatted).toFixed(2)}{" "}
                  {balance.symbol}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Creator Status</p>
              <p
                className={
                  isCreator
                    ? "text-green-500 text-sm"
                    : "text-muted-foreground text-sm"
                }
              >
                {isCreator ? "Active" : "Not a creator"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Premium Status</p>
              <p
                className={
                  isPremium
                    ? "text-green-500 text-sm"
                    : "text-muted-foreground text-sm"
                }
              >
                {isPremium ? "Active" : "Free tier"}
              </p>
            </div>
          </div>

          <Button
            onClick={handleFundAccount}
            disabled={faucetMutation.isPending || !faucetEligibility.isEligible}
            className="mt-4 w-full bg-transparent"
            variant="outline"
          >
            <Droplet className="w-4 h-4 mr-2" />
            {faucetMutation.isPending
              ? "Funding..."
              : "Fund Account with Test USDC"}
          </Button>
        </div>
      </main>
    </div>
  );
}
