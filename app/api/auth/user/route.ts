import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          address: address.toLowerCase(),
          universalAddress: address.toLowerCase(),
        },
      })
    }

    return NextResponse.json({
      id: user.id,
      address: user.address,
      universalAddress: user.universalAddress,
      subAccountAddress: user.subAccountAddress,
      subAccountFactory: user.subAccountFactory,
      subAccountFactoryData: user.subAccountFactoryData,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      isCreator: user.isCreator,
      isPremium: user.isPremium,
    })
  } catch (error) {
    console.error("[v0] Error in auth/user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get("address")

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        creatorProfile: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: user.id,
      address: user.address,
      universalAddress: user.universalAddress,
      subAccountAddress: user.subAccountAddress,
      subAccountFactory: user.subAccountFactory,
      subAccountFactoryData: user.subAccountFactoryData,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      isCreator: user.isCreator,
      isPremium: user.isPremium,
      creatorProfile: user.creatorProfile,
    })
  } catch (error) {
    console.error("[v0] Error in auth/user GET:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
