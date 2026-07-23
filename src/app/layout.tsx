import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'PropertyBD — বাংলাদেশের সেরা প্রপার্টি মার্কেটপ্লেস',
  description: 'বাংলাদেশে ফ্ল্যাট, বাড়ি, জমি, দোকান কেনা-বেচা ও ভাড়া, গাড়ি ও বাইক বিক্রি এবং নির্মাণ সেবার জন্য সেরা প্ল্যাটফর্ম।',
  keywords: 'property bangladesh, flat rent dhaka, bari bikroy, jomir dam, car bikroy bd',
  openGraph: {
    title: 'PropertyBD',
    description: 'বাংলাদেশের সেরা প্রপার্টি মার্কেটপ্লেস',
    locale: 'bn_BD',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: "'Hind Siliguri', sans-serif",
                borderRadius: '10px',
                background: '#1A1A2E',
                color: '#fff',
              },
              success: { iconTheme: { primary: '#0E4D34', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
