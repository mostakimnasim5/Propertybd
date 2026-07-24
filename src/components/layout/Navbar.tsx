'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { href: '/properties', label: '🏠 প্রপার্টি' },
  { href: '/vehicles', label: '🚗 গাড়ি' },
  { href: '/construction', label: '🏗️ নির্মাণ' },
]

export default function Navbar() {
  const { user, logout, loading } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <nav style={{
        background: 'white', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100, boxShadow: 'var(--shadow-sm)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setMenuOpen(false)}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--green-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0 }}>PB</div>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--green-deep)' }}>
              Property<span style={{ color: 'var(--amber)' }}>BD</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="nav-desktop-links" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
                fontWeight: 600, fontSize: '0.9rem',
                color: pathname.startsWith(l.href) ? 'var(--green-deep)' : 'var(--text-secondary)',
                background: pathname.startsWith(l.href) ? 'var(--green-light)' : 'transparent',
              }}>{l.label}</Link>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/post-listing" className="btn-primary nav-post-btn" style={{ padding: '7px 14px', fontSize: '0.85rem', textDecoration: 'none' }}>
                      + বিজ্ঞাপন
                    </Link>
                    <div style={{ position: 'relative' }}>
                      <button onClick={() => setDropOpen(!dropOpen)} style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--green-deep)', color: 'white',
                        border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
                      }}>
                        {(user.name || user.phone)?.[0]?.toUpperCase()}
                      </button>
                      {dropOpen && (
                        <div onClick={() => setDropOpen(false)} style={{
                          position: 'absolute', right: 0, top: 44,
                          background: 'white', borderRadius: 10,
                          border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
                          minWidth: 180, zIndex: 200, overflow: 'hidden',
                        }}>
                          {[
                            { href: '/dashboard', label: '📊 ড্যাশবোর্ড' },
                            { href: '/saved', label: '❤️ সংরক্ষিত' },
                            { href: '/post-listing', label: '+ বিজ্ঞাপন দিন' },
                            ...(user.role === 'ADMIN' ? [{ href: '/admin/dashboard', label: '⚙️ অ্যাডমিন' }] : []),
                          ].map(item => (
                            <Link key={item.href} href={item.href} style={{ display: 'block', padding: '11px 16px', textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem', borderBottom: '1px solid var(--border)' }}>
                              {item.label}
                            </Link>
                          ))}
                          <button onClick={logout} style={{ display: 'block', width: '100%', padding: '11px 16px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--red)', fontWeight: 600, fontFamily: 'inherit', fontSize: '0.9rem' }}>
                            🚪 লগআউট
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <Link href="/login" className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.9rem', textDecoration: 'none' }}>
                    লগইন
                  </Link>
                )}
              </>
            )}

            {/* Hamburger — mobile only */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="show-mobile" style={{
              background: 'none', border: '1px solid var(--border)',
              borderRadius: 8, width: 38, height: 38,
              cursor: 'pointer', fontSize: '1.1rem',
              display: 'none', alignItems: 'center', justifyContent: 'center',
            }}>
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '12px 16px 20px' }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{
                display: 'block', padding: '13px 4px',
                textDecoration: 'none', fontWeight: 700,
                color: pathname.startsWith(l.href) ? 'var(--green-deep)' : 'var(--text-primary)',
                borderBottom: '1px solid var(--border)',
                fontSize: '1rem',
              }}>{l.label}</Link>
            ))}
            <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="btn-outline" style={{ textDecoration: 'none', flex: 1, textAlign: 'center' }}>ড্যাশবোর্ড</Link>
                  <Link href="/post-listing" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center', justifyContent: 'center' }}>+ বিজ্ঞাপন</Link>
                </>
              ) : (
                <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ textDecoration: 'none', flex: 1, justifyContent: 'center' }}>লগইন করুন</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop */}
      {(menuOpen || dropOpen) && (
        <div onClick={() => { setMenuOpen(false); setDropOpen(false) }}
          style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
      )}
    </>
  )
}
