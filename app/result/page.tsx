'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { usePayment } from '@/context/PaymentContext'
import { useToast } from '@/components/Toast'
import { 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  ArrowRight,
  Share2,
  TrendingUp,
  FileText
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function ResultPage() {
  const router = useRouter()
  const { paymentState } = usePayment()
  const { showToast } = useToast()

  useEffect(() => {
    if (!paymentState.isPaid || !paymentState.auditResult) {
      showToast('Tidak ada hasil audit. Silakan mulai audit terlebih dahulu.', 'error')
      router.push('/dashboard')
      return
    }
  }, [paymentState, router, showToast])

  if (!paymentState.auditResult) {
    return null
  }

  const result = paymentState.auditResult

  // Chart data
  const severityData = [
    { name: 'High', value: result.findings.filter(f => f.severity === 'High').length, color: '#ef4444' },
    { name: 'Medium', value: result.findings.filter(f => f.severity === 'Medium').length, color: '#f59e0b' },
    { name: 'Low', value: result.findings.filter(f => f.severity === 'Low').length, color: '#10b981' },
  ]

  const priorityData = [
    { name: 'High', value: result.actionItems.filter(a => a.priority === 'High').length, color: '#ef4444' },
    { name: 'Medium', value: result.actionItems.filter(a => a.priority === 'Medium').length, color: '#f59e0b' },
    { name: 'Low', value: result.actionItems.filter(a => a.priority === 'Low').length, color: '#10b981' },
  ]

  const handleDownload = () => {
    showToast('Fitur download akan segera tersedia', 'info')
    // In a real app, this would generate and download a PDF
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Hasil Audit ${result.type}`,
        text: `Lihat hasil audit AI untuk ${paymentState.orderData?.company}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast('Link berhasil disalin ke clipboard', 'success')
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'High':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      case 'Medium':
        return <Info className="w-5 h-5 text-yellow-500" />
      case 'Low':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return null
    }
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      High: 'bg-red-100 text-red-800 border-red-200',
      Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Low: 'bg-green-100 text-green-800 border-green-200',
    }
    return colors[severity as keyof typeof colors] || ''
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="py-12 bg-dark-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="card mb-8 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">Audit Selesai</span>
                </div>
                <h1 className="text-3xl font-bold mb-2">Hasil Audit {result.type}</h1>
                <p className="text-green-100">
                  Selesai pada {new Date(result.date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-white text-green-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-600" />
              Executive Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{result.summary}</p>
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{result.findings.length}</div>
                <div className="text-sm text-gray-600">Total Temuan</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">{result.recommendations.length}</div>
                <div className="text-sm text-gray-600">Rekomendasi</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{result.actionItems.length}</div>
                <div className="text-sm text-gray-600">Action Items</div>
              </div>
            </div>
          </div>

          {/* Visualizations */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Distribusi Severity Temuan</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h3 className="text-xl font-bold mb-4">Prioritas Action Items</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Findings */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">Temuan Utama</h2>
            <div className="space-y-4">
              {result.findings.map((finding) => (
                <div
                  key={finding.id}
                  className="border-l-4 border-gray-300 pl-4 py-4 bg-gray-50 rounded-r-lg"
                  style={{
                    borderLeftColor:
                      finding.severity === 'High'
                        ? '#ef4444'
                        : finding.severity === 'Medium'
                        ? '#f59e0b'
                        : '#10b981',
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {getSeverityIcon(finding.severity)}
                      {finding.title}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityBadge(
                        finding.severity
                      )}`}
                    >
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{finding.description}</p>
                  <div className="bg-blue-50 rounded p-3 mt-2">
                    <div className="text-sm font-semibold text-blue-900 mb-1">Dampak:</div>
                    <div className="text-sm text-blue-800">{finding.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              Rekomendasi
            </h2>
            <ol className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Action Items */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold mb-6">Action Items</h2>
            <div className="space-y-4">
              {result.actionItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4"
                  style={{
                    borderLeftColor:
                      item.priority === 'High'
                        ? '#ef4444'
                        : item.priority === 'Medium'
                        ? '#f59e0b'
                        : '#10b981',
                  }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${getSeverityBadge(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-sm text-gray-600">
                        Deadline: {new Date(item.deadline).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="font-semibold">{item.task}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard" className="btn-secondary flex-1 text-center">
              Audit Baru
            </Link>
            <Link href="/pricing" className="btn-primary flex-1 text-center">
              Upgrade Paket
              <ArrowRight className="inline ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

