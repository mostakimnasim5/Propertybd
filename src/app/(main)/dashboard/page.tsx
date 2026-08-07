'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'অপেক্ষমাণ', color: '#D97706' },
  ACTIVE:   { label: 'সক্রিয়', color: '#166A47' },
  SOLD:     { label: 'বিক্রিত', color: '#6B7280' },
  RENTED:   { label: 'ভাড়া হয়েছে', color: '#6B7280' },
  REJECTED: { label: 'বাতিল', color: '#DC2626' },
  EXPIRED:  { label: 'মেয়াদোত্তীর্ণ', color: '#9CA3AF' },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'property' | 'vehicle' | 'construction' | 'project'>('property')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ listings: 0, vehicles: 0, projects: 0, pending: 0 })

  // Fetch counts on mount
  useEffect(() => {
    Promise.allSettled([
      axios.get('/api/users/listings?category=property'),
      axios.get('/api/users/listings?category=vehicle'),
      axios.get('/api/users/projects'),
    ]).then(([propRes, vehRes, projRes]) => {
      const listings = propRes.status === 'fulfilled' ? (propRes.value.data.data.listings?.length || 0) : 0
      const vehicles = vehRes.status === 'fulfilled' ? (vehRes.value.data.data.vehicles?.length || 0) : 0
      const projects = projRes.status === 'fulfilled' ? (projRes.value.data.data.projects?.length || 0) : 0

      // Count pending across all
      const allListings = propRes.status === 'fulfilled' ? propRes.value.data.data.listings || [] : []
      const allVehicles = vehRes.status === 'fulfilled' ? vehRes.value.data.data.vehicles || [] : []
      const allProjects = projRes.status === 'fulfilled' ? projRes.value.data.data.projects || [] : []
      const pending = [...allListings, ...allVehicles].filter((i: any) => i.status === 'PENDING').length
        + allProjects.filter((i: any) => i.listingStatus === 'PENDING').length

      setStats({ listings, vehicles, projects, pending })
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    const url = tab === 'project'
      ? '/api/users/projects'
      : `/api/users/listings?category=${tab}`

    axios.get(url)
      .then(r => {
        const d = r.data.data
        setItems(d.listings || d.vehicles || d.companies || d.projects || [])
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [tab])

  const getDetailLink = (item: any) => {
    if (tab === 'vehicle') return `/vehicles/${item.id}`
    if (tab === 'construction') return `/construction/${item.id}`
    if (tab === 'project') return `/projects/${item.id}`
    return `/properties/${item.id}`
  }

  return (
    <div style={{ padding: '32px 0', minHeight: '70vh' }}>
      <div className="container">
        <div style={{ className="dashboard-layout" style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'start' }} }}>
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
              { href: '/dashboard/boost', label: '⚡ Listing Boost' },
              { href: '/subscription', label: '👔 Subscription' },
              { href: '/post-project', label: '🏗️ নতুন Project দিন' },
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
            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'প্রপার্টি', value: stats.listings, icon: '🏠', tab: 'property' as const },
                { label: 'গাড়ি', value: stats.vehicles, icon: '🚗', tab: 'vehicle' as const },
                { label: 'Projects', value: stats.projects, icon: '🏗️', tab: 'project' as const },
                { label: 'অনুমোদন বাকি', value: stats.pending, icon: '⏳', alert: true, tab: 'property' as const },
              ].map(card => (
                <div key={card.label} onClick={() => setTab(card.tab)}
                  style={{
                    background: card.alert && stats.pending > 0 ? '#FFFBEB' : 'white',
                    borderRadius: 10, padding: '12px 14px',
                    border: `1px solid ${card.alert && stats.pending > 0 ? '#FDE68A' : 'var(--border)'}`,
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'box-shadow 0.15s',
                  }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 3 }}>{card.icon}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: card.alert && stats.pending > 0 ? '#D97706' : 'var(--green-deep)' }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 1 }}>{card.label}</div>
                </div>
              ))}
            </div>

            {/* Header with split post button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--green-deep)' }}>আমার বিজ্ঞাপন</h1>
              <div style={{ display: 'flex', gap: 0 }}>
                <Link href="/post-listing" style={{
                  padding: '8px 12px', fontSize: '0.85rem', textDecoration: 'none',
                  background: 'var(--green-deep)', color: 'white', fontWeight: 700,
                  borderRadius: '8px 0 0 8px',
                }}>+ বিজ্ঞাপন</Link>
                <Link href="/post-project" style={{
                  padding: '8px 10px', fontSize: '0.85rem', textDecoration: 'none',
                  background: 'var(--amber)', color: '#1A1A2E', fontWeight: 800,
                  borderRadius: '0 8px 8px 0',
                  borderLeft: '1px solid rgba(255,255,255,0.4)',
                }} title="নতুন Project দিন">🏗️</Link>
              </div>
            </div>

            {/* Project tab: builder info banner */}
            {tab === 'project' && (
              <div style={{
                background: 'linear-gradient(135deg, var(--green-deep), #1a6b47)',
                borderRadius: 12, padding: '16px 20px', marginBottom: 16,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexWrap: 'wrap', gap: 12,
              }}>
                <div>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem', marginBottom: 4 }}>
                    🏗️ Developer Dashboard
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.82rem' }}>
                    আপনার {stats.projects}টি Project • সব মিলিয়ে unit ও buyer দেখুন
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href="/projects" style={{
                    padding: '7px 14px', borderRadius: 8, textDecoration: 'none',
                    background: 'rgba(255,255,255,0.15)', color: 'white',
                    fontWeight: 600, fontSize: '0.82rem',
                  }}>Public view →</Link>
                  <Link href="/post-project" style={{
                    padding: '7px 14px', borderRadius: 8, textDecoration: 'none',
                    background: 'var(--amber)', color: '#1A1A2E',
                    fontWeight: 700, fontSize: '0.82rem',
                  }}>+ নতুন Project</Link>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid var(--border)', overflowX: 'auto' }}>
              {[
                { id: 'property', label: '🏠 প্রপার্টি' },
                { id: 'vehicle', label: '🚗 গাড়ি' },
                { id: 'construction', label: '🔨 নির্মাণ' },
                { id: 'project', label: '🏗️ Projects' },
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id as any)} style={{
                  padding: '10px 16px', border: 'none', background: 'none',
                  fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
                  color: tab === t.id ? 'var(--green-deep)' : 'var(--text-secondary)',
                  borderBottom: `2px solid ${tab === t.id ? 'var(--green-deep)' : 'transparent'}`,
                  marginBottom: -2, whiteSpace: 'nowrap',
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
                  // Project tab has different status field
                  const statusKey = tab === 'project' ? item.listingStatus : item.status
                  const status = STATUS_LABELS[statusKey] || { label: statusKey, color: '#6B7280' }
                  const img = item.images?.[0]?.url || null
                  const title = tab === 'project'
                    ? item.title
                    : (item.title || item.companyName || `${item.brand} ${item.model}`)

                  return (
                    <div key={item.id} style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ width: 80, height: 64, borderRadius: 8, background: 'var(--surface-2)', overflow: 'hidden', flexShrink: 0 }}>
                        {img
                          ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            {tab === 'vehicle' ? '🚗' : tab === 'project' ? '🏗️' : tab === 'construction' ? '🔨' : '🏠'}
                          </div>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          📍 {item.district?.nameBn || item.district?.name}
                          {tab === 'project' && item._count?.units && ` • ${item._count.units}টি unit`}
                          {tab === 'project' && item.construction?.companyName && ` • ${item.construction.companyName}`}
                          {tab !== 'project' && ` • ${new Date(item.createdAt).toLocaleDateString('bn-BD')}`}
                        </div>
                        {tab === 'project' && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--green-deep)', fontWeight: 600, marginTop: 3 }}>
                            👁️ {item.viewCount || 0} বার দেখা
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                        <span style={{ background: `${status.color}18`, color: status.color, fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
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
                <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>
                  {tab === 'project' ? '🏗️' : '📭'}
                </div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  {tab === 'project' ? 'কোনো Project নেই' : 'কোনো বিজ্ঞাপন নেই'}
                </div>
                <Link
                  href={tab === 'project' ? '/post-project' : '/post-listing'}
                  className="btn-primary"
                  style={{ textDecoration: 'none', display: 'inline-flex', marginTop: 8 }}>
                  {tab === 'project' ? '🏗️ প্রথম Project দিন' : '+ প্রথম বিজ্ঞাপন দিন'}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
