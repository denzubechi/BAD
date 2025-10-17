"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Wallet, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

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
  } = useAuthStore();

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

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
        setUserId(userData.id);
        setIsCreator(userData.isCreator);
        setIsPremium(userData.isPremium);
        if (userData.subAccountAddress) {
          setSubAccount({
            address: userData.subAccountAddress,
            factory: userData.subAccountFactory,
            factoryData: userData.subAccountFactoryData,
          });
        }
      }
    } catch (error) {
      console.error("Error syncing user data:", error);
    }
  };

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
        <DropdownMenuItem asChild>
          <a href="/dashboard">Dashboard</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/profile">Profile</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/sub-account">
            {subAccount ? "Sub-Account" : "Create Sub-Account"}
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect}>
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
