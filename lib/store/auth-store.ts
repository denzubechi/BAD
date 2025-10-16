import { create } from "zustand"
import { persist } from "zustand/middleware"

interface SubAccount {
  address: `0x${string}`
  factory?: `0x${string}`
  factoryData?: `0x${string}`
}

interface AuthState {
  isConnected: boolean
  universalAddress: string | null
  subAccount: SubAccount | null
  userId: string | null
  isCreator: boolean
  isPremium: boolean
  setConnected: (connected: boolean) => void
  setUniversalAddress: (address: string | null) => void
  setSubAccount: (account: SubAccount | null) => void
  setUserId: (id: string | null) => void
  setIsCreator: (isCreator: boolean) => void
  setIsPremium: (isPremium: boolean) => void
  disconnect: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isConnected: false,
      universalAddress: null,
      subAccount: null,
      userId: null,
      isCreator: false,
      isPremium: false,
      setConnected: (connected) => set({ isConnected: connected }),
      setUniversalAddress: (address) => set({ universalAddress: address }),
      setSubAccount: (account) => set({ subAccount: account }),
      setUserId: (id) => set({ userId: id }),
      setIsCreator: (isCreator) => set({ isCreator }),
      setIsPremium: (isPremium) => set({ isPremium }),
      disconnect: () =>
        set({
          isConnected: false,
          universalAddress: null,
          subAccount: null,
          userId: null,
          isCreator: false,
          isPremium: false,
        }),
    }),
    {
      name: "bad-auth-storage",
    },
  ),
)
