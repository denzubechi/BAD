import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const creators = await prisma.creatorProfile.findMany({
      orderBy: { subscriberCount: "desc" },
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
            address: true,
            creatorProfile: {
              select: {
                displayName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ creators });
  } catch (error) {
    console.error("Error fetching creators:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
