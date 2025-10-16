import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get creator profile
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 })
    }

    // Get subscribers
    const subscribers = await prisma.subscription.findMany({
      where: { creatorId: profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        subscriber: {
          select: {
            username: true,
            avatar: true,
            address: true,
          },
        },
      },
    })

    return NextResponse.json({ subscribers })
  } catch (error) {
    console.error("[v0] Error fetching subscribers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
