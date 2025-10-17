"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  TrendingUp,
  Zap,
  Shield,
  Users,
  ArrowRight,
  Sparkles,
  BarChart3,
  Lock,
  CheckCircle2,
  Star,
  Rocket,
  Globe,
  Layers,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

const features = [
  {
    icon: Zap,
    title: "Instant Subscriptions",
    description:
      "Subscribe to creators with one click using Base Spend Permissions. No manual payments every month.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Non-Custodial",
    description:
      "Your funds stay in your wallet. You control your subscriptions and can cancel anytime.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Premium Alpha",
    description:
      "Access exclusive trading signals, market analysis, and early protocol insights from top analysts.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Users,
    title: "Creator Economy",
    description:
      "Monetize your expertise with crypto-native subscriptions. No middlemen, no chargebacks.",
    gradient: "from-purple-500 to-pink-500",
  },
];

const stats = [
  { label: "Active Creators", value: "500+", icon: Users },
  { label: "Premium Articles", value: "10K+", icon: Layers },
  { label: "Subscribers", value: "25K+", icon: Star },
  { label: "Daily Signals", value: "100+", icon: TrendingUp },
];

// Floating orb component
function FloatingOrb({ delay = 0, duration = 20, size = 300, color = "blue" }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 bg-gradient-to-r ${
        color === "blue"
          ? "from-blue-500 to-cyan-500"
          : "from-purple-500 to-pink-500"
      }`}
      style={{
        width: size,
        height: size,
      }}
      animate={{
        x: [0, 100, 0],
        y: [0, -100, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration,
        repeat: Number.POSITIVE_INFINITY,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const scaleProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [articles, setArticles] = useState<any[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [articlesRes, creatorsRes] = await Promise.all([
          fetch("/api/articles?status=PUBLISHED"),
          fetch("/api/creators"),
        ]);

        if (articlesRes.ok) {
          const articlesData = await articlesRes.json();
          setArticles(articlesData.articles?.slice(0, 3) || []);
        }

        if (creatorsRes.ok) {
          const creatorsData = await creatorsRes.json();
          setCreators(creatorsData.creators?.slice(0, 4) || []);
        }
      } catch (error) {
        console.error("[v0] Error fetching landing page data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 origin-left z-50"
        style={{ scaleX: scaleProgress }}
      />

      <main>
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950" />
            <FloatingOrb delay={0} duration={25} size={400} color="blue" />
            <FloatingOrb delay={5} duration={30} size={300} color="purple" />
            <FloatingOrb delay={10} duration={20} size={350} color="blue" />

            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          <div className="container mx-auto px-4 py-32 relative z-10">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center mb-8"
              >
                <Badge className="px-4 py-2 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 backdrop-blur-xl">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Powered by Base Account Spend Permissions
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-6xl md:text-8xl font-bold text-center mb-6 leading-tight"
                style={{
                  transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                  transition: "transform 0.3s ease-out",
                }}
              >
                <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  Premium Web3
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Publishing Platform
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-400 text-center max-w-3xl mx-auto mb-12 leading-relaxed"
              >
                Decentralized premium financial newsletter and trading signals
                for the Base ecosystem. Subscribe with crypto, no credit cards
                required.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg group relative overflow-hidden"
                  asChild
                >
                  <Link href="/explore">
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500"
                      initial={{ x: "100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative flex items-center">
                      Explore Content
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </Button>
                {/* <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-700 hover:border-blue-500 bg-slate-900/50 backdrop-blur-xl px-8 py-6 text-lg group"
                  asChild
                >
                  <Link href="/become-creator">
                    <Rocket className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Become a Creator
                  </Link>
                </Button> */}
              </motion.div>

              {/* Animated Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6"
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 text-center">
                      <stat.icon className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-400">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-6 h-10 border-2 border-slate-700 rounded-full flex items-start justify-center p-2"
            >
              <motion.div className="w-1 h-2 bg-blue-500 rounded-full" />
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section - Bento Grid */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Why Choose
                </span>{" "}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  BAD?
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                The first truly crypto-native publishing platform with automated
                subscriptions
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group relative"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                  />
                  <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 h-full">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Sample Articles Section */}
        <section className="py-32 relative">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex items-center justify-between mb-16"
            >
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Latest Insights
                  </span>
                </h2>
                <p className="text-slate-400 text-lg">
                  Premium analysis from top Base ecosystem analysts
                </p>
              </div>
              <Button
                variant="ghost"
                className="hidden md:flex text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                asChild
              >
                <Link href="/explore">
                  View All
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden animate-pulse"
                  >
                    <div className="aspect-video bg-slate-800" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-slate-800 rounded w-3/4" />
                      <div className="h-3 bg-slate-800 rounded w-full" />
                      <div className="h-3 bg-slate-800 rounded w-2/3" />
                    </div>
                  </div>
                ))
              ) : articles.length > 0 ? (
                articles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Link
                      href={`/articles/${article.slug}`}
                      className="block relative"
                    >
                      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden group-hover:border-blue-500/50 transition-all duration-300">
                        <div className="relative aspect-video overflow-hidden">
                          <img
                            src={
                              article.coverImage ||
                              "/placeholder.svg?height=400&width=600&query=article"
                            }
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                          {article.isPremium && (
                            <Badge className="absolute top-4 right-4 bg-blue-500 text-white border-0">
                              <Lock className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                          <div className="absolute bottom-4 left-4 right-4">
                            <Badge
                              variant="secondary"
                              className="bg-slate-800/80 backdrop-blur-xl text-xs mb-2"
                            >
                              Article
                            </Badge>
                          </div>
                        </div>

                        <div className="p-6">
                          <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
                            {article.title}
                          </h3>

                          <p className="text-slate-400 mb-4 line-clamp-2 text-sm leading-relaxed">
                            {article.excerpt ||
                              article.content?.substring(0, 100)}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                                {getInitials(
                                  article.author?.username ||
                                    article.author?.creatorProfile?.displayName
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-white">
                                  {article.author?.creatorProfile
                                    ?.displayName || "Anonymous"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {new Date(
                                    article.publishedAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-xs text-slate-500">
                              {article.viewCount || 0} views
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-400">
                    No articles published yet. Check back soon!
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Top Creators Section */}
        <section className="py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                  Top Creators
                </span>
              </h2>
              <p className="text-slate-400 text-lg">
                Follow the best analysts in the Base ecosystem
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 animate-pulse"
                  >
                    <div className="w-24 h-24 rounded-full bg-slate-800 mx-auto mb-4" />
                    <div className="h-4 bg-slate-800 rounded w-3/4 mx-auto mb-2" />
                    <div className="h-3 bg-slate-800 rounded w-full mb-4" />
                    <div className="h-8 bg-slate-800 rounded" />
                  </div>
                ))
              ) : creators.length > 0 ? (
                creators.map((creator, index) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 text-center group-hover:border-blue-500/50 transition-all duration-300">
                      <div className="relative inline-block mb-4 group">
                        <div
                          className="relative w-24 h-24 rounded-full border-4 border-slate-800 bg-gray-600 flex items-center justify-center 
               text-white text-3xl font-bold transition-colors 
               group-hover:border-blue-500 group-hover:bg-blue-700"
                        >
                          <span className="relative z-10">
                            {getInitials(
                              creator.user.creatorProfile?.displayName || "Anon"
                            )}
                          </span>
                        </div>

                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center border-4 border-slate-900">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1">
                        {creator.displayName}
                      </h3>
                      <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                        {creator.description || "Creator on Base ecosystem"}
                      </p>

                      <div className="flex items-center justify-center gap-4 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-800">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {creator.subscriberCount?.toLocaleString() || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          {creator.articleCount || 0}
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-blue-400 mb-3">
                        {creator.subscriptionPrice
                          ? `${creator.subscriptionPrice} USD/month`
                          : "Free"}
                      </div>

                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                        asChild
                      >
                        <Link href={`/subscribe/${creator.id}`}>Subscribe</Link>
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-slate-400">
                    No creators yet. Be the first to join!
                  </p>
                </div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <Button
                variant="outline"
                className="border-slate-700 hover:border-blue-500 bg-slate-900/50 backdrop-blur-xl"
                asChild
              >
                <Link href="/explore">
                  View All Creators
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 relative">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-12 text-center">
                <Globe className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                    Ready to Get Started?
                  </span>
                </h2>
                <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of traders and analysts using Base Analyst
                  Daily for premium Web3 insights
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {/* <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8"
                    asChild
                  >
                    <Link href="/become-creator">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Become a Creator
                    </Link>
                  </Button> */}
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-slate-700 hover:border-blue-500 bg-slate-900/50 backdrop-blur-xl px-8"
                    asChild
                  >
                    <Link href="/explore">
                      Explore Content
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
