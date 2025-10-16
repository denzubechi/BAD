import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getPermissionByHash, revokePermission } from "@/lib/spend-permissions"

export async function POST(request: NextRequest) {
  try {
    const { permissionHash } = await request.json()

    if (!permissionHash) {
      return NextResponse.json({ error: "Permission hash is required" }, { status: 400 })
    }

    // Get the permission from the SDK
    const permission = await getPermissionByHash(permissionHash as `0x${string}`)

    // Revoke the permission
    const result = await revokePermission(permission)

    if (!result.success) {
      return NextResponse.json({ error: "Failed to revoke permission" }, { status: 500 })
    }

    // Update the permission status in the database
    await prisma.spendPermission.update({
      where: { permissionHash },
      data: { status: "REVOKED" },
    })

    return NextResponse.json({
      success: true,
      hash: result.hash,
    })
  } catch (error) {
    console.error("[v0] Error revoking permission:", error)
    return NextResponse.json({ error: "Failed to revoke permission" }, { status: 500 })
  }
}
