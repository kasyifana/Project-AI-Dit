'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { usePayment } from '@/context/PaymentContext'
import { useToast } from '@/components/Toast'
import { 
  CreditCard, 
  Building2, 
  Wallet, 
  Smartphone, 
  Upload, 
  Clock,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'

const paymentMethods = [
  {
    id: 'bca',
    name: 'Transfer Bank BCA',
    icon: Building2,
    description: 'Rekening: 1234567890 a.n. Audit AI',
  },
  {
    id: 'mandiri',
    name: 'Transfer Bank Mandiri',
    icon: Building2,
    description: 'Rekening: 9876543210 a.n. Audit AI',
  },
  {
    id: 'bri',
    name: 'Transfer Bank BRI',
    icon: Building2,
    description: 'Rekening: 5555555555 a.n. Audit AI',
  },
  {
    id: 'gopay',
    name: 'GoPay',
    icon: Smartphone,
    description: 'Scan QR code atau transfer ke nomor terdaftar',
  },
  {
    id: 'ovo',
    name: 'OVO',
    icon: Wallet,
    description: 'Transfer ke nomor terdaftar',
  },
  {
    id: 'dana',
    name: 'DANA',
    icon: Wallet,
    description: 'Transfer ke nomor terdaftar',
  },
  {
    id: 'va',
    name: 'Virtual Account',
    icon: CreditCard,
    description: 'VA akan dikirim via email setelah konfirmasi',
  },
  {
    id: 'cc',
    name: 'Credit Card',
    icon: CreditCard,
    description: 'Visa, Mastercard, JCB diterima',
  },
]

export default function PaymentPage() {
  const router = useRouter()
  const { paymentState, setPaymentStatus } = usePayment()
  const { showToast } = useToast()

  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [countdown, setCountdown] = useState(30 * 60) // 30 minutes

  useEffect(() => {
    if (!paymentState.orderData) {
      router.push('/order')
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentState.orderData, router])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMethod) {
      showToast('Pilih metode pembayaran terlebih dahulu', 'error')
      return
    }

    if (['bca', 'mandiri', 'bri', 'gopay', 'ovo', 'dana'].includes(selectedMethod) && !proofFile) {
      showToast('Upload bukti pembayaran terlebih dahulu', 'error')
      return
    }

    setPaymentStatus('pending')
    showToast('Pembayaran berhasil dikonfirmasi. Menunggu verifikasi...', 'success')
    router.push('/pending')
  }

  const handleSimulatePayment = () => {
    setPaymentStatus('verified')
    showToast('Pembayaran berhasil diverifikasi!', 'success')
    router.push('/dashboard')
  }

  if (!paymentState.orderData) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="py-12 bg-dark-950 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Order Summary */}
          <div className="card mb-8">
            <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600">Paket</div>
                <div className="font-semibold">{paymentState.orderData.package}</div>
              </div>
              {paymentState.orderData.websiteUrl && (
                <div>
                  <div className="text-gray-600">Website</div>
                  <div className="font-semibold break-all">{paymentState.orderData.websiteUrl}</div>
                </div>
              )}
              <div>
                <div className="text-gray-600">Tipe Audit</div>
                <div className="font-semibold">{paymentState.orderData.auditType}</div>
              </div>
              <div>
                <div className="text-gray-600">Perusahaan</div>
                <div className="font-semibold">{paymentState.orderData.company}</div>
              </div>
              <div>
                <div className="text-gray-600">Total</div>
                <div className="font-semibold text-primary-600 text-lg">
                  Rp {paymentState.orderData.price.toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="card mb-8 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="font-semibold text-yellow-800">Batas Waktu Pembayaran</div>
                <div className="text-2xl font-bold text-yellow-600">{formatTime(countdown)}</div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="card space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Pilih Metode Pembayaran</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedMethod === method.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <method.icon className="w-6 h-6 text-primary-600" />
                      <div className="font-semibold">{method.name}</div>
                      {selectedMethod === method.id && (
                        <CheckCircle className="w-5 h-5 text-primary-600 ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {selectedMethod && ['bca', 'mandiri', 'bri', 'gopay', 'ovo', 'dana'].includes(selectedMethod) && (
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Upload Bukti Pembayaran <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    id="proof"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                  />
                  <label
                    htmlFor="proof"
                    className="cursor-pointer text-primary-600 hover:text-primary-700 font-semibold"
                  >
                    Klik untuk upload bukti pembayaran
                  </label>
                  {proofFile && (
                    <p className="text-sm text-gray-600 mt-2">{proofFile.name}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    JPG, PNG, atau PDF (maks. 5MB)
                  </p>
                </div>
              </div>
            )}

            {selectedMethod === 'va' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Virtual Account akan dikirim ke email <strong>{paymentState.orderData.email}</strong> setelah Anda mengkonfirmasi pembayaran.
                </p>
              </div>
            )}

            {selectedMethod === 'cc' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Anda akan diarahkan ke halaman pembayaran yang aman untuk memasukkan detail kartu kredit.
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Link href="/order" className="btn-secondary flex-1 text-center">
                <ArrowLeft className="inline mr-2 w-4 h-4" />
                Kembali
              </Link>
              <button type="submit" className="btn-primary flex-1">
                Konfirmasi Pembayaran
              </button>
            </div>
          </form>

          {/* Simulate Payment Button (for testing) */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSimulatePayment}
              className="text-sm text-gray-600 hover:text-primary-600 underline"
            >
              [Simulasi Pembayaran Berhasil] - Hanya untuk testing
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

