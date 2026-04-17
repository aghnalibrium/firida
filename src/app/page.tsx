'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function Home() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        const data = await response.json()

        if (data.user) {
          router.push('/dashboard')
          return
        }
      } catch (error) {
        console.error('Session check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
        <p className="text-white">Memuat...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700">
      {/* Navigation */}
      <nav className="bg-white bg-opacity-10 backdrop-blur-md border-b border-white border-opacity-20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="text-white font-bold text-xl">FIRIDA</span>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors font-medium"
          >
            Masuk
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center items-center gap-12 mb-8">
            <img
              src="/logo-umy.png"
              alt="Logo Universitas Muhammadiyah Yogyakarta"
              className="w-28 h-28 object-contain drop-shadow-2xl"
              style={{ mixBlendMode: 'multiply' }}
            />
            <Logo className="w-32 h-32 drop-shadow-2xl" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            FIRIDA
          </h1>
          <p className="text-2xl md:text-3xl mb-2 text-blue-100">
            Firdaus Digital Finance
          </p>
          <p className="text-xl md:text-2xl mb-12 text-blue-200">
            Sistem Manajemen Keuangan Klinik Modern
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-white border-opacity-20">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-xl font-semibold mb-2">Laporan Lengkap</h3>
              <p className="text-blue-100">
                Laporan keuangan real-time dengan visualisasi yang mudah dipahami
              </p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-white border-opacity-20">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-xl font-semibold mb-2">Manajemen Keuangan</h3>
              <p className="text-blue-100">
                Kelola pendapatan, pengeluaran, dan transfer dengan mudah
              </p>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6 border border-white border-opacity-20">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Aman & Terpercaya</h3>
              <p className="text-blue-100">
                Data terlindungi dengan sistem keamanan modern
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/login')}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-bold text-lg shadow-xl"
          >
            Mulai Sekarang
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full bg-white bg-opacity-5 border-t border-white border-opacity-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo-umy.png"
                alt="Logo Universitas Muhammadiyah Yogyakarta"
                className="w-10 h-10 object-contain"
                style={{ mixBlendMode: 'multiply' }}
              />
              <div className="text-white">
                <p className="font-semibold text-sm">Universitas Muhammadiyah Yogyakarta</p>
                <p className="text-xs text-blue-100">Kampus Terpadu UMY</p>
              </div>
            </div>
            <p className="text-white text-xs">FIRIDA developed by <span className="font-semibold">Aghnalibrium Consultant</span></p>
          </div>
        </div>
      </footer>
    </div>
  )
}
