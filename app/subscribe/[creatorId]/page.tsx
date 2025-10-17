"use client";

import { use, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useConnections, useBalance } from "wagmi";
import { createBaseAccountSDK } from "@base-org/account";
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
import { baseSepolia } from "viem/chains";

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

interface WalletAddSubAccountResponse {
  address: `0x${string}`;
  factory?: `0x${string}`;
  factoryData?: `0x${string}`;
}

interface GetSubAccountsResponse {
  subAccounts: WalletAddSubAccountResponse[];
}

function SubscribeContent({
  params,
}: {
  params: Promise<{ creatorId: string }>;
}) {
  const { creatorId } = use(params);
  const router = useRouter();
  const { address } = useAccount();
  const { userId } = useAuthStore();
  const connections = useConnections();

  const [_subAccount, universalAccount] = useMemo(() => {
    return connections.flatMap((connection) => connection.accounts);
  }, [connections]);

  const [provider, setProvider] = useState<ReturnType<
    ReturnType<typeof createBaseAccountSDK>["getProvider"]
  > | null>(null);

  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [subAccount, setSubAccount] =
    useState<WalletAddSubAccountResponse | null>(null);
  const [isCreatingSubAccount, setIsCreatingSubAccount] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const { data: balance } = useBalance({
    address: universalAccount,
    token: USDC.address,
    query: {
      refetchInterval: 5000,
      enabled: !!universalAccount,
    },
  });

  const [hasLoadedCreator, setHasLoadedCreator] = useState(false);

  useEffect(() => {
    const initializeSDK = async () => {
      try {
        const sdkInstance = createBaseAccountSDK({
          appName: "Base Ecosystem App",
          appChainIds: [baseSepolia.id],
        });

        const providerInstance = sdkInstance.getProvider();
        setProvider(providerInstance);
      } catch (error) {
        console.error("[v0] SDK initialization failed:", error);
        setStatus("SDK initialization failed");
        setStatusType("error");
      }
    };

    initializeSDK();
  }, []);

  useEffect(() => {
    if (!hasLoadedCreator) {
      setHasLoadedCreator(true);
      loadCreator();
    }
  }, [creatorId, hasLoadedCreator]);

  useEffect(() => {
    if (provider && universalAccount && !subAccount) {
      checkExistingSubAccount();
    }
  }, [provider, universalAccount]);

  const checkExistingSubAccount = async () => {
    if (!provider || !universalAccount) return;

    try {
      const response = (await provider.request({
        method: "wallet_getSubAccounts",
        params: [
          {
            account: universalAccount,
            domain: window.location.origin,
          },
        ],
      })) as GetSubAccountsResponse;

      const existing = response.subAccounts[0];
      if (existing) {
        setSubAccount(existing);
      }
    } catch (error) {
      console.error("[v0] Error checking sub-account:", error);
    }
  };

  const loadCreator = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/creators/${creatorId}`);
      if (response.ok) {
        const data = await response.json();
        setCreator(data.creator);
      }
    } catch (error) {
      console.error("[v0] Error loading creator:", error);
      setStatus("Failed to load creator information");
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const createSubAccount = async () => {
    if (!provider) {
      setStatus("Provider not initialized");
      setStatusType("error");
      return;
    }

    setIsCreatingSubAccount(true);
    setStatus("Creating sub-account...");
    setStatusType("info");

    try {
      const newSubAccount = (await provider.request({
        method: "wallet_addSubAccount",
        params: [
          {
            account: {
              type: "create",
            },
          },
        ],
      })) as WalletAddSubAccountResponse;

      setSubAccount(newSubAccount);
      setStatus("Sub-account created successfully!");
      setStatusType("success");

      await fetch("/api/auth/sub-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address,
          subAccountAddress: newSubAccount.address,
          subAccountFactory: newSubAccount.factory,
          subAccountFactoryData: newSubAccount.factoryData,
        }),
      });
    } catch (error) {
      console.error("[v0] Error creating sub-account:", error);
      setStatus("Failed to create sub-account. Please try again.");
      setStatusType("error");
    } finally {
      setIsCreatingSubAccount(false);
    }
  };

  const subscribe = useCallback(async () => {
    if (!provider || !subAccount || !creator) {
      setStatus("Sub-account or creator not available");
      setStatusType("error");
      return;
    }

    setIsSubscribing(true);
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

      const callsId = (await provider.request({
        method: "wallet_sendCalls",
        params: [
          {
            version: "2.0",
            atomicRequired: true,
            chainId: `0x${baseSepolia.id.toString(16)}`,
            from: subAccount.address,
            calls: [
              {
                to: USDC.address,
                data,
                value: "0x0",
              },
            ],
            capabilities: {},
          },
        ],
      })) as string;

      setStatus("Subscription payment sent!");
      setStatusType("success");

      toast.loading("Processing subscription payment...", {
        description: `Subscribing to ${creator.displayName}`,
      });

      const subscriptionResponse = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriberId: userId,
          creatorId: creator.id,
        }),
      });

      if (subscriptionResponse.ok) {
        toast.success("Subscription created successfully!");
        setTimeout(() => {
          router.push("/subscriptions");
        }, 1500);
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      setStatus("Failed to create subscription");
      setStatusType("error");
      toast.error("Subscription failed", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsSubscribing(false);
    }
  }, [provider, subAccount, creator, userId, router]);

  const formatPrice = (price: string) => {
    const value = BigInt(price);
    const eth = Number(value) / 1e18;
    return eth.toFixed(6);
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
                    alt=""
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
                    {creator.subscriptionPrice}
                  </p>
                  <p className="text-sm text-muted-foreground">USD/Per Month</p>
                </div>
              </div>

              {balance && (
                <div className="p-4 rounded-lg border border-border bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Your USDC Balance
                      </p>
                      <p className="text-lg font-semibold">
                        {Number.parseFloat(balance.formatted).toFixed(2)}{" "}
                        {balance.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg border border-border bg-muted/50">
                <h3 className="font-semibold mb-2">What you'll get:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Access to all premium articles
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Exclusive trading signals and market analysis
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
                    You need to create a sub-account to subscribe. This enables
                    automated payments.
                  </AlertDescription>
                </Alert>
              )}

              {!subAccount ? (
                <Button
                  onClick={createSubAccount}
                  disabled={isCreatingSubAccount || !provider}
                  className="w-full"
                  size="lg"
                >
                  {isCreatingSubAccount ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Initializing subscription...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Initialize subscription
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={subscribe}
                  disabled={isSubscribing}
                  className="w-full"
                  size="lg"
                >
                  {isSubscribing ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Subscribe for {creator.subscriptionPrice} / month
                    </>
                  )}
                </Button>
              )}
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
