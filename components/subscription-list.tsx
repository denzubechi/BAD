"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Users, Calendar, CreditCard, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Subscription {
  id: string;
  status: string;
  startDate: string;
  endDate: string | null;
  nextRenewalDate: string | null;
  creator: {
    id: string;
    displayName: string;
    description: string | null;
    subscriptionPrice: string;
    subscriberCount: number;
    user: {
      username: string | null;
      avatar: string | null;
      address: string;
    };
  };
}

export function SubscriptionList() {
  const { userId } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadSubscriptions();
    }
  }, [userId]);

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/subscriptions?subscriberId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions);
      }
    } catch (error) {
      console.error("[v0] Error loading subscriptions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSubscription = async (id: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}/cancel`, {
        method: "POST",
      });
      if (response.ok) {
        loadSubscriptions();
      }
    } catch (error) {
      console.error("[v0] Error canceling subscription:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>;
      case "EXPIRED":
        return <Badge variant="secondary">Expired</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "PENDING":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatPrice = (price: string) => {
    const value = BigInt(price);
    const eth = Number(value) / 1e18;
    return eth.toFixed(6);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="w-8 h-8" />
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-3">
            <Users className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold">No Subscriptions</h3>
            <p className="text-sm text-muted-foreground">
              You haven't subscribed to any creators yet. Explore creators to
              get started.
            </p>
            <Button asChild>
              <a href="/explore">Discover Creators</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <Card key={subscription.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {subscription.creator.user.avatar ? (
                  <img
                    src={subscription.creator.user.avatar || "/placeholder.svg"}
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10" />
                )}
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {subscription.creator.displayName}
                  </CardTitle>
                  {subscription.creator.description && (
                    <CardDescription>
                      {subscription.creator.description}
                    </CardDescription>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    {subscription.creator.subscriberCount} subscribers
                  </div>
                </div>
              </div>
              {getStatusBadge(subscription.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Price</p>
                <p className="font-semibold flex items-center gap-1">
                  <CreditCard className="w-4 h-4" />
                  {subscription.creator.subscriptionPrice} USD/ month
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Started</p>
                <p className="font-semibold flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(subscription.startDate).toLocaleDateString()}
                </p>
              </div>
              {subscription.nextRenewalDate && (
                <div>
                  <p className="text-muted-foreground">Next Renewal</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(
                      subscription.nextRenewalDate
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={`/creator/${subscription.creator.id}`}>View Profile</a>
              </Button>
              {subscription.status === "ACTIVE" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your subscription to{" "}
                        {subscription.creator.displayName}? You will lose access
                        to their premium content.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => cancelSubscription(subscription.id)}
                      >
                        Cancel Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
