import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const creator = await prisma.creatorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
            address: true,
          },
        },
      },
    })

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 })
    }

    return NextResponse.json({ creator })
  } catch (error) {
    console.error("[v0] Error fetching creator:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
