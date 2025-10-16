"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Shield, Plus, Trash2, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Permission {
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

export function SpendPermissionManager() {
  const { subAccount, universalAddress } = useAuthStore()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState("")
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info")
  const [isCreating, setIsCreating] = useState(false)

  // Form state
  const [spender, setSpender] = useState("")
  const [token, setToken] = useState("")
  const [allowance, setAllowance] = useState("")
  const [period, setPeriod] = useState("30")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (universalAddress) {
      loadPermissions()
    }
  }, [universalAddress])

  const loadPermissions = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/permissions?address=${universalAddress}`)
      if (response.ok) {
        const data = await response.json()
        setPermissions(data.permissions)
      }
    } catch (error) {
      console.error("[v0] Error loading permissions:", error)
      setStatus("Failed to load permissions")
      setStatusType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const createPermission = async () => {
    if (!subAccount) {
      setStatus("Sub-account required to create permissions")
      setStatusType("error")
      return
    }

    if (!spender || !token || !allowance || !period) {
      setStatus("All fields are required")
      setStatusType("error")
      return
    }

    setIsCreating(true)
    setStatus("Creating spend permission...")
    setStatusType("info")

    try {
      const response = await fetch("/api/permissions/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: subAccount.address,
          spender,
          token,
          allowance,
          periodInDays: Number.parseInt(period),
          permissionType: "CREATOR_SUBSCRIPTION",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setStatus("Spend permission created successfully!")
        setStatusType("success")
        setDialogOpen(false)
        loadPermissions()
        // Reset form
        setSpender("")
        setToken("")
        setAllowance("")
        setPeriod("30")
      } else {
        const error = await response.json()
        setStatus(error.error || "Failed to create permission")
        setStatusType("error")
      }
    } catch (error) {
      console.error("[v0] Error creating permission:", error)
      setStatus("Failed to create permission")
      setStatusType("error")
    } finally {
      setIsCreating(false)
    }
  }

  const revokePermission = async (permissionHash: string) => {
    setStatus("Revoking permission...")
    setStatusType("info")

    try {
      const response = await fetch("/api/permissions/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionHash }),
      })

      if (response.ok) {
        setStatus("Permission revoked successfully!")
        setStatusType("success")
        loadPermissions()
      } else {
        const error = await response.json()
        setStatus(error.error || "Failed to revoke permission")
        setStatusType("error")
      }
    } catch (error) {
      console.error("[v0] Error revoking permission:", error)
      setStatus("Failed to revoke permission")
      setStatusType("error")
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatAllowance = (allowance: string) => {
    // Convert wei to a more readable format
    const value = BigInt(allowance)
    const eth = Number(value) / 1e18
    return eth.toFixed(6)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge variant="default">Active</Badge>
      case "REVOKED":
        return <Badge variant="destructive">Revoked</Badge>
      case "EXPIRED":
        return <Badge variant="secondary">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!subAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sub-Account Required</CardTitle>
          <CardDescription>You need to create a sub-account before managing spend permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <a href="/sub-account">Create Sub-Account</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {status && (
        <Alert variant={statusType === "error" ? "destructive" : "default"}>
          {statusType === "success" && <CheckCircle2 className="h-4 w-4" />}
          {statusType === "error" && <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Spend Permissions</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage automated payment permissions for subscriptions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Permission
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Spend Permission</DialogTitle>
              <DialogDescription>Set up a new spend permission for automated subscription payments</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="spender">Spender Address</Label>
                <Input
                  id="spender"
                  placeholder="0x..."
                  value={spender}
                  onChange={(e) => setSpender(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Token Address</Label>
                <Input
                  id="token"
                  placeholder="0x..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowance">Allowance (in wei)</Label>
                <Input
                  id="allowance"
                  placeholder="1000000000000000000"
                  value={allowance}
                  onChange={(e) => setAllowance(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period">Period (days)</Label>
                <Input
                  id="period"
                  type="number"
                  placeholder="30"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createPermission} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Permission"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="w-8 h-8" />
        </div>
      ) : permissions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-3">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">No Spend Permissions</h3>
              <p className="text-sm text-muted-foreground">
                Create your first spend permission to enable automated subscription payments
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {permissions.map((permission) => (
            <Card key={permission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {permission.permissionType.replace("_", " ")}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs">
                      {formatAddress(permission.permissionHash)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(permission.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Spender</Label>
                    <p className="font-mono text-xs mt-1">{formatAddress(permission.spender)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Token</Label>
                    <p className="font-mono text-xs mt-1">{formatAddress(permission.token)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Allowance</Label>
                    <p className="mt-1">{formatAllowance(permission.allowance)} tokens</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Period</Label>
                    <p className="mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {permission.period} days
                    </p>
                  </div>
                </div>
                {permission.status === "ACTIVE" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => revokePermission(permission.permissionHash)}
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Revoke Permission
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About Spend Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Spend permissions allow creators to automatically charge your sub-account for subscription renewals without
            requiring manual approval each time.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Set spending limits per permission</li>
            <li>Define time periods for recurring payments</li>
            <li>Revoke permissions at any time</li>
            <li>Track all active and past permissions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
