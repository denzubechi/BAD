"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/store/auth-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Users, FileText, DollarSign, TrendingUp } from "lucide-react"

interface CreatorProfile {
  id: string
  displayName: string
  subscriptionPrice: string
  subscriberCount: number
  articleCount: number
}

export function CreatorStats() {
  const { userId } = useAuthStore()
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadProfile()
    }
  }, [userId])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/creators/profile?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error("[v0] Error loading creator profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPrice = (price: string) => {
    const value = BigInt(price)
    const eth = Number(value) / 1e18
    return eth.toFixed(6)
  }

  const calculateMonthlyRevenue = () => {
    if (!profile) return "0"
    const pricePerSub = BigInt(profile.subscriptionPrice)
    const totalRevenue = pricePerSub * BigInt(profile.subscriberCount)
    const eth = Number(totalRevenue) / 1e18
    return eth.toFixed(6)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
          <Users className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profile.subscriberCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Active subscriptions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Published Articles</CardTitle>
          <FileText className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{profile.articleCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Total content pieces</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
          <DollarSign className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{calculateMonthlyRevenue()}</div>
          <p className="text-xs text-muted-foreground mt-1">Tokens per month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Subscription Price</CardTitle>
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatPrice(profile.subscriptionPrice)}</div>
          <p className="text-xs text-muted-foreground mt-1">Per subscriber/month</p>
        </CardContent>
      </Card>
    </div>
  )
}
