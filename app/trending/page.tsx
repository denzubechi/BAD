"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { TrendingUp, Eye, Lock, Flame, Clock, Star } from "lucide-react"

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  isPremium: boolean
  viewCount: number
  publishedAt: string | null
  author: {
    username: string | null
    avatar: string | null
  }
}

export default function TrendingPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<"today" | "week" | "month">("today")

  useEffect(() => {
    loadTrendingArticles()
  }, [timeFilter])

  const loadTrendingArticles = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/articles?status=PUBLISHED")
      if (response.ok) {
        const data = await response.json()
        // Sort by view count for trending
        const sorted = (data.articles || []).sort((a: Article, b: Article) => b.viewCount - a.viewCount)
        setArticles(sorted)
      }
    } catch (error) {
      console.error("[v0] Error loading trending articles:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Recently"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-orange-500/5 to-transparent">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center mb-8"
            >
              <Badge className="mb-4 bg-orange-500/10 text-orange-500 border-orange-500/20">
                <Flame className="w-3 h-3 mr-1" />
                Hot Content
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Trending Now</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Discover the most popular content in the Base ecosystem right now
              </p>

              {/* Time Filters */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant={timeFilter === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeFilter("today")}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Today
                </Button>
                <Button
                  variant={timeFilter === "week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeFilter("week")}
                >
                  This Week
                </Button>
                <Button
                  variant={timeFilter === "month" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeFilter("month")}
                >
                  This Month
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Trending Articles */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-2xl font-bold mb-2">Top Articles</h2>
              <p className="text-muted-foreground">
                {isLoading ? "Loading..." : `${articles.length} trending articles`}
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="w-8 h-8" />
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No trending articles yet.</p>
                <Button asChild>
                  <Link href="/explore">Explore All Content</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {articles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 5 }}
                    className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() => (window.location.href = `/articles/${article.slug}`)}
                  >
                    <div className="flex flex-col md:flex-row gap-4 p-4">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                          <span className="text-xl font-bold text-white">#{index + 1}</span>
                        </div>
                      </div>

                      {/* Cover Image */}
                      {article.coverImage && (
                        <div className="relative w-full md:w-48 aspect-video md:aspect-square overflow-hidden rounded-lg bg-muted flex-shrink-0">
                          <img
                            src={article.coverImage || "/placeholder.svg"}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {article.isPremium && (
                            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                              <Lock className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>

                        {article.excerpt && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.excerpt}</p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {article.author.avatar ? (
                              <img
                                src={article.author.avatar || "/placeholder.svg"}
                                alt={article.author.username || "Author"}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-primary/10" />
                            )}
                            <span>{article.author.username || "Anonymous"}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {article.viewCount.toLocaleString()} views
                          </div>

                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                            {formatDate(article.publishedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <Star className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Want to See Your Content Here?</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Become a creator and share your insights with thousands of Base ecosystem enthusiasts
              </p>
              <Button size="lg" asChild>
                <Link href="/become-creator">Start Creating</Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}
