'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const NAV = [
  { href: '/admin/dashboard', label: '📊 ড্যাশবোর্ড' },
  { href: '/admin/listings', label: '🏠 বিজ্ঞাপন' },
  { href: '/admin/users', label: '👥 ব্যবহারকারী' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) router.push('/')
  }, [user, loading, router])

  if (loading || !user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      ⏳ লোড হচ্ছে...
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      <aside style={{ width: 220, background: 'var(--green-deep)', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>
              Property<span style={{ color: 'var(--amber)' }}>BD</span>
            </div>
          </Link>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', marginTop: 4 }}>অ্যাডমিন প্যানেল</div>
        </div>
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} style={{
              display: 'block', padding: '12px 20px', textDecoration: 'none',
              fontWeight: 600, fontSize: '0.92rem',
              color: pathname.startsWith(item.href) ? 'white' : 'rgba(255,255,255,0.65)',
              background: pathname.startsWith(item.href) ? 'rgba(255,255,255,0.12)' : 'transparent',
              borderLeft: `3px solid ${pathname.startsWith(item.href) ? 'var(--amber)' : 'transparent'}`,
            }}>{item.label}</Link>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginBottom: 10 }}>{user.name || user.phone}</div>
          <button onClick={logout} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            color: 'white', borderRadius: 8, padding: '8px 14px',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600, width: '100%',
          }}>🚪 লগআউট</button>
        </div>
      </aside>
      <main style={{ flex: 1, overflow: 'auto', padding: '32px' }}>{children}</main>
    </div>
  )
}
