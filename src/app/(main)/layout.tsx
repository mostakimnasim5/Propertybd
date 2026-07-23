import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 64px)' }}>
        {children}
      </main>
      <Footer />
    </>
  )
}
