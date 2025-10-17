import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createSpendPermission } from "@/lib/spend-permissions"

export async function POST(request: NextRequest) {
  try {
    const { account, spender, token, allowance, periodInDays, permissionType } = await request.json()

    if (!account || !spender || !token || !allowance || !periodInDays) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Create the spend permission using the SDK
    const permission = await createSpendPermission({
      account: account as `0x${string}`,
      spender: spender as `0x${string}`,
      token: token as `0x${string}`,
      allowance: BigInt(allowance),
      periodInDays,
    })

    // Find the user by sub-account address
    const user = await prisma.user.findFirst({
      where: { subAccountAddress: account.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Store the permission in the database
    const dbPermission = await prisma.spendPermission.create({
      data: {
        userId: user.id,
        permissionHash: permission.permissionHash?.toLowerCase(),
        spender: spender.toLowerCase(),
        token: token.toLowerCase(),
        allowance: allowance.toString(),
        period: periodInDays,
        start: permission.start.toString(),
        end: permission.end.toString(),
        salt: permission.salt.toString(),
        extraData: permission.extraData || null,
        status: "ACTIVE",
        permissionType: permissionType || "CREATOR_SUBSCRIPTION",
      },
    })

    return NextResponse.json({
      permission: dbPermission,
      sdkPermission: permission,
    })
  } catch (error) {
    console.error("[v0] Error creating permission:", error)
    return NextResponse.json({ error: "Failed to create permission" }, { status: 500 })
  }
}
