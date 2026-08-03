'use client'
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import ProjectCard from '@/components/project/ProjectCard'
import Pagination from '@/components/common/Pagination'

const STATUSES = [
  { id: '', label: 'সব' },
  { id: 'UPCOMING', label: '🔜 শীঘ্রই' },
  { id: 'ONGOING', label: '🏗️ নির্মাণাধীন' },
  { id: 'READY', label: '✅ রেডি' },
  { id: 'COMPLETED', label: '🏁 সম্পন্ন' },
]

const TYPES = [
  { id: '', label: 'সব ধরন' },
  { id: 'RESIDENTIAL', label: '🏠 আবাসিক' },
  { id: 'COMMERCIAL', label: '🏢 বাণিজ্যিক' },
  { id: 'MIXED', label: '🏙️ মিশ্র' },
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [divisions, setDivisions] = useState<any[]>([])

  const [filters, setFilters] = useState({
    divisionId: '', districtId: '',
    projectType: '', status: '',
    search: '', page: 1,
  })

  const districts = divisions.find((d: any) => d.id.toString() === filters.divisionId)?.districts || []

  useEffect(() => {
    axios.get('/api/locations').then(r => setDivisions(r.data.data.divisions)).catch(() => {})
  }, [])

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v.toString()) })
      const res = await axios.get(`/api/projects/search?${params}`)
      setProjects(res.data.data.projects || [])
      setTotal(res.data.data.pagination.total)
      setTotalPages(res.data.data.pagination.totalPages)
    } catch { setProjects([]) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const set = (k: string, v: string) => setFilters(p => ({ ...p, [k]: v, page: 1 }))

  return (
    <div style={{ minHeight: '70vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--green-deep) 0%, #1a6b47 100%)', padding: '36px 0' }}>
        <div className="container">
          <h1 style={{ color: 'white', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 8 }}>
            🏗️ নতুন প্রজেক্ট ও ডেভলপার
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', marginBottom: 20 }}>
            বাংলাদেশের সেরা Developer-দের নতুন residential ও commercial project
          </p>

          {/* Search bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr auto', gap: 8, maxWidth: 700 }}>
            <select value={filters.divisionId}
              onChange={e => { set('divisionId', e.target.value); set('districtId', '') }}
              style={{ borderRadius: 8, border: 'none', padding: '10px 12px', fontSize: '0.9rem' }}>
              <option value="">বিভাগ</option>
              {divisions.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
            </select>
            <select value={filters.districtId} onChange={e => set('districtId', e.target.value)}
              disabled={!filters.divisionId}
              style={{ borderRadius: 8, border: 'none', padding: '10px 12px', fontSize: '0.9rem' }}>
              <option value="">জেলা</option>
              {districts.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
            </select>
            <input placeholder="Project বা Developer খুঁজুন..."
              value={filters.search} onChange={e => set('search', e.target.value)}
              style={{ borderRadius: 8, border: 'none', padding: '10px 12px', fontSize: '0.9rem' }} />
            <button onClick={fetchProjects}
              style={{ background: 'var(--amber)', color: '#1A1A2E', borderRadius: 8, border: 'none', padding: '10px 18px', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}>
              🔍
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '28px 0' }}>
        <div className="container">
          {/* Status + Type filters */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginRight: 4 }}>অবস্থা:</span>
            {STATUSES.map(s => (
              <button key={s.id} onClick={() => set('status', s.id)} style={{
                padding: '5px 14px', borderRadius: 99, fontFamily: 'inherit',
                border: `1.5px solid ${filters.status === s.id ? 'var(--green-deep)' : 'var(--border)'}`,
                background: filters.status === s.id ? 'var(--green-deep)' : 'white',
                color: filters.status === s.id ? 'white' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
              }}>{s.label}</button>
            ))}

            <div style={{ width: 1, background: 'var(--border)', height: 20, margin: '0 4px' }} />

            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginRight: 4 }}>ধরন:</span>
            {TYPES.map(t => (
              <button key={t.id} onClick={() => set('projectType', t.id)} style={{
                padding: '5px 14px', borderRadius: 99, fontFamily: 'inherit',
                border: `1.5px solid ${filters.projectType === t.id ? 'var(--green-deep)' : 'var(--border)'}`,
                background: filters.projectType === t.id ? 'var(--green-light)' : 'white',
                color: filters.projectType === t.id ? 'var(--green-deep)' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
              }}>{t.label}</button>
            ))}

            <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {total}টি project
            </span>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid-auto">
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ height: 300, background: 'var(--surface-2)', borderRadius: 12 }} />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <>
              <div className="grid-auto" style={{ marginBottom: 28 }}>
                {projects.map(p => <ProjectCard key={p.id} project={p} />)}
              </div>
              <Pagination current={filters.page} total={totalPages}
                onChange={p => setFilters(prev => ({ ...prev, page: p }))} />
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🏗️</div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>কোনো project পাওয়া যায়নি</div>
              <div style={{ fontSize: '0.88rem' }}>অন্য ফিল্টার দিয়ে চেষ্টা করুন</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
