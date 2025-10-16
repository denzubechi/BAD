import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />
          </div>
          <h1 className="relative text-9xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
          Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            asChild
          >
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="border-slate-700 hover:border-blue-500 bg-transparent" asChild>
            <Link href="/explore">
              <Search className="w-5 h-5 mr-2" />
              Explore Content
            </Link>
          </Button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-sm text-slate-500 mb-4">Quick Links</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href="/dashboard" className="text-slate-400 hover:text-blue-400 transition-colors">
              Dashboard
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/subscriptions" className="text-slate-400 hover:text-blue-400 transition-colors">
              Subscriptions
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/become-creator" className="text-slate-400 hover:text-blue-400 transition-colors">
              Become a Creator
            </Link>
            <span className="text-slate-700">•</span>
            <Link href="/support" className="text-slate-400 hover:text-blue-400 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
