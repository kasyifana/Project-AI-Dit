'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  ArrowRight, 
  CheckCircle, 
  Shield, 
  Zap, 
  BarChart3,
  Brain,
  Sparkles
} from 'lucide-react'

export default function Home() {
  const stats = [
    { value: '10,000+', label: 'Audit Selesai' },
    { value: '500+', label: 'Perusahaan Klien' },
    { value: '5 Menit', label: 'Penyelesaian Rata-Rata' },
    { value: '24/7', label: 'Uptime' },
  ]

  const features = [
    {
      icon: Zap,
      title: 'Cepat & Efisien',
      description: 'Proses audit yang biasanya memakan waktu minggu, sekarang selesai dalam hitungan hari dengan teknologi AI terdepan.',
    },
    {
      icon: Shield,
      title: 'Aman & Terpercaya',
      description: 'Data Anda dilindungi dengan enkripsi tingkat enterprise dan standar keamanan internasional yang ketat.',
    },
    {
      icon: BarChart3,
      title: 'Insight Mendalam',
      description: 'Analisis yang lebih dalam dengan AI untuk menemukan pola dan risiko yang tidak terlihat oleh mata manusia.',
    },
    {
      icon: Brain,
      title: 'AI Canggih',
      description: 'Menggunakan teknologi machine learning dan deep learning untuk analisis yang akurat dan komprehensif.',
    },
  ]

  return (
    <div className="min-h-screen bg-[#0B0F19]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19] via-[#0F1421] to-[#0B0F19]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(31,182,255,0.1),transparent_70%)]"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10 py-32">
          <h1 className="hero-text text-white mb-8 animate-fade-in">
            Audit AI
          </h1>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-[#A0AEC0] mb-12 max-w-4xl mx-auto leading-relaxed animate-slide-up-delay-1">
            Masa Depan Audit Bisnis
          </h2>
          <p className="text-xl md:text-2xl text-[#A0AEC0] mb-16 max-w-3xl mx-auto leading-relaxed animate-slide-up-delay-2">
            Gunakan kekuatan Artificial Intelligence untuk mengidentifikasi risiko, 
            peluang, dan rekomendasi strategis untuk bisnis Anda
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-slide-up-delay-3">
            <Link href="/pricing" className="btn-primary glow-effect group">
              Mulai Audit Sekarang
              <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#why-choose" className="btn-secondary group">
              Pelajari Lebih Lanjut
              <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-bg py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16 md:gap-24">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="stat-number text-gradient mb-4 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="stat-label">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose" className="bg-[#0B0F19] py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="section-title text-white mb-6">
              Mengapa Pilih Audit AI?
            </h2>
            <p className="text-xl text-[#A0AEC0] max-w-2xl mx-auto">
              Teknologi AI terdepan untuk audit yang lebih cepat, akurat, dan actionable
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="card group">
                <div className="flex items-start gap-6">
                  <div className="w-14 h-14 rounded-xl bg-[#1FB6FF]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1FB6FF]/20 transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-[#1FB6FF]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-white mb-3 group-hover:text-[#1FB6FF] transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-[#A0AEC0] leading-relaxed text-lg">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="section-bg py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="section-title text-white mb-12">
            Bagaimana Cara Kerjanya?
          </h2>
          <div className="space-y-16">
            <div className="text-left max-w-3xl mx-auto">
              <div className="flex items-start gap-6">
                <div className="text-5xl font-bold text-[#1FB6FF]/30 flex-shrink-0">01</div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-3">Pilih Paket</h3>
                  <p className="text-[#A0AEC0] text-lg leading-relaxed">
                    Pilih paket audit yang sesuai dengan kebutuhan bisnis Anda. Kami menawarkan solusi untuk berbagai skala perusahaan.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-left max-w-3xl mx-auto">
              <div className="flex items-start gap-6">
                <div className="text-5xl font-bold text-[#1FB6FF]/30 flex-shrink-0">02</div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-3">Upload Data</h3>
                  <p className="text-[#A0AEC0] text-lg leading-relaxed">
                    Upload dokumen dan data yang akan diaudit melalui dashboard yang aman dan mudah digunakan.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-left max-w-3xl mx-auto">
              <div className="flex items-start gap-6">
                <div className="text-5xl font-bold text-[#1FB6FF]/30 flex-shrink-0">03</div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-3">AI Processing</h3>
                  <p className="text-[#A0AEC0] text-lg leading-relaxed">
                    Sistem AI kami akan menganalisis data dengan teknologi terdepan untuk menghasilkan insight yang mendalam.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-left max-w-3xl mx-auto">
              <div className="flex items-start gap-6">
                <div className="text-5xl font-bold text-[#1FB6FF]/30 flex-shrink-0">04</div>
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-3">Dapatkan Hasil</h3>
                  <p className="text-[#A0AEC0] text-lg leading-relaxed">
                    Terima laporan audit lengkap dengan rekomendasi yang actionable dan dapat langsung diimplementasikan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0B0F19] py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(31,182,255,0.15),transparent_70%)]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="section-title text-white mb-8">
            Siap Memulai Audit AI Anda?
          </h2>
          <p className="text-xl md:text-2xl text-[#A0AEC0] mb-12 max-w-2xl mx-auto leading-relaxed">
            Pilih paket yang sesuai dan dapatkan insight mendalam untuk bisnis Anda
          </p>
          <Link href="/pricing" className="btn-primary glow-effect inline-block group text-xl px-12 py-5">
            Lihat Paket & Harga
            <ArrowRight className="inline ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
