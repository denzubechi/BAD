"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store/auth-store"
import { sdk } from "@/lib/base-account"
import { Wallet, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function ConnectWallet() {
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
    disconnect,
  } = useAuthStore()
  const [isConnecting, setIsConnecting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Check if already connected on mount
    const checkConnection = async () => {
      try {
        const provider = sdk.getProvider()
        const accounts = await provider.request({ method: "eth_accounts" })
        if (accounts && accounts.length > 0) {
          setConnected(true)
          setUniversalAddress(accounts[0])
          await syncUserData(accounts[0])
        }
      } catch (error) {
        console.log("[v0] Wallet not connected or not available")
      }
    }
    checkConnection()
  }, [mounted, setConnected, setUniversalAddress])

  const syncUserData = async (address: string) => {
    try {
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
    } catch (error) {
      console.error("[v0] Error syncing user data:", error)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const provider = sdk.getProvider()
      const accounts = await provider.request({ method: "eth_requestAccounts" })

      if (accounts && accounts.length > 0) {
        const address = accounts[0]
        setConnected(true)
        setUniversalAddress(address)
        await syncUserData(address)
      }
    } catch (error) {
      console.error("[v0] Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!mounted) {
    return (
      <Button disabled>
        <Wallet className="w-4 h-4 mr-2" />
        Loading...
      </Button>
    )
  }

  if (!isConnected || !universalAddress) {
    return (
      <Button onClick={handleConnect} disabled={isConnecting}>
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Wallet className="w-4 h-4 mr-2" />
          {formatAddress(universalAddress)}
          {subAccount && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Sub
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/dashboard">Dashboard</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/profile">Profile</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/sub-account">{subAccount ? "Sub-Account" : "Create Sub-Account"}</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect}>
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
