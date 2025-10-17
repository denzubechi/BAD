import { formatUnits } from "viem";
import { USDC } from "./usdc";

export const FAUCET_BALANCE_THRESHOLD = 1;

interface EligibilityResult {
  eligible: boolean;
  reason?: string;
  balance: string;
}

export async function isEligibleForFaucet(
  address: string
): Promise<EligibilityResult> {
  try {
    const response = await fetch(`https://sepolia.base.org`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
          {
            to: USDC.address,
            data: `0x70a08231000000000000000000000000${address.slice(2)}`,
          },
          "latest",
        ],
      }),
    });

    const data = await response.json();
    const balance = BigInt(data.result || "0");
    const balanceFormatted = formatUnits(balance, USDC.decimals);
    const balanceNumber = Number.parseFloat(balanceFormatted);

    if (balanceNumber > FAUCET_BALANCE_THRESHOLD) {
      return {
        eligible: false,
        reason: `Balance ${balanceFormatted} USDC exceeds threshold of ${FAUCET_BALANCE_THRESHOLD} USDC`,
        balance: balanceFormatted,
      };
    }

    return {
      eligible: true,
      balance: balanceFormatted,
    };
  } catch (error) {
    console.error("[v0] Error checking faucet eligibility:", error);
    return {
      eligible: false,
      reason: "Failed to check balance",
      balance: "0",
    };
  }
}
