"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { setAuthSession } from "@/lib/auth-storage"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return
    setError(null)
    setLoading(true)
    try {
      const data = await authApi.login({ email, password })
      setAuthSession(data.user, data.token)
      router.push("/fields")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Kirish</h1>
        <p className="text-neutral-500 mt-2">Shaxsiy kabinetga kirish uchun email va parolingizni kiriting.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 focus:border-neutral-900 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
            Parol
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 focus:border-neutral-900 focus:outline-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Kirilmoqda..." : "Kirish"}
        </Button>
      </form>
      <p className="text-sm text-neutral-600">
        Hisobingiz yo‘qmi?{" "}
        <Link href="/auth/register" className="text-neutral-900 font-medium hover:underline">
          Ro‘yxatdan o‘ting
        </Link>
      </p>
    </div>
  )
}

