'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import axios from 'axios'
import Pagination from '@/components/common/Pagination'

const PROJECT_TYPES = [
  { id: '', label: 'সব ধরন' },
  { id: 'APARTMENT', label: 'ফ্ল্যাট প্রজেক্ট' },
  { id: 'COMMERCIAL', label: 'কমার্শিয়াল' },
  { id: 'HOUSING_ESTATE', label: 'আবাসিক এলাকা' },
  { id: 'VILLA', label: 'ভিলা' },
]

const PROJECT_STATUS = [
  { id: '', label: 'সব অবস্থা' },
  { id: 'UPCOMING', label: 'আসছে' },
  { id: 'ONGOING', label: 'নির্মাণাধীন' },
  { id: 'READY', label: 'হস্তান্তর প্রস্তুত' },
  { id: 'HANDED_OVER', label: 'হস্তান্তর সম্পন্ন' },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  UPCOMING: { label: 'আসছে', color: '#7C3AED', bg: '#EDE9FE' },
  ONGOING: { label: 'নির্মাণাধীন', color: '#D97706', bg: '#FEF3C7' },
  READY: { label: 'হস্তান্তর প্রস্তুত', color: '#166A47', bg: '#D1FAE5' },
  HANDED_OVER: { label: 'হস্তান্তর সম্পন্ন', color: '#6B7280', bg: '#F3F4F6' },
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [divisions, setDivisions] = useState<any[]>([])
  const [filters, setFilters] = useState({ type: '', status: '', divisionId: '', districtId: '', search: '', page: 1 })

  const districts = divisions.find((d: any) => d.id.toString() === filters.divisionId)?.districts || []

  useEffect(() => {
    axios.get('/api/locations').then(r => setDivisions(r.data.data.divisions)).catch(() => {})
  }, [])

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v.toString()) })
      const res = await axios.get(`/api/projects/search?${params}`)
      setProjects(res.data.data.projects)
      setTotal(res.data.data.pagination.total)
      setTotalPages(res.data.data.pagination.totalPages)
    } catch { setProjects([]) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetch() }, [fetch])

  const set = (k: string, v: string) => setFilters(p => ({ ...p, [k]: v, page: 1 }))

  return (
    <div style={{ padding: '24px 0', minHeight: '70vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: 800, color: 'var(--green-deep)', marginBottom: 4 }}>
            🏗️ Developer Projects — {total}টি
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            বাংলাদেশের সেরা real estate developer-দের নতুন প্রজেক্ট
          </p>
        </div>

        {/* Filters */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 16, marginBottom: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 12 }}>
            <select value={filters.divisionId} onChange={e => { set('divisionId', e.target.value); set('districtId', '') }}>
              <option value="">সব বিভাগ</option>
              {divisions.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
            </select>
            <select value={filters.districtId} onChange={e => set('districtId', e.target.value)} disabled={!filters.divisionId}>
              <option value="">সব জেলা</option>
              {districts.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
            </select>
            <select value={filters.type} onChange={e => set('type', e.target.value)}>
              {PROJECT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <select value={filters.status} onChange={e => set('status', e.target.value)}>
              {PROJECT_STATUS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <input placeholder="প্রজেক্ট বা কোম্পানির নাম খুঁজুন..."
            value={filters.search} onChange={e => set('search', e.target.value)} />
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid-auto">
            {[...Array(6)].map((_, i) => <div key={i} style={{ height: 300, background: 'var(--surface-2)', borderRadius: 14 }} />)}
          </div>
        ) : projects.length > 0 ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 32 }}>
              {projects.map(p => {
                const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.ONGOING
                const img = p.projectImages?.[0]?.url

                return (
                  <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="card" style={{ cursor: 'pointer' }}>
                      {/* Cover image */}
                      <div style={{ position: 'relative', paddingTop: '55%', background: 'linear-gradient(135deg, #e8f5ee, #d1e8da)', overflow: 'hidden' }}>
                        {img ? (
                          <img src={img} alt={p.projectName} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🏢</div>
                        )}
                        {/* Status badge */}
                        <span style={{ position: 'absolute', top: 10, left: 10, background: statusCfg.bg, color: statusCfg.color, fontSize: '0.68rem', fontWeight: 800, padding: '3px 9px', borderRadius: 99 }}>
                          {statusCfg.label}
                        </span>
                        {p.isFeatured && (
                          <span style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(245,166,35,0.95)', color: '#1A1A2E', fontSize: '0.68rem', fontWeight: 800, padding: '3px 9px', borderRadius: 99 }}>
                            ⭐ ফিচার্ড
                          </span>
                        )}
                      </div>

                      <div style={{ padding: '16px 18px' }}>
                        {/* Company */}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>
                          🏢 {p.companyName}
                        </div>

                        {/* Project name */}
                        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: 6, lineHeight: 1.3 }}>
                          {p.projectName}
                        </div>

                        {/* Location */}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                          📍 {p.areaName ? `${p.areaName}, ` : ''}{p.district?.nameBn}
                        </div>

                        {/* Stats row */}
                        <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                          <span>🏠 {p.totalUnits}টি unit</span>
                          <span>✅ {p.availableUnits}টি বাকি</span>
                          {p.handoverDate && (
                            <span>📅 {new Date(p.handoverDate).getFullYear()}</span>
                          )}
                        </div>

                        {/* Price range */}
                        <div style={{ fontWeight: 800, color: 'var(--green-deep)', fontSize: '0.95rem' }}>
                          ৳ {Number(p.minPrice).toLocaleString('bn-BD')}
                          {Number(p.maxPrice) > Number(p.minPrice) && ` — ৳ ${Number(p.maxPrice).toLocaleString('bn-BD')}`}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
            <Pagination current={filters.page} total={totalPages} onChange={p => setFilters(prev => ({ ...prev, page: p }))} />
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🏗️</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>কোনো প্রজেক্ট পাওয়া যায়নি</div>
            <div style={{ fontSize: '0.88rem' }}>অন্য ফিল্টার দিয়ে চেষ্টা করুন</div>
          </div>
        )}
      </div>
    </div>
  )
}
