import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Headphones } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0F1421] border-t border-white/5 text-[#A0AEC0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex-1">
            <h3 className="text-white text-lg font-semibold mb-2">Audit AI</h3>
            <p className="text-sm text-[#A0AEC0] max-w-md">
              Layanan audit profesional menggunakan teknologi AI untuk membantu bisnis Anda berkembang.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Layanan</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/pricing" className="hover:text-white transition-colors duration-300">Paket & Harga</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors duration-300">Cara Kerja</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Kontak</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>info@auditai.com</span>
                </li>
                <li className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>+62 21 1234 5678</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#A0AEC0]">&copy; 2024 Audit AI. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors duration-300">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="hover:text-white transition-colors duration-300">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

