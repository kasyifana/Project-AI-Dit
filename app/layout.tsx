import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { PaymentProvider } from '@/context/PaymentContext'
import { ToastProvider } from '@/components/Toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Audit AI - Layanan Audit Berbasis Artificial Intelligence',
  description: 'Layanan audit profesional menggunakan teknologi AI untuk membantu bisnis Anda',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <PaymentProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </PaymentProvider>
      </body>
    </html>
  )
}

