'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { usePayment } from '@/context/PaymentContext'
import { Clock, Mail, RefreshCw, CheckCircle } from 'lucide-react'

export default function PendingPage() {
  const router = useRouter()
  const { paymentState } = usePayment()

  useEffect(() => {
    if (!paymentState.orderData) {
      router.push('/order')
      return
    }

    if (paymentState.paymentStatus === 'verified') {
      router.push('/dashboard')
    }
  }, [paymentState, router])

  if (!paymentState.orderData) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="py-20 bg-dark-950 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-yellow-600 animate-pulse" />
            </div>

            <h1 className="text-3xl font-bold mb-4">Menunggu Verifikasi Pembayaran</h1>
            <p className="text-lg text-gray-600 mb-8">
              Pembayaran Anda sedang dalam proses verifikasi oleh tim kami
            </p>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div className="h-1 w-16 bg-primary-600"></div>
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white animate-pulse">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="h-1 w-16 bg-gray-300"></div>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white">
                  <span className="text-sm">3</span>
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Pembayaran Diterima</span>
                <span>Verifikasi</span>
                <span>Akses Dashboard</span>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Anda akan mendapat email setelah pembayaran diverifikasi</h3>
                  <p className="text-sm text-blue-800">
                    Email akan dikirim ke <strong>{paymentState.orderData.email}</strong> dalam waktu 1-2 jam kerja.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-semibold mb-4">Detail Pesanan</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Paket</div>
                  <div className="font-semibold">{paymentState.orderData.package}</div>
                </div>
                <div>
                  <div className="text-gray-600">Tipe Audit</div>
                  <div className="font-semibold">{paymentState.orderData.auditType}</div>
                </div>
                <div>
                  <div className="text-gray-600">Perusahaan</div>
                  <div className="font-semibold">{paymentState.orderData.company}</div>
                </div>
                <div>
                  <div className="text-gray-600">Total Pembayaran</div>
                  <div className="font-semibold text-primary-600">
                    Rp {paymentState.orderData.price.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Estimasi waktu verifikasi:</strong> 1-2 jam kerja (Senin-Jumat, 09:00-17:00 WIB)
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
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

