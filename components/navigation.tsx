"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/store/auth-store"
import { ConnectWallet } from "@/components/connect-wallet"
import { Sparkles, BookOpen, TrendingUp, Users, LayoutDashboard, CreditCard, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const { isConnected } = useAuthStore()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()
  const pathname = usePathname()

  const backgroundColor = useTransform(scrollY, [0, 100], ["rgba(2, 6, 23, 0.0)", "rgba(2, 6, 23, 0.8)"])

  const backdropBlur = useTransform(scrollY, [0, 100], ["blur(0px)", "blur(20px)"])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/explore", label: "Explore", icon: BookOpen },
    { href: "/creators", label: "Creators", icon: Users },
    { href: "/trending", label: "Trending", icon: TrendingUp },
  ]

  const authenticatedLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  ]

  return (
    <>
      <motion.nav
        style={{
          backgroundColor,
          backdropFilter: backdropBlur,
        }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled && "border-b border-white/10 shadow-2xl shadow-blue-500/5",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <motion.div whileHover={{ rotate: 180, scale: 1.1 }} transition={{ duration: 0.3 }} className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  BAD
                </span>
                <span className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Base Analyst Daily</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "relative group text-slate-300 hover:text-white transition-colors",
                        isActive && "text-white",
                      )}
                    >
                      <link.icon className="w-4 h-4 mr-2" />
                      {link.label}
                      {isActive && (
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"
                          layoutId="navbar-indicator"
                        />
                      )}
                    </Button>
                  </Link>
                )
              })}

              {/* Authenticated Links - Only show when connected */}
              {isConnected && (
                <>
                  <div className="w-px h-6 bg-slate-700 mx-2" />
                  {authenticatedLinks.map((link) => {
                    const isActive = pathname === link.href
                    return (
                      <Link key={link.href} href={link.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "relative group text-slate-300 hover:text-white transition-colors",
                            isActive && "text-white",
                          )}
                        >
                          <link.icon className="w-4 h-4 mr-2" />
                          {link.label}
                          {isActive && (
                            <motion.div
                              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"
                              layoutId="navbar-indicator-auth"
                            />
                          )}
                        </Button>
                      </Link>
                    )
                  })}
                </>
              )}
            </div>

            {/* CTA */}
            <div className="hidden md:flex items-center gap-3">
              <ConnectWallet />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: isMobileMenuOpen ? "auto" : 0,
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          className="md:hidden overflow-hidden border-t border-white/10"
        >
          <div className="px-4 py-4 space-y-2 bg-slate-950/95 backdrop-blur-xl">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-slate-300 hover:text-white",
                      isActive && "text-white bg-slate-800",
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className="w-4 h-4 mr-2" />
                    {link.label}
                  </Button>
                </Link>
              )
            })}

            {isConnected && (
              <>
                <div className="h-px bg-slate-800 my-2" />
                {authenticatedLinks.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link key={link.href} href={link.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-slate-300 hover:text-white",
                          isActive && "text-white bg-slate-800",
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <link.icon className="w-4 h-4 mr-2" />
                        {link.label}
                      </Button>
                    </Link>
                  )
                })}
              </>
            )}

            <div className="pt-2">
              <ConnectWallet />
            </div>
          </div>
        </motion.div>
      </motion.nav>

      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-16 sm:h-20" />
    </>
  )
}
