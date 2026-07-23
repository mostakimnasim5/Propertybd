'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'অপেক্ষমাণ', color: '#D97706' },
  ACTIVE: { label: 'সক্রিয়', color: '#166A47' },
  SOLD: { label: 'বিক্রিত', color: '#6B7280' },
  RENTED: { label: 'ভাড়া হয়েছে', color: '#6B7280' },
  REJECTED: { label: 'বাতিল', color: '#DC2626' },
  EXPIRED: { label: 'মেয়াদোত্তীর্ণ', color: '#9CA3AF' },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'property' | 'vehicle' | 'construction'>('property')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    axios.get(`/api/users/listings?category=${tab}`)
      .then(r => {
        const d = r.data.data
        setItems(d.listings || d.vehicles || d.companies || [])
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [tab])

  const getDetailLink = (item: any) => {
    if (tab === 'vehicle') return `/vehicles/${item.id}`
    if (tab === 'construction') return `/construction/${item.id}`
    return `/properties/${item.id}`
  }

  return (
    <div style={{ padding: '32px 0', minHeight: '70vh' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'start' }}>
          {/* Sidebar */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {/* Profile summary */}
            <div style={{ background: 'var(--green-deep)', padding: '24px 20px', textAlign: 'center' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)', color: 'white',
                fontWeight: 800, fontSize: '1.4rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px',
              }}>
                {(user?.name || user?.phone || 'U')[0].toUpperCase()}
              </div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{user?.name || 'ব্যবহারকারী'}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.82rem', marginTop: 2 }}>{user?.phone}</div>
              <div style={{ marginTop: 8 }}>
                <span style={{ background: 'var(--amber)', color: 'white', fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: 99 }}>
                  {user?.role === 'BROKER' ? 'ব্রোকার' : user?.role === 'BUILDER' ? 'বিল্ডার' : 'সদস্য'}
                </span>
              </div>
            </div>

            {/* Nav */}
            {[
              { href: '/dashboard', label: '📊 আমার বিজ্ঞাপন', active: true },
              { href: '/saved', label: '❤️ সংরক্ষিত' },
              { href: '/post-listing', label: '+ নতুন বিজ্ঞাপন' },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                display: 'block', padding: '13px 18px',
                textDecoration: 'none', fontWeight: 600, fontSize: '0.92rem',
                color: item.active ? 'var(--green-deep)' : 'var(--text-secondary)',
                background: item.active ? 'var(--green-light)' : 'transparent',
                borderBottom: '1px solid var(--border)',
              }}>{item.label}</Link>
            ))}
          </div>

          {/* Main content */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--green-deep)' }}>আমার বিজ্ঞাপন</h1>
              <Link href="/post-listing" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.9rem' }}>
                + নতুন দিন
              </Link>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
              {[
                { id: 'property', label: '🏠 প্রপার্টি' },
                { id: 'vehicle', label: '🚗 গাড়ি' },
                { id: 'construction', label: '🏗️ নির্মাণ' },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id as any)} style={{
                  padding: '10px 18px', border: 'none', background: 'none',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', fontFamily: 'inherit',
                  color: tab === t.id ? 'var(--green-deep)' : 'var(--text-secondary)',
                  borderBottom: `2px solid ${tab === t.id ? 'var(--green-deep)' : 'transparent'}`,
                  marginBottom: -2,
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>⏳ লোড হচ্ছে...</div>
            ) : items.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map((item: any) => {
                  const status = STATUS_LABELS[item.status] || { label: item.status, color: '#6B7280' }
                  const img = item.images?.[0]?.url || null
                  const title = item.title || item.companyName || `${item.brand} ${item.model}`
                  return (
                    <div key={item.id} style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 80, height: 64, borderRadius: 8, background: 'var(--surface-2)', overflow: 'hidden', flexShrink: 0 }}>
                        {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            {tab === 'vehicle' ? '🚗' : tab === 'construction' ? '🏗️' : '🏠'}
                          </div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          📍 {item.district?.name} • {new Date(item.createdAt).toLocaleDateString('bn-BD')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <span style={{ background: `${status.color}18`, color: status.color, fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                          {status.label}
                        </span>
                        <Link href={getDetailLink(item)} style={{ color: 'var(--green-deep)', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
                          দেখুন →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>📭</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>কোনো বিজ্ঞাপন নেই</div>
                <Link href="/post-listing" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 8 }}>
                  + প্রথম বিজ্ঞাপন দিন
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
