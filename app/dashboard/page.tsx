'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { usePayment } from '@/context/PaymentContext'
import { useToast } from '@/components/Toast'
import { 
  CheckCircle, 
  Brain, 
  ArrowRight,
  History,
  Sparkles,
  Link as LinkIcon,
  Shield,
  Gauge,
  Accessibility,
  HelpCircle
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { paymentState, setAuditResult } = usePayment()
  const { showToast } = useToast()

  const [auditData, setAuditData] = useState({
    url: paymentState.orderData?.websiteUrl || '',
    focusArea: paymentState.orderData?.auditType || '',
    notes: '',
  })

  const [isProcessing, setIsProcessing] = useState(false)
  const [showFocusInfo, setShowFocusInfo] = useState(false)

  useEffect(() => {
    if (!paymentState.isPaid || paymentState.paymentStatus !== 'verified') {
      showToast('Anda harus menyelesaikan pembayaran terlebih dahulu', 'error')
      router.push('/pricing')
      return
    }
  }, [paymentState, router, showToast])

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuditData({ ...auditData, url: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!auditData.url.trim()) {
      showToast('Masukkan URL website yang akan diaudit', 'error')
      return
    }

    setIsProcessing(true)

    // Simulate AI processing
    setTimeout(() => {
      const mockResult = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        type: 'Website Blackbox',
        summary: 'Audit website selesai. Ditemukan beberapa temuan terkait performa, keamanan, SEO, dan aksesibilitas yang perlu diperbaiki.',
        findings: [
          {
            id: '1',
            title: 'Skor performa rendah pada halaman utama',
            severity: 'High' as const,
            description: 'First Contentful Paint dan Largest Contentful Paint melebihi ambang batas rekomendasi.',
            impact: 'Pengalaman pengguna buruk dan menurunkan konversi.',
          },
          {
            id: '2',
            title: 'Header keamanan tidak lengkap',
            severity: 'Medium' as const,
            description: 'Tidak ditemukan Strict-Transport-Security atau Content-Security-Policy.',
            impact: 'Meningkatkan risiko serangan XSS dan downgrade SSL.',
          },
          {
            id: '3',
            title: 'Elemen gambar tanpa atribut alt',
            severity: 'Low' as const,
            description: 'Beberapa gambar tidak memiliki teks alternatif untuk screen reader.',
            impact: 'Menurunkan aksesibilitas bagi pengguna berkebutuhan khusus.',
          },
        ],
        recommendations: [
          'Optimalkan aset statis dan gunakan teknik lazy-loading.',
          'Tambahkan header keamanan standar dan tinjau konfigurasi server.',
          'Lengkapi atribut alt pada semua gambar dan label form.',
          'Tinjau meta tags untuk SEO dasar (title, description, canonical).',
        ],
        actionItems: [
          {
            id: '1',
            task: 'Perbaiki LCP dengan optimasi hero image',
            priority: 'High' as const,
            deadline: '2025-12-01',
          },
          {
            id: '2',
            task: 'Tambahkan Content-Security-Policy minimum',
            priority: 'Medium' as const,
            deadline: '2025-12-05',
          },
          {
            id: '3',
            task: 'Audit alt text dan label form',
            priority: 'Low' as const,
            deadline: '2025-12-10',
          },
        ],
      }

      setAuditResult(mockResult)
      setIsProcessing(false)
      showToast('Audit selesai! Lihat hasil audit Anda.', 'success')
      router.push('/result')
    }, 3000)
  }

  if (!paymentState.isPaid || paymentState.paymentStatus !== 'verified') {
    return null
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="py-12 bg-dark-950 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="card mb-8 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6" />
              <span className="text-sm font-semibold">Pembayaran Terverifikasi ✓</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Audit Website Blackbox
            </h1>
            <p className="text-primary-100">
              Masukkan URL website dan lakukan pengujian blackbox terhadap performa, keamanan, SEO, dan aksesibilitas.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="card mb-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary-600" />
                  Mulai Audit Blackbox
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      URL Website <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      value={auditData.url}
                      onChange={handleUrlChange}
                      placeholder="https://www.contoh.com"
                    />
                  </div>

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm font-semibold">
                        Pilih Fokus Area Audit
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowFocusInfo(!showFocusInfo)}
                        className="p-1 rounded-full bg-[#1FB6FF]/10 hover:bg-[#1FB6FF]/20 text-[#1FB6FF]"
                        aria-label="Info fokus area"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                    {showFocusInfo && (
                      <div className="absolute z-20 mt-1 w-full rounded-lg border border-white/10 bg-[#0F1421]/90 backdrop-blur-sm p-3 text-sm text-[#A0AEC0]">
                        Semua aspek akan tetap diaudit. Pilih fokus utama untuk pendalaman.
                      </div>
                    )}
                    <select
                      className="input-field"
                      value={auditData.focusArea}
                      onChange={(e) => setAuditData({ ...auditData, focusArea: e.target.value })}
                    >
                      <option value="">-- Pilih Fokus Area (Opsional) --</option>
                      <option value="performance">Performa</option>
                      <option value="security">Keamanan</option>
                      <option value="seo">SEO</option>
                      <option value="accessibility">Aksesibilitas</option>
                      <option value="functional">Fungsional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      className="input-field min-h-[140px]"
                      value={auditData.notes}
                      onChange={(e) => setAuditData({ ...auditData, notes: e.target.value })}
                      placeholder="Masukkan konteks singkat audit, misal: halaman penting, form yang perlu diuji, dsb."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <Brain className="inline mr-2 w-5 h-5 animate-pulse" />
                        Memproses dengan AI...
                      </>
                    ) : (
                      <>
                        Jalankan Audit Blackbox
                        <ArrowRight className="inline ml-2 w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* History Section */}
              {paymentState.auditResult && (
                <div className="card">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-primary-600" />
                    Audit Terakhir
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Audit {paymentState.auditResult.type}</span>
                      <span className="text-sm text-gray-600">
                        {new Date(paymentState.auditResult.date).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{paymentState.auditResult.summary}</p>
                    <Link href="/result" className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                      Lihat Detail →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card mb-6">
                <h3 className="font-bold mb-4">Paket Anda</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-gray-600">Paket</div>
                    <div className="font-semibold">{paymentState.orderData?.package}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tipe Audit</div>
                    <div className="font-semibold">Website Blackbox</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Perusahaan</div>
                    <div className="font-semibold">{paymentState.orderData?.company}</div>
                  </div>
                  {paymentState.orderData?.websiteUrl && (
                    <div>
                      <div className="text-gray-600">Website</div>
                      <div className="font-semibold break-all">{paymentState.orderData?.websiteUrl}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="font-bold mb-4">Tips untuk Audit yang Optimal</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Gunakan URL produksi atau staging yang stabil</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Jelaskan halaman kritikal dan form yang perlu diuji</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Pastikan tidak ada blokir bot pada robots/security</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Proses audit memakan waktu 2-5 menit</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

