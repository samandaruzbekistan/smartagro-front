import type { ReactNode } from "react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      <div className="hidden md:flex flex-col justify-between bg-neutral-900 text-white p-0">
        <div className="relative w-full h-full">
          <img
            src="/photo_2025-11-27_14-30-38.jpg"
            alt="Fermer platformasi"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 p-10 flex flex-col justify-between">
            <div>
              <Link href="/" className="text-2xl font-semibold tracking-tight">
                Smart Agro
              </Link>
              <p className="mt-4 text-neutral-200">
                Tahlil va avtomatlashgan boshqaruv yordamida fermangizning barcha jarayonlarini nazorat qiling.
              </p>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold">Birgalikda boshqariladigan fermer platformasi</h2>
              <p className="text-neutral-200">
                Dalalar, texnika, tuproq tahlili, jamoa va moliyaviy ko‘rsatkichlarni bitta tizimda kuzating.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-md mx-auto px-6 py-12">{children}</div>
    </div>
  )
}

