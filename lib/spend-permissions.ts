import {
  fetchPermissions,
  fetchPermission,
  getPermissionStatus,
  prepareSpendCallData,
  requestSpendPermission,
  requestRevoke,
  prepareRevokeCallData,
} from "@base-org/account/spend-permission"
import type { SpendPermission } from "@base-org/account/spend-permission"
import { sdk } from "./base-account"

export interface CreatePermissionParams {
  account: `0x${string}`
  spender: `0x${string}`
  token: `0x${string}`
  allowance: bigint
  periodInDays: number
}

export interface SpendParams {
  permission: SpendPermission
  amount: bigint
  spender: `0x${string}`
}

export async function createSpendPermission(params: CreatePermissionParams) {
  const provider = sdk.getProvider()

  const permission = await requestSpendPermission({
    account: params.account,
    spender: params.spender,
    token: params.token,
    chainId: await provider.request({ method: "eth_chainId" }).then((id) => Number.parseInt(id as string, 16)),
    allowance: params.allowance,
    periodInDays: params.periodInDays,
    provider,
  })

  return permission
}

export async function getPermissionByHash(permissionHash: `0x${string}`) {
  const provider = sdk.getProvider()
  return await fetchPermission({
    permissionHash,
    provider,
  })
}

export async function getAllPermissions(account: `0x${string}`, spender: `0x${string}`) {
  const provider = sdk.getProvider()
  const chainId = await provider.request({ method: "eth_chainId" }).then((id) => Number.parseInt(id as string, 16))

  return await fetchPermissions({
    account,
    chainId,
    spender,
    provider,
  })
}

export async function checkPermissionStatus(permission: SpendPermission) {
  return await getPermissionStatus(permission)
}

export async function executeSpend(params: SpendParams) {
  const provider = sdk.getProvider()

  // Check permission status first
  const { isActive, remainingSpend } = await getPermissionStatus(params.permission)

  if (!isActive) {
    throw new Error("Permission is not active")
  }

  if (remainingSpend < params.amount) {
    throw new Error(`Insufficient remaining spend. Available: ${remainingSpend}, Requested: ${params.amount}`)
  }

  // Prepare spend calls
  const [approveCall, spendCall] = await prepareSpendCallData({
    permission: params.permission,
    amount: params.amount,
  })

  // Execute the calls
  const chainId = await provider.request({ method: "eth_chainId" }).then((id) => Number.parseInt(id as string, 16))

  const callsId = await provider.request({
    method: "wallet_sendCalls",
    params: [
      {
        version: "2.0",
        atomicRequired: true,
        chainId: `0x${chainId.toString(16)}`,
        from: params.spender,
        calls: [approveCall, spendCall],
      },
    ],
  })

  return callsId
}

export async function revokePermission(permission: SpendPermission) {
  try {
    const hash = await requestRevoke(permission)
    return { success: true, hash }
  } catch (error) {
    console.error("[v0] Revoke failed:", error)
    return { success: false, error }
  }
}

export async function revokePermissionInBackground(permission: SpendPermission, spender: `0x${string}`) {
  const provider = sdk.getProvider()
  const revokeCall = await prepareRevokeCallData(permission)
  const chainId = await provider.request({ method: "eth_chainId" }).then((id) => Number.parseInt(id as string, 16))

  const callsId = await provider.request({
    method: "wallet_sendCalls",
    params: [
      {
        version: "2.0",
        atomicRequired: true,
        chainId: `0x${chainId.toString(16)}`,
        from: spender,
        calls: [revokeCall],
      },
    ],
  })

  return callsId
}
