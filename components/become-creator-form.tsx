"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export function BecomeCreatorForm() {
  const router = useRouter();
  const { userId, setIsCreator } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">(
    "info"
  );

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [subscriptionPrice, setSubscriptionPrice] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName || !subscriptionPrice || !tokenAddress) {
      setStatus("Please fill in all required fields");
      setStatusType("error");
      return;
    }

    setIsSubmitting(true);
    setStatus("Creating creator profile...");
    setStatusType("info");

    try {
      const response = await fetch("/api/creators/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          displayName,
          description: description || null,
          subscriptionPrice,
          tokenAddress,
        }),
      });

      if (response.ok) {
        setStatus("Creator profile created successfully!");
        setStatusType("success");
        setIsCreator(true);
        setTimeout(() => {
          router.push("/creator/dashboard");
        }, 1500);
      } else {
        const error = await response.json();
        setStatus(error.error || "Failed to create creator profile");
        setStatusType("error");
      }
    } catch (error) {
      console.error("[v0] Error creating creator profile:", error);
      setStatus("Failed to create creator profile");
      setStatusType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {status && (
        <Alert variant={statusType === "error" ? "destructive" : "default"}>
          {statusType === "success" && <CheckCircle2 className="h-4 w-4" />}
          {statusType === "error" && <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Start Your Creator Journey
          </CardTitle>
          <CardDescription>
            Set up your creator profile and start monetizing your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                placeholder="Your creator name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell your audience about yourself and your content"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscriptionPrice">
                Subscription Price (in usd) *
              </Label>
              <Input
                id="subscriptionPrice"
                placeholder="1000000000000000000"
                value={subscriptionPrice}
                onChange={(e) => setSubscriptionPrice(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Example: 1 usd per month
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tokenAddress">Token Address *</Label>
              <Input
                id="tokenAddress"
                placeholder="0x..."
                value={tokenAddress}
                onChange={(e) => setTokenAddress(e.target.value)}
                className="font-mono text-sm"
                required
              />
              <p className="text-xs text-muted-foreground">
                The token address you want to receive payments in
              </p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Creating Profile...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Become a Creator
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What you'll get as a creator:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Publish unlimited premium articles</li>
            <li>
              Receive automated subscription payments via spend permissions
            </li>
            <li>Build a loyal subscriber base</li>
            <li>Track your earnings and subscriber growth</li>
            <li>Full control over your content and pricing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
