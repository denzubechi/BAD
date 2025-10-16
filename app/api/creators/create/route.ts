import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { userId, displayName, description, subscriptionPrice, tokenAddress } = await request.json()

    if (!userId || !displayName || !subscriptionPrice || !tokenAddress) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 })
    }

    // Check if user already has a creator profile
    const existing = await prisma.creatorProfile.findUnique({
      where: { userId },
    })

    if (existing) {
      return NextResponse.json({ error: "Creator profile already exists" }, { status: 400 })
    }

    // Create creator profile
    const profile = await prisma.creatorProfile.create({
      data: {
        userId,
        displayName,
        description,
        subscriptionPrice,
        tokenAddress: tokenAddress.toLowerCase(),
      },
    })

    // Update user to mark as creator
    await prisma.user.update({
      where: { id: userId },
      data: { isCreator: true },
    })

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("[v0] Error creating creator profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
