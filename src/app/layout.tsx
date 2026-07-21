import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PropertyBD — বাংলাদেশের সেরা প্রপার্টি মার্কেটপ্লেস',
  description: 'ফ্ল্যাট, বাড়ি, জমি, দোকান কেনাবেচা ও ভাড়া, গাড়ি ও বাইক বিক্রি এবং নির্মাণ সেবা',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body className={geist.className}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}
