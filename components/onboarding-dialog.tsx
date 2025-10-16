"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Wallet, Shield, Zap, ArrowRight } from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"
import { sdk } from "@/lib/base-account"
import { motion, AnimatePresence } from "framer-motion"

interface OnboardingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete: () => void
  requiredSteps?: ("wallet" | "subaccount" | "permission")[]
}

export function OnboardingDialog({
  open,
  onOpenChange,
  onComplete,
  requiredSteps = ["wallet", "subaccount", "permission"],
}: OnboardingDialogProps) {
  const {
    isConnected,
    universalAddress,
    subAccount,
    setConnected,
    setUniversalAddress,
    setSubAccount,
    setUserId,
    setIsCreator,
    setIsPremium,
  } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const steps = [
    {
      id: "wallet",
      title: "Connect Your Wallet",
      description: "Connect your Base Account to get started with BAD",
      icon: Wallet,
      action: connectWallet,
      completed: isConnected,
    },
    {
      id: "subaccount",
      title: "Create Sub-Account",
      description: "Set up a sub-account for automated subscription payments",
      icon: Shield,
      action: createSubAccount,
      completed: !!subAccount,
    },
    {
      id: "permission",
      title: "Setup Spend Permission",
      description: "Enable seamless recurring payments for subscriptions",
      icon: Zap,
      action: setupPermission,
      completed: false,
    },
  ].filter((step) => requiredSteps.includes(step.id as any))

  const progress = ((currentStep + 1) / steps.length) * 100

  async function connectWallet() {
    setIsProcessing(true)
    setError(null)
    try {
      const provider = sdk.getProvider()
      const accounts = await provider.request({ method: "eth_requestAccounts" })

      if (accounts && accounts.length > 0) {
        const address = accounts[0]
        setConnected(true)
        setUniversalAddress(address)

        // Sync with backend
        const response = await fetch("/api/auth/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        })

        if (response.ok) {
          const userData = await response.json()
          setUserId(userData.id)
          setIsCreator(userData.isCreator)
          setIsPremium(userData.isPremium)
          if (userData.subAccountAddress) {
            setSubAccount({
              address: userData.subAccountAddress,
              factory: userData.subAccountFactory,
              factoryData: userData.subAccountFactoryData,
            })
          }
        }

        setCurrentStep((prev) => prev + 1)
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet")
    } finally {
      setIsProcessing(false)
    }
  }

  async function createSubAccount() {
    setIsProcessing(true)
    setError(null)
    try {
      const provider = sdk.getProvider()
      const subAccountAddress = await provider.request({
        method: "wallet_createSubAccount",
        params: [{}],
      })

      if (subAccountAddress) {
        setSubAccount({ address: subAccountAddress as `0x${string}` })

        // Sync with backend
        await fetch("/api/auth/sub-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: universalAddress,
            subAccountAddress,
          }),
        })

        setCurrentStep((prev) => prev + 1)
      }
    } catch (err: any) {
      setError(err.message || "Failed to create sub-account")
    } finally {
      setIsProcessing(false)
    }
  }

  async function setupPermission() {
    setIsProcessing(true)
    setError(null)
    try {
      // This is a placeholder - actual implementation would create a spend permission
      // For now, we'll just complete the onboarding
      await new Promise((resolve) => setTimeout(resolve, 1500))
      onComplete()
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Failed to setup permission")
    } finally {
      setIsProcessing(false)
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to BAD</DialogTitle>
          <DialogDescription>Let's get you set up in just a few steps</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <Progress value={progress} className="h-2" />

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <currentStepData.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{currentStepData.title}</h3>
                  <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
                </div>
              </div>

              {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      index < currentStep ? "bg-primary/5" : index === currentStep ? "bg-primary/10" : "bg-muted/30"
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <div
                        className={`w-5 h-5 rounded-full border-2 ${
                          index === currentStep ? "border-primary" : "border-muted-foreground/30"
                        }`}
                      />
                    )}
                    <span className={`text-sm ${index <= currentStep ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={currentStepData.action}
                disabled={isProcessing || currentStepData.completed}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  "Processing..."
                ) : currentStepData.completed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    {currentStepData.title}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
