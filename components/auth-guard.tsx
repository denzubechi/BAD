"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store/auth-store"
import { Spinner } from "@/components/ui/spinner"

interface AuthGuardProps {
  children: React.ReactNode
  requireCreator?: boolean
  requirePremium?: boolean
}

export function AuthGuard({ children, requireCreator, requirePremium }: AuthGuardProps) {
  const router = useRouter()
  const { isConnected, isCreator, isPremium } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      if (!isConnected) {
        router.push("/")
        return
      }

      if (requireCreator && !isCreator) {
        router.push("/become-creator")
        return
      }

      if (requirePremium && !isPremium) {
        router.push("/premium")
        return
      }

      setIsChecking(false)
    }

    checkAuth()
  }, [isConnected, isCreator, isPremium, requireCreator, requirePremium, router])

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return <>{children}</>
}
