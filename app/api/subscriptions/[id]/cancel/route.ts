import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { creator: true },
    })

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Update subscription status
    await prisma.subscription.update({
      where: { id },
      data: {
        status: "CANCELLED",
        endDate: new Date(),
      },
    })

    // Update subscriber count
    await prisma.creatorProfile.update({
      where: { id: subscription.creatorId },
      data: { subscriberCount: { decrement: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error canceling subscription:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}
