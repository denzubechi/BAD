import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article-view";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
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

  if (!article) {
    notFound();
  }

  await prisma.article.update({
    where: { id: article.id },
    data: { viewCount: { increment: 1 } },
  });

  return <ArticleView article={article} />;
}
