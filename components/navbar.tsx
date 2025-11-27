"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, user, logout } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleLogout() {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    await logout()
    setIsLoggingOut(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-semibold text-lg tracking-tight">
            Smart Agro
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#featured" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Tanlanganlar
            </Link>
            <Link href="/fields" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Fields
            </Link>
                <Link href="/soil-analysis" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Soil Analysis
                </Link>
                <Link href="/plants" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Ekin Tavsiyasi
                </Link>
            <Link href="/machines" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Equipment
            </Link>
            <Link href="/expenses" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Expenses
            </Link>
            <Link href="/analytics" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Analytics
            </Link>
            {mounted && isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Hi, {user?.name || "Farmer"}
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? "Signing out..." : "Logout"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/register"
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Create account
                </Link>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium px-4 py-2 rounded-full border border-neutral-300 hover:border-neutral-900 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-6 flex flex-col gap-4 border-t border-neutral-200 pt-4">
            <Link href="/#featured" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Tanlanganlar
            </Link>
            <Link href="/fields" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Fields
            </Link>
                <Link href="/soil-analysis" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Soil Analysis
                </Link>
                <Link href="/plants" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Ekin Tavsiyasi
                </Link>
            <Link href="/machines" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Equipment
            </Link>
            <Link href="/expenses" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Expenses
            </Link>
            <Link href="/analytics" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
              Analytics
            </Link>
            {mounted && isAuthenticated ? (
              <>
                <Link href="/profile" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Profile
                </Link>
                <button
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors text-left"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Signing out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
