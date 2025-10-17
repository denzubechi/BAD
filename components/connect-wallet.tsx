"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useBalance,
  useConnections,
} from "wagmi";
import { Wallet, LogOut, Droplet } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { USDC } from "@/lib/usdc";
import { useFaucet } from "@/hooks/use-faucet";
import { useFaucetEligibility } from "@/hooks/use-faucet-eligibility";
import { toast } from "sonner";

export function ConnectWallet() {
  const {
    isConnected: storeConnected,
    universalAddress,
    subAccount,
    setConnected,
    setUniversalAddress,
    setSubAccount,
    setUserId,
    setIsCreator,
    setIsPremium,
    disconnect: storeDisconnect,
    setUserData,
  } = useAuthStore();

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  const connections = useConnections();
  const [_subAccount, universalAccount] = useMemo(() => {
    return connections.flatMap((connection) => connection.accounts);
  }, [connections]);

  const { data: universalBalance } = useBalance({
    address: universalAccount,
    token: USDC.address,
    query: {
      refetchInterval: 5000,
      enabled: !!universalAccount,
    },
  });

  const faucetEligibility = useFaucetEligibility(universalBalance?.value);
  const faucetMutation = useFaucet();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isConnected && address) {
      setConnected(true);
      setUniversalAddress(address);
      syncUserData(address);
    } else if (!isConnected && storeConnected) {
      storeDisconnect();
    }
  }, [
    isConnected,
    address,
    mounted,
    setConnected,
    setUniversalAddress,
    storeConnected,
    storeDisconnect,
  ]);

  const syncUserData = async (walletAddress: string) => {
    try {
      const response = await fetch("/api/auth/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: walletAddress }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUserData({
          userId: userData.id,
          creatorId: userData.creatorProfile?.id || null,
          isCreator: userData.isCreator,
          isPremium: userData.isPremium,
          subAccount: userData.subAccountAddress
            ? {
                address: userData.subAccountAddress,
                factory: userData.subAccountFactory,
                factoryData: userData.subAccountFactoryData,
              }
            : null,
        });
      }
    } catch (error) {
      console.error("[v0] Error syncing user data:", error);
    }
  };

  const handleFundAccount = useCallback(async () => {
    if (!universalAccount) {
      toast.error("No universal account found", {
        description: "Please make sure your wallet is properly connected",
      });
      return;
    }

    if (!faucetEligibility.isEligible) {
      toast.error("Not eligible for faucet", {
        description: faucetEligibility.reason,
      });
      return;
    }

    const fundingToastId = toast.loading("Requesting USDC from faucet...", {
      description: "This may take a few moments",
    });

    faucetMutation.mutate(
      { address: universalAccount },
      {
        onSuccess: (data: any) => {
          toast.dismiss(fundingToastId);
          toast.success("Account funded successfully!", {
            description: (
              <div className="flex flex-col gap-1">
                <span>USDC has been sent to your wallet</span>
                <a
                  href={data.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs underline hover:opacity-80"
                >
                  View transaction
                </a>
              </div>
            ),
            duration: 5000,
          });
        },
        onError: (error: any) => {
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

  const handleConnect = async () => {
    const baseAccountConnector = connectors.find((c) => c.id === "baseAccount");
    if (baseAccountConnector) {
      connect({ connector: baseAccountConnector });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    storeDisconnect();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!mounted) {
    return (
      <Button disabled>
        <Wallet className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    );
  }

  if (!isConnected || !address) {
    return (
      <button
        onClick={handleConnect}
        disabled={isPending}
        className="flex items-center justify-center gap-2 px-8 py-5 rounded-lg cursor-pointer 
        font-medium text-lg min-w-64 h-14 transition-all duration-200 border border-gray-200"
      >
        <div
          className={`
      w-4 h-4 rounded-xs flex-shrink-0
          bg-blue-700
        `}
        />

        <span className="hidden sm:inline">
          {isPending ? "Signing in..." : "Sign in with Base"}
        </span>
        <span className="sm:hidden">
          {isPending ? "Signing in..." : "Sign in with Base"}
        </span>
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Wallet className="w-4 h-4 mr-2" />
          {formatAddress(address)}
          {subAccount && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Sub
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {universalBalance && (
          <>
            <div className="px-2 py-1.5 text-sm">
              <div className="text-muted-foreground text-xs">Balance</div>
              <div className="font-medium">
                {Number.parseFloat(universalBalance.formatted).toFixed(2)}{" "}
                {universalBalance.symbol}
              </div>
            </div>
            <DropdownMenuItem
              onClick={handleFundAccount}
              disabled={
                faucetMutation.isPending || !faucetEligibility.isEligible
              }
            >
              <Droplet className="w-4 h-4 mr-2" />
              {faucetMutation.isPending ? "Funding..." : "Get Test USDC"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <a href="/dashboard">Dashboard</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/profile">Profile</a>
        </DropdownMenuItem>
        {/* <DropdownMenuItem asChild>
          <a href="/sub-account">
            {subAccount ? "Sub-Account" : "Create Sub-Account"}
          </a>
        </DropdownMenuItem> */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect}>
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
