"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/store/auth-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Users, Calendar } from "lucide-react"

interface Subscriber {
  id: string
  status: string
  startDate: string
  nextRenewalDate: string | null
  subscriber: {
    username: string | null
    avatar: string | null
    address: string
  }
}

export function SubscriberList() {
  const { userId } = useAuthStore()
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadSubscribers()
    }
  }, [userId])

  const loadSubscribers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/creators/subscribers?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.subscribers)
      }
    } catch (error) {
      console.error("[v0] Error loading subscribers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>
      case "EXPIRED":
        return <Badge variant="secondary">Expired</Badge>
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (subscribers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <Users className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">No Subscribers Yet</h3>
            <p className="text-sm text-muted-foreground">Start publishing premium content to attract subscribers</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {subscribers.map((subscription) => (
        <Card key={subscription.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {subscription.subscriber.avatar ? (
                  <img
                    src={subscription.subscriber.avatar || "/placeholder.svg"}
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/10" />
                )}
                <div>
                  <CardTitle className="text-base">
                    {subscription.subscriber.username || formatAddress(subscription.subscriber.address)}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">
                    {formatAddress(subscription.subscriber.address)}
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Subscribed: {new Date(subscription.startDate).toLocaleDateString()}
              </div>
              {subscription.nextRenewalDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Next Renewal: {new Date(subscription.nextRenewalDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
