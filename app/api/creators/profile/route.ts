import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("[v0] Error fetching creator profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
