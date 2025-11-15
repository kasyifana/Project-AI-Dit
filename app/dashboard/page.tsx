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
  Upload, 
  FileText, 
  Brain, 
  Clock,
  ArrowRight,
  History,
  Sparkles
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { paymentState, setAuditResult } = usePayment()
  const { showToast } = useToast()

  const [auditData, setAuditData] = useState({
    description: '',
    focusArea: '',
    files: [] as File[],
  })

  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!paymentState.isPaid || paymentState.paymentStatus !== 'verified') {
      showToast('Anda harus menyelesaikan pembayaran terlebih dahulu', 'error')
      router.push('/pricing')
      return
    }
  }, [paymentState, router, showToast])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setAuditData({ ...auditData, files: [...auditData.files, ...newFiles] })
    }
  }

  const removeFile = (index: number) => {
    setAuditData({
      ...auditData,
      files: auditData.files.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!auditData.description.trim()) {
      showToast('Masukkan deskripsi atau data yang akan diaudit', 'error')
      return
    }

    setIsProcessing(true)

    // Simulate AI processing
    setTimeout(() => {
      // Generate mock audit result
      const mockResult = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toISOString(),
        type: paymentState.orderData?.auditType || 'Financial',
        summary: 'Audit telah selesai dilakukan dengan menggunakan teknologi AI. Ditemukan beberapa area yang memerlukan perhatian khusus.',
        findings: [
          {
            id: '1',
            title: 'Ketidaksesuaian dalam Laporan Keuangan',
            severity: 'High' as const,
            description: 'Ditemukan perbedaan antara laporan keuangan bulanan dan tahunan yang memerlukan investigasi lebih lanjut.',
            impact: 'Dapat mempengaruhi keputusan strategis dan compliance dengan regulasi.',
          },
          {
            id: '2',
            title: 'Proses Operasional Tidak Optimal',
            severity: 'Medium' as const,
            description: 'Beberapa proses operasional masih menggunakan metode manual yang dapat diotomatisasi.',
            impact: 'Mengurangi efisiensi dan meningkatkan risiko human error.',
          },
          {
            id: '3',
            title: 'Gap dalam Dokumentasi',
            severity: 'Low' as const,
            description: 'Beberapa prosedur operasional standar belum terdokumentasi dengan lengkap.',
            impact: 'Dapat menyebabkan inkonsistensi dalam pelaksanaan tugas.',
          },
        ],
        recommendations: [
          'Melakukan rekonsiliasi menyeluruh terhadap laporan keuangan untuk memastikan akurasi data.',
          'Mengimplementasikan sistem otomatisasi untuk proses yang berulang.',
          'Menyusun dokumentasi lengkap untuk semua prosedur operasional standar.',
          'Melakukan pelatihan rutin untuk tim terkait prosedur dan best practices.',
        ],
        actionItems: [
          {
            id: '1',
            task: 'Rekonsiliasi laporan keuangan Q1-Q4',
            priority: 'High' as const,
            deadline: '2024-02-15',
          },
          {
            id: '2',
            task: 'Implementasi sistem otomatisasi untuk proses A',
            priority: 'Medium' as const,
            deadline: '2024-03-01',
          },
          {
            id: '3',
            task: 'Penyusunan dokumentasi SOP',
            priority: 'Low' as const,
            deadline: '2024-03-15',
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
              Selamat Datang, {paymentState.orderData?.name}!
            </h1>
            <p className="text-primary-100">
              Siap untuk memulai audit AI Anda? Upload data dan biarkan AI menganalisis untuk Anda.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="card mb-6">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary-600" />
                  Mulai Audit Anda
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Deskripsi / Data yang Akan Diaudit <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="input-field min-h-[200px]"
                      value={auditData.description}
                      onChange={(e) => setAuditData({ ...auditData, description: e.target.value })}
                      placeholder="Masukkan deskripsi, data, atau informasi yang ingin Anda audit. Contoh: Laporan keuangan Q1-Q4 2023, proses operasional departemen X, dll."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Pilih Fokus Area Audit
                    </label>
                    <select
                      className="input-field"
                      value={auditData.focusArea}
                      onChange={(e) => setAuditData({ ...auditData, focusArea: e.target.value })}
                    >
                      <option value="">-- Pilih Fokus Area (Opsional) --</option>
                      <option value="financial">Financial & Accounting</option>
                      <option value="operational">Operational Efficiency</option>
                      <option value="compliance">Compliance & Risk</option>
                      <option value="process">Process Optimization</option>
                      <option value="data">Data Quality & Integrity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Upload File (PDF, Excel, Word)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        id="files"
                        className="hidden"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor="files"
                        className="cursor-pointer text-primary-600 hover:text-primary-700 font-semibold block text-center"
                      >
                        Klik untuk upload file
                      </label>
                      <p className="text-xs text-gray-500 text-center mt-2">
                        Maks. 10MB per file. Multiple files diperbolehkan.
                      </p>

                      {auditData.files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {auditData.files.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                              >
                                Hapus
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
                        Proses Audit dengan AI
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
                    <div className="font-semibold">{paymentState.orderData?.auditType}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Perusahaan</div>
                    <div className="font-semibold">{paymentState.orderData?.company}</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="font-bold mb-4">Tips untuk Audit yang Optimal</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Sertakan data yang lengkap dan terbaru</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Jelaskan konteks dan tujuan audit dengan jelas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Upload file dalam format yang didukung</span>
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

