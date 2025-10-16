import { create } from "zustand"

interface SpendPermission {
  id: string
  permissionHash: string
  spender: string
  token: string
  allowance: string
  period: number
  status: string
  permissionType: string
  createdAt: string
}

interface Subscription {
  id: string
  creatorId: string
  creatorName: string
  status: string
  startDate: string
  nextRenewalDate: string | null
  spendPermissionHash: string | null
}

interface SubscriptionState {
  subscriptions: Subscription[]
  spendPermissions: SpendPermission[]
  isLoading: boolean
  setSubscriptions: (subscriptions: Subscription[]) => void
  setSpendPermissions: (permissions: SpendPermission[]) => void
  setIsLoading: (loading: boolean) => void
  addSubscription: (subscription: Subscription) => void
  addSpendPermission: (permission: SpendPermission) => void
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscriptions: [],
  spendPermissions: [],
  isLoading: false,
  setSubscriptions: (subscriptions) => set({ subscriptions }),
  setSpendPermissions: (permissions) => set({ spendPermissions: permissions }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  addSubscription: (subscription) =>
    set((state) => ({
      subscriptions: [...state.subscriptions, subscription],
    })),
  addSpendPermission: (permission) =>
    set((state) => ({
      spendPermissions: [...state.spendPermissions, permission],
    })),
}))
