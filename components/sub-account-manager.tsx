"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useAccount, useWalletClient } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Wallet, Plus, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { baseSepolia } from "viem/chains";
import { createBaseAccountSDK } from "@base-org/account";
interface SubAccount {
  address: `0x${string}`;
  factory?: `0x${string}`;
  factoryData?: `0x${string}`;
}

interface GetSubAccountsResponse {
  subAccounts: SubAccount[];
}

interface WalletAddSubAccountResponse {
  address: `0x${string}`;
  factory?: `0x${string}`;
  factoryData?: `0x${string}`;
}

export function SubAccountManager() {
  const { universalAddress, subAccount, setSubAccount } = useAuthStore();
  const { address } = useAccount();
  const [provider, setProvider] = useState<ReturnType<
    ReturnType<typeof createBaseAccountSDK>["getProvider"]
  > | null>(null);
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [testCallTo, setTestCallTo] = useState(
    "0x4bbfd120d9f352a0bed7a014bd67913a2007a878"
  );
  const [testCallData, setTestCallData] = useState("0x9846cd9e");

  useEffect(() => {
    if (walletClient && address && !subAccount) {
      checkExistingSubAccount();
    }
  }, [walletClient, address]);

  const checkExistingSubAccount = async () => {
    if (!provider || !address) return;

    try {
      const response = (await provider.request({
        method: "wallet_getSubAccounts",
        params: [
          {
            account: address,
            domain: window.location.origin,
          },
        ],
      })) as GetSubAccountsResponse;

      const existing = response.subAccounts[0];
      if (existing) {
        setSubAccount(existing);
        await updateSubAccountInDB(existing);
        setStatus("Existing sub-account found");
        setStatusType("success");
      }
    } catch (error) {
      console.error("Error checking sub-account:", error);
    }
  };

  const updateSubAccountInDB = async (account: SubAccount) => {
    try {
      await fetch("/api/auth/sub-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: address,
          subAccountAddress: account.address,
          subAccountFactory: account.factory,
          subAccountFactoryData: account.factoryData,
        }),
      });
    } catch (error) {
      console.error("Error updating sub-account in DB:", error);
    }
  };

  const createSubAccount = async () => {
    if (!provider) {
      setStatus("Wallet not connected");
      setStatusType("error");
      return;
    }

    setIsLoading(true);
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
      await updateSubAccountInDB(newSubAccount);
      setStatus("Sub-account created successfully!");
      setStatusType("success");
    } catch (error) {
      console.error("Sub-account creation failed:", error);
      setStatus("Sub-account creation failed. Please try again.");
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestCall = useCallback(async () => {
    if (!walletClient || !subAccount) {
      setStatus("Sub-account not available");
      setStatusType("error");
      return;
    }

    setIsLoading(true);
    setStatus("Sending test transaction...");
    setStatusType("info");

    try {
      const calls = [
        {
          to: testCallTo,
          data: testCallData,
          value: "0x0",
        },
      ];

      const callsId = (await walletClient.request({
        method: "wallet_sendCalls",
        params: [
          {
            version: "2.0",
            atomicRequired: true,
            chainId: `0x${baseSepolia.id.toString(16)}`,
            from: subAccount.address,
            calls,
            capabilities: {},
          },
        ],
      })) as string;

      setStatus(`Transaction sent! Calls ID: ${callsId}`);
      setStatusType("success");
    } catch (error) {
      console.error("Send calls failed:", error);
      setStatus("Transaction failed. Please try again.");
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, subAccount, testCallTo, testCallData]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <Wallet className="w-5 h-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your universal and sub-account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">
              Universal Account
            </Label>
            <p className="font-mono text-sm mt-1">
              {address || "Not connected"}
            </p>
          </div>

          {subAccount ? (
            <div>
              <Label className="text-sm text-muted-foreground">
                Sub-Account Address
              </Label>
              <p className="font-mono text-sm mt-1">{subAccount.address}</p>
              {subAccount.factory && (
                <>
                  <Label className="text-sm text-muted-foreground mt-3">
                    Factory Address
                  </Label>
                  <p className="font-mono text-sm mt-1">{subAccount.factory}</p>
                </>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-dashed border-border bg-muted/50">
              <p className="text-sm text-muted-foreground text-center">
                No sub-account created yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {!subAccount && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Sub-Account
            </CardTitle>
            <CardDescription>
              Create a sub-account to enable automated subscriptions and spend
              permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={createSubAccount}
              disabled={isLoading || !walletClient}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Sub-Account
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {subAccount && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Test Transaction
            </CardTitle>
            <CardDescription>
              Send a test transaction from your sub-account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-to">To Address</Label>
              <Input
                id="test-to"
                value={testCallTo}
                onChange={(e) => setTestCallTo(e.target.value)}
                placeholder="0x..."
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-data">Call Data</Label>
              <Input
                id="test-data"
                value={testCallData}
                onChange={(e) => setTestCallData(e.target.value)}
                placeholder="0x..."
                className="font-mono text-sm"
              />
            </div>
            <Button
              onClick={sendTestCall}
              disabled={isLoading || !walletClient}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Test Transaction
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>What are Sub-Accounts?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Sub-accounts are specialized accounts that enable automated payments
            and spend permissions for subscriptions.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Enable recurring subscription payments without manual approval
            </li>
            <li>Set spending limits and permissions for specific creators</li>
            <li>Maintain security while allowing automated transactions</li>
            <li>Required for subscribing to premium content creators</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
