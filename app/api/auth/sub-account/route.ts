import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { address, subAccountAddress, subAccountFactory, subAccountFactoryData } = await request.json()

    if (!address || !subAccountAddress) {
      return NextResponse.json({ error: "Address and sub-account address are required" }, { status: 400 })
    }

    // Update user with sub-account info
    const user = await prisma.user.update({
      where: { address: address.toLowerCase() },
      data: {
        subAccountAddress: subAccountAddress.toLowerCase(),
        subAccountFactory: subAccountFactory?.toLowerCase(),
        subAccountFactoryData,
      },
    })

    return NextResponse.json({
      id: user.id,
      address: user.address,
      subAccountAddress: user.subAccountAddress,
      subAccountFactory: user.subAccountFactory,
      subAccountFactoryData: user.subAccountFactoryData,
    })
  } catch (error) {
    console.error("[v0] Error updating sub-account:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
