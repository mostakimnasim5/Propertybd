'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { user, logout, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: '/properties', label: 'প্রপার্টি' },
    { href: '/vehicles', label: 'গাড়ি' },
    { href: '/construction', label: 'নির্মাণ' },
  ]

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--green-deep)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1rem',
          }}>PB</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--green-deep)' }}>
            Property<span style={{ color: 'var(--amber)' }}>BD</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} className="desktop-nav">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '6px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: pathname.startsWith(l.href) ? 'var(--green-deep)' : 'var(--text-secondary)',
              background: pathname.startsWith(l.href) ? 'var(--green-light)' : 'transparent',
              transition: 'all 0.15s',
            }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/post-listing" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', textDecoration: 'none' }}>
                    + বিজ্ঞাপন দিন
                  </Link>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setDropOpen(!dropOpen)} style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'var(--green-deep)',
                      color: 'white', border: 'none',
                      fontWeight: 700, cursor: 'pointer', fontSize: '1rem',
                    }}>
                      {(user.name || user.phone)?.[0]?.toUpperCase()}
                    </button>
                    {dropOpen && (
                      <div style={{
                        position: 'absolute', right: 0, top: 46,
                        background: 'white', borderRadius: 10,
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-md)',
                        minWidth: 180, zIndex: 200,
                        overflow: 'hidden',
                      }}>
                        {[
                          { href: '/dashboard', label: '📊 ড্যাশবোর্ড' },
                          { href: '/saved', label: '❤️ সংরক্ষিত' },
                          ...(user.role === 'ADMIN' ? [{ href: '/admin', label: '⚙️ অ্যাডমিন' }] : []),
                        ].map(item => (
                          <Link key={item.href} href={item.href} onClick={() => setDropOpen(false)} style={{
                            display: 'block', padding: '10px 16px',
                            textDecoration: 'none',
                            color: 'var(--text-primary)',
                            fontWeight: 500,
                            borderBottom: '1px solid var(--border)',
                          }}>
                            {item.label}
                          </Link>
                        ))}
                        <button onClick={logout} style={{
                          display: 'block', width: '100%', padding: '10px 16px',
                          background: 'none', border: 'none',
                          textAlign: 'left', cursor: 'pointer',
                          color: 'var(--red)', fontWeight: 600,
                          fontFamily: 'inherit', fontSize: '0.95rem',
                        }}>
                          🚪 লগআউট
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    লগইন
                  </Link>
                  <Link href="/post-listing" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem', textDecoration: 'none' }}>
                    + বিজ্ঞাপন দিন
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
