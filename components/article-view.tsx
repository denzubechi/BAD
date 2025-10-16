"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/lib/store/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { PremiumContentGate } from "./premium-content-gate"
import { ConnectWallet } from "./connect-wallet"

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  coverImage: string | null
  isPremium: boolean
  viewCount: number
  publishedAt: string | null
  author: {
    id: string
    username: string | null
    avatar: string | null
    address: string
  }
}

interface ArticleViewProps {
  article: Article
}

export function ArticleView({ article }: ArticleViewProps) {
  const { userId, isPremium, isConnected, subAccount } = useAuthStore()
  const [hasAccess, setHasAccess] = useState(false)
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)
  const isAuthor = userId === article.author.id

  useEffect(() => {
    checkAccess()
  }, [userId, isPremium, article.id, article.author.id])

  const checkAccess = async () => {
    setIsCheckingAccess(true)

    // Author always has access
    if (isAuthor) {
      setHasAccess(true)
      setIsCheckingAccess(false)
      return
    }

    // Non-premium articles are accessible to everyone
    if (!article.isPremium) {
      setHasAccess(true)
      setIsCheckingAccess(false)
      return
    }

    // For premium articles, check if user has active subscription
    if (userId) {
      try {
        const response = await fetch(`/api/subscriptions?subscriberId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          const hasActiveSubscription = data.subscriptions.some(
            (sub: any) => sub.creatorId === article.author.id && sub.status === "ACTIVE",
          )
          setHasAccess(hasActiveSubscription)
        }
      } catch (error) {
        console.error("[v0] Error checking subscription:", error)
      }
    }

    setIsCheckingAccess(false)
  }

  const formatDate = (date: string | null) => {
    if (!date) return "Draft"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const estimatedReadTime = Math.ceil(article.content.split(" ").length / 200)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <ConnectWallet />
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Cover Image */}
        {article.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-video rounded-2xl overflow-hidden mb-8 bg-muted"
          >
            <img
              src={article.coverImage || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            {article.isPremium && (
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">Premium Content</Badge>
            )}
          </motion.div>
        )}

        {/* Article Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-6 mb-8"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {article.isPremium && <Badge variant="default">Premium</Badge>}
            <Badge variant="outline" className="gap-1">
              <Eye className="w-3 h-3" />
              {article.viewCount.toLocaleString()} views
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {estimatedReadTime} min read
            </Badge>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-balance leading-tight">{article.title}</h1>

          {article.excerpt && (
            <p className="text-xl text-muted-foreground text-balance leading-relaxed">{article.excerpt}</p>
          )}

          {/* Author Info */}
          <div className="flex items-center justify-between py-6 border-y border-border">
            <div className="flex items-center gap-4">
              {article.author.avatar ? (
                <img
                  src={article.author.avatar || "/placeholder.svg"}
                  alt={article.author.username || "Author"}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary/10" />
              )}
              <div>
                <p className="font-semibold">
                  {article.author.username ||
                    `${article.author.address.slice(0, 6)}...${article.author.address.slice(-4)}`}
                </p>
                {article.publishedAt && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(article.publishedAt)}
                  </p>
                )}
              </div>
            </div>

            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>

        {/* Article Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isCheckingAccess ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading content...</p>
                </div>
              </CardContent>
            </Card>
          ) : hasAccess ? (
            <Card className="border-0 shadow-none">
              <CardContent className="pt-6 px-0">
                <article className="prose prose-lg prose-neutral dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed">{article.content}</div>
                </article>
              </CardContent>
            </Card>
          ) : (
            <PremiumContentGate creatorId={article.author.id} creatorName={article.author.username || undefined}>
              {/* This won't be shown, but required for component structure */}
              <div />
            </PremiumContentGate>
          )}
        </motion.div>

        {/* Author CTA */}
        {hasAccess && !isAuthor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12"
          >
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-center gap-6">
                  {article.author.avatar ? (
                    <img
                      src={article.author.avatar || "/placeholder.svg"}
                      alt={article.author.username || "Author"}
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-primary/10" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Written by {article.author.username || "Anonymous"}</h3>
                    <p className="text-muted-foreground mb-4">
                      Get access to all premium content and exclusive insights
                    </p>
                    <Button asChild>
                      <Link href={`/subscribe/${article.author.id}`}>Subscribe for More</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
}
