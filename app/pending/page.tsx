'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { usePayment } from '@/context/PaymentContext'
import { useToast } from '@/components/Toast'
import { Clock, Mail, RefreshCw, CheckCircle } from 'lucide-react'

export default function PendingPage() {
  const router = useRouter()
  const { paymentState, setPaymentStatus } = usePayment()
  const [mounted, setMounted] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    if (!paymentState.orderData) {
      router.push('/order')
      return
    }

    if (paymentState.paymentStatus === 'verified') {
      router.push('/dashboard')
    }
  }, [paymentState, router, mounted])

  const handleSimulateVerify = () => {
    setPaymentStatus('verified')
    showToast('Pembayaran berhasil diverifikasi!', 'success')
    router.push('/dashboard')
  }

  if (!mounted || !paymentState.orderData) {
    return (
      <div className="min-h-screen bg-[#0B0F19]">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1FB6FF] mx-auto mb-4"></div>
            <p className="text-[#A0AEC0]">Memuat...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="py-20 bg-[#0B0F19] min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card text-center">
            <div className="w-20 h-20 bg-[#1FB6FF]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-[#1FB6FF] animate-pulse" />
            </div>

            <h1 className="text-3xl font-bold mb-4 text-white">Menunggu Verifikasi Pembayaran</h1>
            <p className="text-lg text-[#A0AEC0] mb-8">
              Pembayaran Anda sedang dalam proses verifikasi oleh tim kami
            </p>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#1FB6FF] rounded-full flex items-center justify-center text-white">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="h-1 w-16 bg-[#1FB6FF]"></div>
                <div className="w-8 h-8 bg-[#1FB6FF]/50 rounded-full flex items-center justify-center text-white animate-pulse">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="h-1 w-16 bg-white/10"></div>
                <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white">
                  <span className="text-sm">3</span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-[#A0AEC0]">
                <span>Pembayaran Diterima</span>
                <span>Verifikasi</span>
                <span>Akses Dashboard</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-[#0F1421]/50 border border-[#1FB6FF]/20 rounded-lg p-6 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#1FB6FF] flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-white mb-2">Anda akan mendapat email setelah pembayaran diverifikasi</h3>
                  <p className="text-sm text-[#A0AEC0]">
                    Email akan dikirim ke <strong className="text-white">{paymentState.orderData.email}</strong> dalam waktu 1-2 jam kerja.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-[#0F1421]/50 rounded-lg p-6 mb-8 text-left border border-white/5">
              <h3 className="font-semibold mb-4 text-white">Detail Pesanan</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-[#A0AEC0]">Paket</div>
                  <div className="font-semibold text-white">{paymentState.orderData.package}</div>
                </div>
                {paymentState.orderData.websiteUrl && (
                  <div>
                    <div className="text-[#A0AEC0]">Website</div>
                    <div className="font-semibold text-white break-all">{paymentState.orderData.websiteUrl}</div>
                  </div>
                )}
                <div>
                  <div className="text-[#A0AEC0]">Tipe Audit</div>
                  <div className="font-semibold text-white">{paymentState.orderData.auditType}</div>
                </div>
                <div>
                  <div className="text-[#A0AEC0]">Perusahaan</div>
                  <div className="font-semibold text-white">{paymentState.orderData.company}</div>
                </div>
                <div>
                  <div className="text-[#A0AEC0]">Total Pembayaran</div>
                  <div className="font-semibold text-[#1FB6FF]">
                    Rp {paymentState.orderData.price.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="bg-[#1FB6FF]/10 border border-[#1FB6FF]/20 rounded-lg p-4">
                <p className="text-sm text-[#A0AEC0]">
                  <strong className="text-white">Estimasi waktu verifikasi:</strong> 1-2 jam kerja (Senin-Jumat, 09:00-17:00 WIB)
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/" className="btn-secondary flex-1 text-center">
                  Kembali ke Beranda
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary flex-1"
                >
                  <RefreshCw className="inline mr-2 w-4 h-4" />
                  Cek Status Pembayaran
                </button>
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={handleSimulateVerify}
                  className="text-sm text-[#A0AEC0] hover:text-[#1FB6FF] underline"
                >
                  [Simulasi Verifikasi Berhasil] - Hanya untuk testing
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

