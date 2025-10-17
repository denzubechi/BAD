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
  Users,
  BarChart3,
  Sparkles,
  TrendingUp,
  Star,
} from "lucide-react";

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

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCreators();
  }, []);

  const loadCreators = async () => {
    try {
      const response = await fetch("/api/creators");
      if (response.ok) {
        const data = await response.json();
        setCreators(data.creators || []);
      }
    } catch (error) {
      console.error(" Error loading creators:", error);
    } finally {
      setIsLoading(false);
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
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Star className="w-3 h-3 mr-1" />
                Featured Creators
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Discover Top Creators
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Subscribe to premium content from the best analysts and traders
                in the Base ecosystem
              </p>

              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search creators..."
                  className="pl-12 h-12 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>
          </div>
        </section>

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
                <h2 className="text-2xl font-bold mb-2">All Creators</h2>
                <p className="text-muted-foreground">
                  {isLoading
                    ? "Loading..."
                    : `${filteredCreators.length} creators available`}
                </p>
              </div>

              <Button variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Sort by Trending
              </Button>
            </motion.div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Spinner className="w-8 h-8" />
              </div>
            ) : filteredCreators.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "No creators found matching your search."
                    : "No creators found."}
                </p>
                <Button asChild>
                  <Link href="/become-creator">Become the First Creator</Link>
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

                      <h3 className="font-semibold text-lg mb-1">
                        {creator.displayName}
                      </h3>
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
                          {creator.articleCount}
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

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl font-bold mb-4">Become a Creator</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Share your expertise and earn crypto by publishing premium
                content for the Base community
              </p>
              <Button size="lg" asChild>
                <Link href="/become-creator">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Creating
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
