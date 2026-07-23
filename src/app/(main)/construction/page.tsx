'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import axios from 'axios'
import Pagination from '@/components/common/Pagination'

export default function ConstructionPage() {
  const [companies, setCompanies] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [divisions, setDivisions] = useState<any[]>([])
  const [filters, setFilters] = useState({ divisionId: '', districtId: '', search: '', page: 1 })

  const districts = divisions.find((d: any) => d.id.toString() === filters.divisionId)?.districts || []

  useEffect(() => {
    axios.get('/api/locations').then(r => setDivisions(r.data.data.divisions)).catch(() => {})
  }, [])

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v.toString()) })
      const res = await axios.get(`/api/construction/search?${params}`)
      setCompanies(res.data.data.companies)
      setTotal(res.data.data.pagination.total)
      setTotalPages(res.data.data.pagination.totalPages)
    } catch { setCompanies([]) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetch() }, [fetch])

  const updateFilter = (key: string, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))

  return (
    <div style={{ padding: '32px 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 24, color: 'var(--green-deep)' }}>
          🏗️ নির্মাণ সেবা — {total} টি কোম্পানি
        </h1>

        {/* Filters */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 16, marginBottom: 24, display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 12 }}>
          <select value={filters.divisionId} onChange={e => { updateFilter('divisionId', e.target.value); updateFilter('districtId', '') }}>
            <option value="">সব বিভাগ</option>
            {divisions.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
          </select>
          <select value={filters.districtId} onChange={e => updateFilter('districtId', e.target.value)} disabled={!filters.divisionId}>
            <option value="">সব জেলা</option>
            {districts.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
          </select>
          <input placeholder="কোম্পানির নাম বা সেবা খুঁজুন..." value={filters.search}
            onChange={e => updateFilter('search', e.target.value)} />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {[...Array(6)].map((_, i) => <div key={i} style={{ height: 200, background: 'var(--surface-2)', borderRadius: 12 }} />)}
          </div>
        ) : companies.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
              {companies.map((c: any) => (
                <Link key={c.id} href={`/construction/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="card" style={{ cursor: 'pointer' }}>
                    <div style={{ padding: 20 }}>
                      {c.portfolio?.[0]?.imageUrl && (
                        <div style={{ borderRadius: 10, overflow: 'hidden', paddingTop: '50%', position: 'relative', marginBottom: 14, background: 'var(--surface-2)' }}>
                          <img src={c.portfolio[0].imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{c.companyName}</div>
                        {c.isFeatured && <span className="badge-featured">⭐ ফিচার্ড</span>}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.7,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {c.description}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          📍 {c.district?.nameBn} • {c.experience} বছরের অভিজ্ঞতা
                        </span>
                        {c.avgRating && (
                          <span style={{ fontWeight: 700, color: 'var(--amber)', fontSize: '0.9rem' }}>
                            ★ {c.avgRating.toFixed(1)} ({c.reviewCount})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination current={filters.page} total={totalPages}
              onChange={p => setFilters(prev => ({ ...prev, page: p }))} />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🏗️</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>কোনো কোম্পানি পাওয়া যায়নি</div>
            <div style={{ fontSize: '0.9rem' }}>অন্য ফিল্টার দিয়ে চেষ্টা করুন</div>
          </div>
        )}
      </div>
    </div>
  )
}
