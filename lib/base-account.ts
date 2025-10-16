import { createBaseAccountSDK } from "@base-org/account"
import { base, baseSepolia } from "viem/chains"

const isDevelopment = process.env.NODE_ENV === "development"

let sdkInstance: ReturnType<typeof createBaseAccountSDK> | null = null

const initializeSDK = () => {
  // Only initialize on client side
  if (typeof window === "undefined") {
    return null
  }

  if (!sdkInstance) {
    try {
      sdkInstance = createBaseAccountSDK({
        appName: "Base Analyst Daily",
        appLogoUrl: "/logo.png",
        appChainIds: [isDevelopment ? baseSepolia.id : base.id],
        subAccounts: {
          funding: "manual",
        },
      })
    } catch (error) {
      console.error("[v0] Failed to initialize Base Account SDK:", error)
      return null
    }
  }

  return sdkInstance
}

// Export SDK with lazy initialization
export const sdk = new Proxy({} as ReturnType<typeof createBaseAccountSDK>, {
  get(target, prop) {
    const instance = initializeSDK()
    if (!instance) {
      throw new Error("SDK can only be used on the client side")
    }
    return instance[prop as keyof typeof instance]
  },
})

export const getSDK = () => {
  const instance = initializeSDK()
  if (!instance) {
    throw new Error("SDK can only be initialized on the client side")
  }
  return instance
}

export const getProvider = () => {
  const instance = initializeSDK()
  if (!instance) {
    throw new Error("Provider can only be accessed on the client side")
  }
  return instance.getProvider()
}

export const chainId = isDevelopment ? baseSepolia.id : base.id
