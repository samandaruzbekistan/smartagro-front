"use client"

import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { useState } from "react"

export default function Home() {
  const [email, setEmail] = useState("")

  return (
    <>
      <Navbar />

      <main className="bg-white">
        <section className="pt-40 pb-32 px-6 lg:px-8 bg-gradient-to-b from-neutral-50 to-white">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8 leading-tight">
              Fermerlik jarayonlaringizni
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-900">
                to‘liq nazorat qiling
              </span>
            </h1>
            <p className="text-lg text-neutral-600 mb-12 leading-relaxed max-w-xl mx-auto">
              Dalalar, tuproq salomatligi, texnika va jamoa faoliyatini onlayn kuzatib boring. Yaxshi qarorlar qabul
              qilish uchun kerakli tahlillar bir joyda.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-16 max-w-md mx-auto">
              <input
                type="email"
                placeholder="emailingiz@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-6 py-3 border border-neutral-300 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
              />
              <button className="px-8 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-colors whitespace-nowrap">
                Obuna bo‘lish
              </button>
            </div>
          </div>
        </section>

        <section id="featured" className="py-20 px-6 lg:px-8 bg-white border-t border-neutral-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-16">Tanlangan imkoniyatlar</div>

            {/* Main Featured Cards Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Large card - Cyan gradient */}
              <Link href="/fields" className="md:col-span-2 group cursor-pointer">
                <div className="relative bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-2xl aspect-square md:aspect-video overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-200/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <img
                    src="/photo_2025-11-27_13-11-13.jpg"
                    alt="Dalalarni kuzatish"
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-xs text-neutral-500 mb-2">Fermer boshqaruvi</p>
                  <h3 className="text-2xl font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors">
                    Dalalarni kompleks kuzatish
                  </h3>
                  <p className="text-neutral-600 mt-2 text-sm leading-relaxed">
                    Tuproq holati, namlik darajasi, ekinlar bosqichi va hosildorlik prognozlarini kuzating. Bir nechta dalani
                    real vaqt rejimida tahlillar bilan nazorat qiling.
                  </p>
                </div>
              </Link>

              {/* Right column - two stacked cards */}
              <div className="flex flex-col gap-6">
                {/* Yellow card */}
                <Link href="/soil-analysis" className="group cursor-pointer">
                  <div className="relative bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-2xl aspect-square overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-colors">
                    <img
                      src="/photo_2025-11-27_14-20-22.jpg"
                      alt="Tuproq laboratoriyasi"
                      className="w-full h-full object-cover opacity-75"
                    />
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-neutral-500 mb-1">Tuproq ilmi</p>
                    <h3 className="text-lg font-bold text-neutral-900">Tuproq tahlili</h3>
                  </div>
                </Link>

                {/* Teal card */}
                <Link href="/machines" className="group cursor-pointer">
                  <div className="relative bg-gradient-to-br from-teal-100 to-teal-50 rounded-2xl aspect-square overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-colors">
                    <img
                      src="/farm-equipment-tractor-machinery.jpg"
                      alt="Texnika va uskunalar"
                      className="w-full h-full object-cover opacity-75"
                    />
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-neutral-500 mb-1">Texnika</p>
                    <h3 className="text-lg font-bold text-neutral-900">Texnika parki</h3>
                  </div>
                </Link>
              </div>
            </div>

            {/* Additional featured items */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Workers card */}
              <Link href="/workers" className="group cursor-pointer">
                <div className="relative bg-gradient-to-br from-slate-200 to-slate-100 rounded-2xl aspect-video overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-colors">
                  <img
                    src="/photo_2025-11-27_14-20-34.jpg"
                    alt="Fermer jamoasi"
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-xs text-neutral-500 mb-1">Jamoa</p>
                  <h3 className="text-xl font-bold text-neutral-900">Jamoani boshqarish</h3>
                  <p className="text-neutral-600 mt-1 text-sm">Xodimlar yuklamasi va vazifalarini boshqaring</p>
                </div>
              </Link>

              {/* Analytics card */}
              <Link href="/analytics" className="group cursor-pointer">
                <div className="relative bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl aspect-video overflow-hidden border border-neutral-200 hover:border-neutral-300 transition-colors">
                  <img
                    src="/photo_2025-11-27_14-20-40.jpg"
                    alt="Moliyaviy tahlillar"
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
                <div className="mt-4">
                  <p className="text-xs text-neutral-500 mb-1">Tahlillar</p>
                  <h3 className="text-xl font-bold text-neutral-900">Moliyaviy ko‘rsatkichlar</h3>
                  <p className="text-neutral-600 mt-1 text-sm">Daromad, xarajat va rentabellikni nazorat qiling</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-8 bg-neutral-50 border-t border-neutral-100">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">Onlayn monitoring</h2>
                <p className="text-neutral-600 leading-relaxed">
                  Dalalar holati, texnika statusi va jamoa faoliyati bo‘yicha tezkor ogohlantirishlarni oling. Muhim
                  ma’lumotlarni e’tibordan chetda qoldirmang.
                </p>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">Ma’lumotlarga asoslangan qarorlar</h2>
                <p className="text-neutral-600 leading-relaxed">
                  Keng qamrovli tahlillar va tarixiy ma’lumotlar ekinlarni boshqarish, resurslarni taqsimlash va uzoq muddatli
                  rejalashtirishda aniq qarorlar qabul qilishga yordam beradi.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 lg:px-8 bg-white border-t border-neutral-100">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl sm:text-5xl font-bold text-neutral-900 mb-8">Fermangizni yangilashga tayyormisiz?</h2>
            <Link
              href="/fields"
              className="inline-block px-8 py-4 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-colors"
            >
              Boshlash
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-6 lg:px-8 border-t border-neutral-100 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div>
                <h4 className="font-semibold text-neutral-900 mb-4">Mahsulot</h4>
                <ul className="space-y-3 text-sm text-neutral-600">
                  <li>
                    <Link href="/fields" className="hover:text-neutral-900 transition-colors">
                      Dalalar
                    </Link>
                  </li>
                  <li>
                    <Link href="/soil-analysis" className="hover:text-neutral-900 transition-colors">
                      Tuproq tahlili
                    </Link>
                  </li>
                  <li>
                    <Link href="/machines" className="hover:text-neutral-900 transition-colors">
                      Texnika
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-4">Resurslar</h4>
                <ul className="space-y-3 text-sm text-neutral-600">
                  <li>
                    <Link href="#" className="hover:text-neutral-900 transition-colors">
                      Hujjatlar
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-neutral-900 transition-colors">
                      API
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-neutral-900 transition-colors">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-4">Kompaniya</h4>
                <ul className="space-y-3 text-sm text-neutral-600">
                  <li>
                    <Link href="#" className="hover:text-neutral-900 transition-colors">
                      Biz haqimizda
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-neutral-900 transition-colors">
                      Aloqa
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-neutral-900 transition-colors">
                      Maxfiylik
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-neutral-900 mb-4">Ijtimoiy tarmoq</h4>
                <ul className="space-y-3 text-sm text-neutral-600">
                  <li>
                    <Link href="#" className="hover:text-neutral-900 transition-colors">
                      Twitter
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-neutral-900 transition-colors">
                      LinkedIn
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-neutral-900 transition-colors">
                      Instagram
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-neutral-100 pt-8 text-center text-sm text-neutral-600">
              <p>&copy; 2025 Smart Agro. Barcha huquqlar himoyalangan.</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
