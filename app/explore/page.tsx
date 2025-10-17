"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  Users,
  BarChart3,
  Lock,
  Sparkles,
  Filter,
  Eye,
} from "lucide-react";
import { ConnectWallet } from "@/components/connect-wallet";
import { getInitials } from "@/lib/utils";

const categories = ["All", "DeFi", "NFTs", "Social", "Trading", "Analysis"];

interface Creator {
  id: string;
  displayName: string;
  description: string | null;
  subscriptionPrice: string;
  subscriberCount: number;
  articleCount: number;
  user: {
    username: string | null;
    avatar: string | null;
    address: string;
  };
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  isPremium: boolean;
  viewCount: number;
  publishedAt: string | null;
  author: {
    username: string | null;
    avatar: string | null;
    creatorProfile?: {
      displayName: string;
    };
  };
}

export default function ExplorePage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoadingCreators, setIsLoadingCreators] = useState(true);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    loadCreators();
    loadArticles();
  }, []);

  const loadCreators = async () => {
    try {
      const response = await fetch("/api/creators");
      if (response.ok) {
        const data = await response.json();
        setCreators(data.creators || []);
      }
    } catch (error) {
      console.error("[v0] Error loading creators:", error);
    } finally {
      setIsLoadingCreators(false);
    }
  };

  const loadArticles = async () => {
    try {
      const response = await fetch("/api/articles?status=PUBLISHED");
      if (response.ok) {
        const data = await response.json();
        setArticles(data.articles || []);
      }
    } catch (error) {
      console.error("[v0] Error loading articles:", error);
    } finally {
      setIsLoadingArticles(false);
    }
  };

  const formatPrice = (price: string) => {
    const value = BigInt(price);
    const eth = Number(value) / 1e18;
    return `${eth.toFixed(4)} ETH/month`;
  };

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch =
      searchQuery === "" ||
      creator.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const featuredArticles = articles.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center mb-8"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Explore Creators
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Discover premium content from top Base ecosystem analysts and
                traders
              </p>

              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search creators, topics, or articles..."
                  className="pl-12 h-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-2 flex-wrap"
            >
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={
                    category === selectedCategory ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Featured Articles */}
        {!isLoadingArticles && featuredArticles.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h3 className="text-2xl font-bold mb-2">Featured Articles</h3>
                <p className="text-muted-foreground">
                  Trending insights from our top creators
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {featuredArticles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
                    onClick={() =>
                      (window.location.href = `/articles/${article.slug}`)
                    }
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={
                          article.coverImage ||
                          "/placeholder.svg?height=200&width=400"
                        }
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {article.isPremium && (
                        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                          <Lock className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="text-xs">
                          <Eye className="w-3 h-3 mr-1" />
                          {article.viewCount}
                        </Badge>
                      </div>

                      <h4 className="font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h4>

                      {article.excerpt && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                          {getInitials(
                            article.author.creatorProfile?.displayName || "Anon"
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {article.author.creatorProfile?.displayName ||
                            "Anonymous"}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Creators Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h3 className="text-2xl font-bold mb-2">All Creators</h3>
                <p className="text-muted-foreground">
                  {isLoadingCreators
                    ? "Loading..."
                    : `${filteredCreators.length} creators available`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Trending
                </Button>
              </div>
            </motion.div>

            {isLoadingCreators ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="w-8 h-8" />
              </div>
            ) : filteredCreators.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No creators found. Be the first to become a creator!
                </p>
                <Button asChild className="mt-4">
                  <Link href="/become-creator">Become a Creator</Link>
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCreators.map((creator, index) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    className="group rounded-xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all"
                  >
                    {/* Banner */}
                    <div className="relative h-32 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent" />
                    </div>

                    {/* Profile */}
                    <div className="p-6 -mt-10 relative">
                      <div className="relative inline-block mb-4">
                        {creator.user.avatar ? (
                          <img
                            src={creator.user.avatar || "/placeholder.svg"}
                            alt={creator.displayName}
                            className="w-20 h-20 rounded-full border-4 border-card"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full border-4 border-card bg-primary/10 flex items-center justify-center">
                            <Users className="w-8 h-8 text-primary" />
                          </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                          <Sparkles className="w-3 h-3 text-primary-foreground" />
                        </div>
                      </div>

                      <h4 className="font-semibold text-lg mb-1">
                        {creator.displayName}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {creator.description || "No description available"}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {creator.subscriberCount.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          {creator.articleCount} articles
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <span className="text-sm font-medium">
                          {creator.subscriptionPrice} USD/month
                        </span>
                        <Button size="sm" asChild>
                          <Link href={`/subscribe/${creator.id}`}>
                            Subscribe
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
