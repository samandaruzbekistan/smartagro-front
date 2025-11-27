"use client"

import { useCallback, useEffect, useState } from "react"
import { authApi } from "@/lib/api"
import { AUTH_CHANGE_EVENT, AuthUser, clearAuthSession, getAuthUser } from "@/lib/auth-storage"

export function useAuth() {
  // Start with null to avoid hydration mismatch - only read from localStorage after mount
  const [user, setUser] = useState<AuthUser | null>(null)
  const [mounted, setMounted] = useState(false)
  const isAuthenticated = Boolean(user)

  useEffect(() => {
    // Only read from localStorage after component mounts (client-side only)
    setMounted(true)
    setUser(getAuthUser())

    const handler = () => setUser(getAuthUser())
    window.addEventListener(AUTH_CHANGE_EVENT, handler)
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handler)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch (error) {
      console.warn("Logout request failed:", error)
    } finally {
      clearAuthSession()
      setUser(null)
    }
  }, [])

  return {
    user,
    isAuthenticated,
    logout,
  }
}

