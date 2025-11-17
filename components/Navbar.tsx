'use client'

import Link from 'next/link'
import { usePayment } from '@/context/PaymentContext'
import { FileText, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { paymentState } = usePayment()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="glass border-b border-white/5 sticky top-0 z-40 backdrop-blur-xl bg-[#0B0F19]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <FileText className="w-8 h-8 text-[#1FB6FF] group-hover:text-[#1DA1F2] transition-colors duration-300" />
            <span className="text-xl font-bold text-white group-hover:text-[#1FB6FF] transition-colors duration-300">Audit AI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-[#A0AEC0] hover:text-white transition-colors duration-300 text-base">
              Beranda
            </Link>
            <Link href="/pricing" className="text-[#A0AEC0] hover:text-white transition-colors duration-300 text-base">
              Harga
            </Link>
            {mounted && paymentState.isPaid && (
              <Link href="/dashboard" className="text-[#A0AEC0] hover:text-white transition-colors duration-300 text-base">
                Dashboard
              </Link>
            )}
            {mounted && !paymentState.isPaid && (
              <Link href="/pricing" className="btn-primary glow-effect text-base px-6 py-3">
                Mulai Sekarang
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 text-[#A0AEC0] hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0F1421]/80 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-3">
            <Link href="/" className="block text-[#A0AEC0] hover:text-white transition-colors">
              Beranda
            </Link>
            <Link href="/pricing" className="block text-[#A0AEC0] hover:text-white transition-colors">
              Harga
            </Link>
            {mounted && paymentState.isPaid && (
              <Link href="/dashboard" className="block text-[#A0AEC0] hover:text-white transition-colors">
                Dashboard
              </Link>
            )}
            {mounted && !paymentState.isPaid && (
              <Link href="/pricing" className="btn-primary block text-center glow-effect">
                Mulai Sekarang
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

