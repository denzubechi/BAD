"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Users,
  FileText,
} from "lucide-react";
import { encodeFunctionData, parseUnits } from "viem";
import { USDC, erc20Abi } from "@/lib/usdc";
import { toast } from "sonner";

type SendTransactionFn = ReturnType<
  typeof useSendTransaction
>["sendTransaction"];

interface Creator {
  id: string;
  displayName: string;
  description: string | null;
  subscriptionPrice: string;
  subscriberCount: number;
  articleCount: number;
  user: {
    username: string | null;
    avatar: string | null;
    address: string;
  };
}

function SubscribeContent({
  params,
}: {
  params: Promise<{ creatorId: string }>;
}) {
  const { creatorId } = use(params);
  const router = useRouter();
  const { isConnected } = useAccount();
  const { userId, subAccount } = useAuthStore();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">(
    "info"
  );

  const {
    sendTransaction,
    data: hash,
    isPending: isTransactionPending,
    reset: resetTransaction,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const [hasLoadedCreator, setHasLoadedCreator] = useState(false);

  useEffect(() => {
    if (!hasLoadedCreator) {
      setHasLoadedCreator(true);
      loadCreator();
    }
  }, [creatorId, hasLoadedCreator]);

  const loadCreator = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/creators/${creatorId}`);
      if (response.ok) {
        const data = await response.json();
        setCreator(data.creator);
      } else {
        throw new Error("Failed to fetch creator");
      }
    } catch (error) {
      console.error("[v0] Error loading creator:", error);
      setStatus("Failed to load creator information");
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = useCallback(async () => {
    if (!subAccount || !creator) {
      setStatus("You need to create a sub-account first");
      setStatusType("error");
      return;
    }

    setStatus("Sending subscription payment...");
    setStatusType("info");

    try {
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [
          creator.user.address as `0x${string}`,
          parseUnits(creator.subscriptionPrice, USDC.decimals),
        ],
      });

      sendTransaction({
        to: USDC.address,
        data,
        value: BigInt(0),
      });

      toast.loading("Processing subscription payment...", {
        description: `Subscribing to ${creator.displayName}`,
      });
    } catch (error) {
      console.error("[v0] Error creating subscription:", error);
      setStatus("Failed to create subscription. Check your wallet.");
      setStatusType("error");
      toast.error("Transaction failed or was rejected.");
    }
  }, [subAccount, creator, sendTransaction]);

  useEffect(() => {
    if (isConfirmed && creator) {
      fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriberId: userId,
          creatorId: creator.id,
        }),
      }).then((response) => {
        if (response.ok) {
          toast.success("Subscription created successfully!");
          setStatus("Subscription successful!");
          setStatusType("success");
          setTimeout(() => {
            router.push("/subscriptions");
          }, 1500);
        } else {
          toast.error(
            "Transaction successful, but backend failed to record subscription."
          );
          setStatus(
            "Payment confirmed, but subscription setup failed on server."
          );
          setStatusType("error");
        }
      });

      resetTransaction();
    }
  }, [isConfirmed, creator, userId, router, resetTransaction]);

  const formatPrice = (price: string) => {
    const value = BigInt(price);
    const usd = Number(value) / 1e6;
    return usd.toFixed(2) + " USDC";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              Creator not found
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Subscribe to Creator</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
              <div className="flex items-start gap-4">
                {creator.user.avatar ? (
                  <img
                    src={creator.user.avatar || "/placeholder.svg"}
                    alt={`${creator.displayName} avatar`}
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10" />
                )}
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-2xl">
                    {creator.displayName}
                  </CardTitle>
                  {creator.description && (
                    <CardDescription>{creator.description}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg border border-border">
                  <Users className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">
                    {creator.subscriberCount}
                  </p>
                  <p className="text-sm text-muted-foreground">Subscribers</p>
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <FileText className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">{creator.articleCount}</p>
                  <p className="text-sm text-muted-foreground">Articles</p>
                </div>
                <div className="p-4 rounded-lg border border-border">
                  <CreditCard className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-2xl font-bold">
                    {formatPrice(creator.subscriptionPrice)}
                  </p>
                  <p className="text-sm text-muted-foreground">Per Month</p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-muted/50">
                <h3 className="font-semibold mb-2">What you'll get:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Access to all premium articles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Exclusive content and analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Automated monthly renewals via spend permissions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Cancel anytime
                  </li>
                </ul>
              </div>

              {!subAccount && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You need to **create a sub-account** before subscribing.{" "}
                    <a href="/sub-account" className="underline font-medium">
                      Create one now
                    </a>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={subscribe}
                disabled={isTransactionPending || isConfirming || !subAccount}
                className="w-full"
                size="lg"
              >
                {isTransactionPending || isConfirming ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    {isTransactionPending ? "Confirming..." : "Processing..."}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscribe for {formatPrice(creator.subscriptionPrice)} /
                    month
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function SubscribePage({
  params,
}: {
  params: Promise<{ creatorId: string }>;
}) {
  return <SubscribeContent params={params} />;
}
