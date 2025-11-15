'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { usePayment } from '@/context/PaymentContext'
import { useToast } from '@/components/Toast'
import { ArrowRight, Upload, FileText } from 'lucide-react'

const auditTypes = [
  'Financial',
  'Operational',
  'IT Security',
  'Compliance',
  'HR',
]

const packages = {
  basic: { name: 'Basic', price: 2500000 },
  pro: { name: 'Pro', price: 5000000 },
  enterprise: { name: 'Enterprise', price: 12000000 },
}

export default function OrderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setOrderData } = usePayment()
  const { showToast } = useToast()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    auditType: '',
    package: searchParams.get('package') || 'basic',
    document: null as File | null,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedPackage = packages[formData.package as keyof typeof packages] || packages.basic

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nama lengkap wajib diisi'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Nama perusahaan wajib diisi'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon wajib diisi'
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid'
    }

    if (!formData.auditType) {
      newErrors.auditType = 'Pilih tipe audit'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast('Mohon lengkapi semua field yang wajib', 'error')
      return
    }

    setOrderData({
      name: formData.name,
      email: formData.email,
      company: formData.company,
      phone: formData.phone,
      auditType: formData.auditType,
      package: selectedPackage.name,
      price: selectedPackage.price,
      document: formData.document,
    })

    router.push('/payment')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, document: e.target.files[0] })
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="py-12 bg-dark-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gradient">Form Pemesanan</h1>
            <p className="text-gray-400">Lengkapi data berikut untuk melanjutkan</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="card space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@perusahaan.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nama Perusahaan/Organisasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className={`input-field ${errors.company ? 'border-red-500' : ''}`}
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="PT Contoh Perusahaan"
                  />
                  {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="081234567890"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Pilih Tipe Audit <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`input-field ${errors.auditType ? 'border-red-500' : ''}`}
                    value={formData.auditType}
                    onChange={(e) => setFormData({ ...formData, auditType: e.target.value })}
                  >
                    <option value="">-- Pilih Tipe Audit --</option>
                    {auditTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.auditType && <p className="text-red-500 text-sm mt-1">{errors.auditType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Pilih Paket
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(packages).map(([key, pkg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, package: key })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.package === key
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        <div className="font-semibold">{pkg.name}</div>
                        <div className="text-sm text-gray-600">
                          Rp {pkg.price.toLocaleString('id-ID')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Upload Dokumen (Opsional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <input
                      type="file"
                      id="document"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="document"
                      className="cursor-pointer text-primary-600 hover:text-primary-700 font-semibold"
                    >
                      Klik untuk upload
                    </label>
                    {formData.document && (
                      <p className="text-sm text-gray-600 mt-2">
                        {formData.document.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      PDF, Word, atau Excel (maks. 10MB)
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Link href="/pricing" className="btn-secondary flex-1 text-center">
                    Kembali
                  </Link>
                  <button type="submit" className="btn-primary flex-1">
                    Lanjut ke Pembayaran
                    <ArrowRight className="inline ml-2 w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="card sticky top-24">
                <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Paket</div>
                    <div className="font-semibold">{selectedPackage.name}</div>
                  </div>
                  {formData.auditType && (
                    <div>
                      <div className="text-sm text-gray-600">Tipe Audit</div>
                      <div className="font-semibold">{formData.auditType}</div>
                    </div>
                  )}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">
                        Rp {selectedPackage.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary-600">
                        Rp {selectedPackage.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

