import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { subscriberId, creatorId } = await request.json()

    if (!subscriberId || !creatorId) {
      return NextResponse.json({ error: "Subscriber ID and Creator ID are required" }, { status: 400 })
    }

    // Check if subscription already exists
    const existing = await prisma.subscription.findUnique({
      where: {
        subscriberId_creatorId: {
          subscriberId,
          creatorId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Subscription already exists" }, { status: 400 })
    }

    // Create subscription
    const nextRenewalDate = new Date()
    nextRenewalDate.setMonth(nextRenewalDate.getMonth() + 1)

    const subscription = await prisma.subscription.create({
      data: {
        subscriberId,
        creatorId,
        status: "ACTIVE",
        lastRenewalDate: new Date(),
        nextRenewalDate,
      },
    })

    // Update subscriber count
    await prisma.creatorProfile.update({
      where: { id: creatorId },
      data: { subscriberCount: { increment: 1 } },
    })

    return NextResponse.json({ subscription })
  } catch (error) {
    console.error("[v0] Error creating subscription:", error)
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 })
  }
}
