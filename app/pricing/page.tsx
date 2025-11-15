'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { CheckCircle, ArrowRight, Zap, Shield, BarChart3 } from 'lucide-react'

const packages = [
  {
    name: 'Basic',
    price: 2500000,
    description: 'Cocok untuk bisnis kecil dan startup',
    features: [
      'Audit 1 area fokus (pilih: Financial, Operational, IT Security, Compliance, atau HR)',
      'Laporan audit standar (PDF)',
      'Executive summary',
      'Temuan utama dengan severity',
      'Support via email',
      'Waktu proses: 1-3 hari kerja',
    ],
    icon: Zap,
    popular: false,
  },
  {
    name: 'Pro',
    price: 5000000,
    description: 'Paling populer untuk bisnis menengah',
    features: [
      'Audit 3 area fokus (pilih kombinasi)',
      'Laporan lengkap dengan visualisasi data',
      'Executive summary + analisis detail',
      'Temuan dengan severity + impact analysis',
      'Rekomendasi actionable',
      'Action items dengan prioritas',
      'Priority support (respon < 4 jam)',
      'Waktu proses: 3-5 hari kerja',
    ],
    icon: BarChart3,
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 12000000,
    description: 'Solusi lengkap untuk perusahaan besar',
    features: [
      'Audit komprehensif semua area',
      'Laporan executive + detail lengkap',
      'Visualisasi data interaktif',
      'Analisis mendalam dengan AI insights',
      'Rekomendasi strategis jangka panjang',
      'Action plan dengan timeline',
      'Dedicated account manager',
      'Support 24/7 via phone & email',
      'Konsultasi follow-up (1 sesi)',
      'Waktu proses: 5-7 hari kerja',
    ],
    icon: Shield,
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="relative bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-transparent to-primary-500/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient">Paket & Harga</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Pilih paket yang sesuai dengan kebutuhan bisnis Anda. Semua paket termasuk laporan lengkap dan support.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-dark-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`card-glow relative group ${
                  pkg.popular
                    ? 'border-2 border-primary-500/50 transform scale-105 hover:border-primary-400/70'
                    : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg shadow-primary-500/50">
                    Paling Populer
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/30 group-hover:scale-110 transition-all duration-300">
                    <pkg.icon className="w-8 h-8 text-primary-400 group-hover:text-primary-300 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-200">{pkg.name}</h3>
                  <p className="text-gray-400 mb-4">{pkg.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gradient">
                      Rp {pkg.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/order?package=${pkg.name.toLowerCase()}`}
                  className={`w-full text-center block py-3 px-6 rounded-lg font-semibold transition-all glow-effect ${
                    pkg.popular
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                >
                  Pilih Paket
                  <ArrowRight className="inline ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-dark-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gradient">Perbandingan Fitur</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-dark-800/50 border border-dark-700/50">
                  <th className="border border-dark-700/50 p-4 text-left text-gray-200">Fitur</th>
                  <th className="border border-dark-700/50 p-4 text-center text-gray-200">Basic</th>
                  <th className="border border-dark-700/50 p-4 text-center bg-primary-500/10 text-gray-200">Pro</th>
                  <th className="border border-dark-700/50 p-4 text-center text-gray-200">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-dark-800/30 transition-colors">
                  <td className="border border-dark-700/50 p-4 font-semibold text-gray-200">Jumlah Area Audit</td>
                  <td className="border border-dark-700/50 p-4 text-center text-gray-400">1</td>
                  <td className="border border-dark-700/50 p-4 text-center bg-primary-500/10 text-primary-400">3</td>
                  <td className="border border-dark-700/50 p-4 text-center text-gray-400">Semua</td>
                </tr>
                <tr className="hover:bg-dark-800/30 transition-colors">
                  <td className="border border-dark-700/50 p-4 font-semibold text-gray-200">Visualisasi Data</td>
                  <td className="border border-dark-700/50 p-4 text-center text-gray-400">-</td>
                  <td className="border border-dark-700/50 p-4 text-center bg-primary-500/10 text-primary-400">✓</td>
                  <td className="border border-dark-700/50 p-4 text-center text-gray-400">✓ Interaktif</td>
                </tr>
                <tr className="hover:bg-dark-800/30 transition-colors">
                  <td className="border border-dark-700/50 p-4 font-semibold text-gray-200">Action Items</td>
                  <td className="border border-dark-700/50 p-4 text-center text-gray-400">-</td>
                  <td className="border border-dark-700/50 p-4 text-center bg-primary-500/10 text-primary-400">✓</td>
                  <td className="border border-dark-700/50 p-4 text-center text-gray-400">✓ + Timeline</td>
                </tr>
                <tr className="hover:bg-dark-800/30 transition-colors">
                  <td className="border border-dark-700/50 p-4 font-semibold text-gray-200">Support</td>
                  <td className="border border-dark-700/50 p-4 text-center text-gray-400">Email</td>
                  <td className="border border-dark-700/50 p-4 text-center bg-primary-500/10 text-primary-400">Priority</td>
                  <td className="border border-dark-700/50 p-4 text-center text-gray-400">24/7 + Manager</td>
                </tr>
                <tr className="hover:bg-dark-800/30 transition-colors">
                  <td className="border border-dark-700/50 p-4 font-semibold text-gray-200">Waktu Proses</td>
                  <td className="border border-dark-700/50 p-4 text-center text-gray-400">1-3 hari</td>
                  <td className="border border-dark-700/50 p-4 text-center bg-primary-500/10 text-primary-400">3-5 hari</td>
                  <td className="border border-dark-700/50 p-4 text-center text-gray-400">5-7 hari</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary-600/20 via-primary-500/10 to-dark-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.15),transparent_50%)]"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-gradient">Butuh Bantuan Memilih Paket?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Hubungi tim sales kami untuk konsultasi gratis
          </p>
          <a href="mailto:sales@auditai.com" className="btn-primary glow-effect inline-block group">
            Hubungi Sales
            <ArrowRight className="inline ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  )
}

