import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authorId = searchParams.get("authorId");
    const status = searchParams.get("status");

    const where: any = {};
    if (authorId) where.authorId = authorId;
    if (status) where.status = status;

    const articles = await prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
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

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("[v0] Error fetching articles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      authorId,
      title,
      slug,
      excerpt,
      content,
      coverImage,
      isPremium,
      status,
      publishedAt,
    } = await request.json();

    if (!authorId || !title || !slug || !content) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.article.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const article = await prisma.article.create({
      data: {
        authorId,
        title,
        slug,
        excerpt,
        content,
        coverImage,
        isPremium: isPremium || false,
        status: status || "DRAFT",
        publishedAt: publishedAt ? new Date(publishedAt) : null,
      },
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error("[v0] Error creating article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
