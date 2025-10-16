import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subscriberId = searchParams.get("subscriberId")
    const creatorId = searchParams.get("creatorId")

    const where: any = {}
    if (subscriberId) where.subscriberId = subscriberId
    if (creatorId) where.creatorId = creatorId

    const subscriptions = await prisma.subscription.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          include: {
            user: {
              select: {
                username: true,
                avatar: true,
                address: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error("[v0] Error fetching subscriptions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
