'use client'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/admin/stats')
      .then(r => setStats(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const cards = stats ? [
    { icon: '👥', label: 'মোট ব্যবহারকারী', value: stats.totalUsers, color: '#3B82F6' },
    { icon: '🏠', label: 'সক্রিয় প্রপার্টি', value: stats.totalListings, color: '#166A47' },
    { icon: '⏳', label: 'অনুমোদন বাকি', value: stats.pendingListings, color: '#D97706', alert: true },
    { icon: '🚗', label: 'সক্রিয় গাড়ি', value: stats.totalVehicles, color: '#8B5CF6' },
    { icon: '🔔', label: 'গাড়ি অনুমোদন বাকি', value: stats.pendingVehicles, color: '#EF4444', alert: true },
    { icon: '🔓', label: 'মোট Lead Unlock', value: stats.totalLeads, color: '#F59E0B' },
    { icon: '🏗️', label: 'সক্রিয় নির্মাণ', value: stats.totalConstruction, color: '#06B6D4' },
    { icon: '💰', label: 'মোট আয় (৳)', value: `${(stats.totalLeads * 20).toLocaleString()}`, color: '#10B981' },
  ] : []

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>📊 ড্যাশবোর্ড</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>PropertyBD-র সামগ্রিক পরিসংখ্যান</p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[...Array(8)].map((_, i) => <div key={i} style={{ height: 100, background: 'white', borderRadius: 12 }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
          {cards.map((card, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 12,
              border: `1px solid ${card.alert ? `${card.color}40` : 'var(--border)'}`,
              padding: '20px 20px',
              boxShadow: card.alert ? `0 0 0 1px ${card.color}30` : 'none',
            }}>
              <div style={{ fontSize: '1.6rem', marginBottom: 8 }}>{card.icon}</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: card.color }}>{card.value}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: 'var(--green-deep)' }}>⚡ দ্রুত অ্যাকশন</div>
          {[
            { href: '/admin/listings?status=PENDING', label: '🏠 প্রপার্টি অনুমোদন করুন', count: stats?.pendingListings },
            { href: '/admin/listings?status=PENDING&category=vehicle', label: '🚗 গাড়ি অনুমোদন করুন', count: stats?.pendingVehicles },
            { href: '/admin/users', label: '👥 ব্যবহারকারী দেখুন', count: stats?.totalUsers },
          ].map((item, i) => (
            <a key={i} href={item.href} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', borderBottom: '1px solid var(--border)',
              textDecoration: 'none', color: 'var(--text-primary)',
            }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.label}</span>
              {item.count !== undefined && (
                <span style={{ background: 'var(--green-light)', color: 'var(--green-deep)', fontWeight: 700, fontSize: '0.78rem', padding: '2px 8px', borderRadius: 99 }}>
                  {item.count}
                </span>
              )}
            </a>
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: 'var(--green-deep)' }}>📈 Revenue Overview</div>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--green-deep)' }}>
              ৳ {stats ? (stats.totalLeads * 20).toLocaleString() : 0}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 6 }}>
              Lead Unlock থেকে মোট আয়
            </div>
            <div style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {stats?.totalLeads || 0} টি lead × ৳২০
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
