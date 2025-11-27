"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { authApi } from "@/lib/api"
import { useAuth } from "@/hooks/use-auth"
import { setAuthSession } from "@/lib/auth-storage"
import { User, Mail, Lock, Save } from "lucide-react"

export function ProfilePage() {
  const { user: currentUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Profile form
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    } else if (currentUser) {
      setName(currentUser.name)
      setEmail(currentUser.email)
    }
  }, [user, currentUser])

  async function loadProfile() {
    try {
      setLoading(true)
      const data = await authApi.profile()
      if (data && typeof data === "object" && "id" in data) {
        setUser(data)
      } else {
        throw new Error("Invalid profile data received")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profilni yuklashda xatolik yuz berdi")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const updated = await authApi.updateProfile({ name, email })
      if (updated && typeof updated === "object" && "id" in updated) {
        setUser(updated)
        // Update stored user data
        const token = localStorage.getItem("smartfarm.authToken")
        if (token) {
          setAuthSession(updated, token)
        }
        setSuccess("Profil muvaffaqiyatli yangilandi")
      } else {
        throw new Error("Noto‘g‘ri profil ma’lumotlari")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Profilni yangilashda xatolik yuz berdi")
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdatePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (passwordSaving) return

    if (newPassword !== confirmPassword) {
      setError("Parollar mos kelmadi")
      return
    }

    if (newPassword.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo‘lishi kerak")
      return
    }

    setError(null)
    setSuccess(null)
    setPasswordSaving(true)

    try {
      await authApi.updatePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      setSuccess("Parol muvaffaqiyatli yangilandi")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Parolni yangilashda xatolik yuz berdi")
    } finally {
      setPasswordSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profil</h1>
          <p className="text-muted-foreground mt-1">Shaxsiy hisob sozlamalarini boshqaring</p>
        </div>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Profil yuklanmoqda...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profil</h1>
        <p className="text-muted-foreground mt-1">Profil ma’lumotlarini yangilang va parolni o‘zgartiring</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>
      )}
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">{success}</div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profil ma’lumotlari
            </CardTitle>
            <CardDescription>Ismingiz va email manzilingizni yangilang</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  To‘liq ism
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button type="submit" disabled={saving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {saving ? "Saqlanmoqda..." : "O‘zgarishlarni saqlash"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Parolni o‘zgartirish
            </CardTitle>
            <CardDescription>Hisob xavfsizligi uchun parolni yangilang</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-foreground mb-2">
                  Joriy parol
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">
                  Yangi parol
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Yangi parolni tasdiqlash
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button type="submit" disabled={passwordSaving} className="w-full">
                <Lock className="w-4 h-4 mr-2" />
                {passwordSaving ? "Yangilanmoqda..." : "Parolni yangilash"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Hisob ma’lumotlari
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Foydalanuvchi ID</dt>
              <dd className="text-sm text-foreground">{user?.id || currentUser?.id || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Email</dt>
              <dd className="text-sm text-foreground">{user?.email || currentUser?.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Ism</dt>
              <dd className="text-sm text-foreground">{user?.name || currentUser?.name || "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}

