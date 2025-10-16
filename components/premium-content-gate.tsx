"use client"

import type React from "react"

import { useState } from "react"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, Sparkles } from "lucide-react"
import { OnboardingDialog } from "./onboarding-dialog"
import { motion } from "framer-motion"

interface PremiumContentGateProps {
  children: React.ReactNode
  creatorId?: string
  creatorName?: string
}

export function PremiumContentGate({ children, creatorId, creatorName }: PremiumContentGateProps) {
  const { isConnected, subAccount, isPremium } = useAuthStore()
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Determine what steps are needed
  const getRequiredSteps = () => {
    const steps: ("wallet" | "subaccount" | "permission")[] = []
    if (!isConnected) steps.push("wallet")
    if (!subAccount) steps.push("subaccount")
    if (!isPremium) steps.push("permission")
    return steps
  }

  const requiredSteps = getRequiredSteps()
  const needsSetup = requiredSteps.length > 0

  if (!needsSetup) {
    return <>{children}</>
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="py-16">
            <div className="text-center space-y-6 max-w-md mx-auto">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center"
              >
                <Lock className="w-10 h-10 text-primary-foreground" />
              </motion.div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-balance">Premium Content Locked</h3>
                <p className="text-muted-foreground text-balance">
                  {!isConnected && "Connect your wallet to access premium content"}
                  {isConnected && !subAccount && "Create a sub-account for seamless subscriptions"}
                  {isConnected &&
                    subAccount &&
                    !isPremium &&
                    `Subscribe to ${creatorName || "this creator"} to unlock exclusive content`}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button size="lg" onClick={() => setShowOnboarding(true)} className="w-full">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {!isConnected ? "Connect Wallet" : !subAccount ? "Setup Account" : "Subscribe Now"}
                </Button>
                <p className="text-xs text-muted-foreground">Secure, non-custodial subscriptions powered by Base</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <OnboardingDialog
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        onComplete={() => {
          // Redirect to subscription page if needed
          if (creatorId) {
            window.location.href = `/subscribe/${creatorId}`
          }
        }}
        requiredSteps={requiredSteps}
      />
    </>
  )
}
