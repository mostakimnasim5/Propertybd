'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import VehicleCard from '@/components/vehicle/VehicleCard'
import Pagination from '@/components/common/Pagination'

const TYPES = [{ id: '', label: 'সব' }, { id: 'CAR', label: 'গাড়ি' }, { id: 'BIKE', label: 'বাইক' }]
const PURPOSES = [{ id: '', label: 'সব' }, { id: 'SALE', label: 'বিক্রি' }, { id: 'RENT', label: 'ভাড়া' }]
const CONDITIONS = [
  { id: '', label: 'যেকোনো' }, { id: 'NEW', label: 'নতুন' },
  { id: 'EXCELLENT', label: 'চমৎকার' }, { id: 'GOOD', label: 'ভালো' }, { id: 'FAIR', label: 'মোটামুটি' },
]

export default function VehiclesPage() {
  const searchParams = useSearchParams()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [divisions, setDivisions] = useState<any[]>([])
  const [filterOpen, setFilterOpen] = useState(false)

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    purpose: searchParams.get('purpose') || '',
    districtId: searchParams.get('districtId') || '',
    divisionId: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    search: searchParams.get('search') || '',
    page: 1,
  })

  const districts = divisions.find((d: any) => d.id.toString() === filters.divisionId)?.districts || []

  useEffect(() => {
    axios.get('/api/locations').then(r => setDivisions(r.data.data.divisions)).catch(() => {})
  }, [])

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v.toString()) })

      const [regularRes, featuredRes] = await Promise.allSettled([
        axios.get(`/api/vehicles/search?${params}`),
        axios.get(`/api/featured/listings?${new URLSearchParams({
          ...(filters.districtId && { districtId: filters.districtId }),
          ...(filters.type && { type: filters.type }),
          ...(filters.purpose && { purpose: filters.purpose }),
          limit: '3',
        })}`),
      ])

      if (regularRes.status === 'fulfilled') {
        setVehicles(regularRes.value.data.data.vehicles || [])
        setTotal(regularRes.value.data.data.pagination?.total || 0)
        setTotalPages(regularRes.value.data.data.pagination?.totalPages || 1)
      }

      if (featuredRes.status === 'fulfilled') {
        // Vehicle-specific featured only
        setFeaturedVehicles(featuredRes.value.data.data.listings || [])
      } else {
        setFeaturedVehicles([])
      }
    } catch { setVehicles([]) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  const set = (k: string, v: string) => setFilters(p => ({ ...p, [k]: v, page: 1 }))

  const FilterContent = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ fontWeight: 700, color: 'var(--green-deep)' }}>🔧 ফিল্টার</div>
        <button onClick={() => setFilters({ type: '', purpose: '', districtId: '', divisionId: '', condition: '', minPrice: '', maxPrice: '', search: '', page: 1 })}
          style={{ background: 'none', border: 'none', color: 'var(--red)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}>রিসেট</button>
      </div>

      {/* Type pills */}
      <div style={{ marginBottom: 12 }}>
        <label>ধরন</label>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {TYPES.map(t => (
            <button key={t.id} onClick={() => set('type', t.id)} style={{
              padding: '4px 12px', borderRadius: 99, fontFamily: 'inherit',
              border: `1.5px solid ${filters.type === t.id ? 'var(--green-deep)' : 'var(--border)'}`,
              background: filters.type === t.id ? 'var(--green-deep)' : 'white',
              color: filters.type === t.id ? 'white' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Purpose pills */}
      <div style={{ marginBottom: 12 }}>
        <label>উদ্দেশ্য</label>
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          {PURPOSES.map(p => (
            <button key={p.id} onClick={() => set('purpose', p.id)} style={{
              padding: '4px 12px', borderRadius: 99, fontFamily: 'inherit',
              border: `1.5px solid ${filters.purpose === p.id ? 'var(--green-deep)' : 'var(--border)'}`,
              background: filters.purpose === p.id ? 'var(--green-deep)' : 'white',
              color: filters.purpose === p.id ? 'white' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
            }}>{p.label}</button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>অবস্থা</label>
        <select value={filters.condition} onChange={e => set('condition', e.target.value)}>
          {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>বিভাগ</label>
        <select value={filters.divisionId} onChange={e => { set('divisionId', e.target.value); set('districtId', '') }}>
          <option value="">সব বিভাগ</option>
          {divisions.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>জেলা</label>
        <select value={filters.districtId} onChange={e => set('districtId', e.target.value)} disabled={!filters.divisionId}>
          <option value="">সব জেলা</option>
          {districts.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 8 }}>
        <label>দাম (টাকা)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <input placeholder="সর্বনিম্ন" type="number" value={filters.minPrice} onChange={e => set('minPrice', e.target.value)} />
          <input placeholder="সর্বোচ্চ" type="number" value={filters.maxPrice} onChange={e => set('maxPrice', e.target.value)} />
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '24px 0', minHeight: '70vh' }}>
      <div className="container">
        <div className="flex-between" style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 800, color: 'var(--green-deep)' }}>
            🚗 গাড়ি ও বাইক — {total}টি
          </h1>
          <button onClick={() => setFilterOpen(!filterOpen)} className="show-mobile" style={{
            padding: '7px 14px', borderRadius: 8,
            border: `1.5px solid var(--green-deep)`,
            background: filterOpen ? 'var(--green-deep)' : 'white',
            color: filterOpen ? 'white' : 'var(--green-deep)',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
            display: 'none',
          }}>
            {filterOpen ? '✕ বন্ধ' : '🔧 ফিল্টার'}
          </button>
        </div>

        {filterOpen && (
          <div className="show-mobile" style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 16, marginBottom: 16, display: 'none' }}>
            <FilterContent />
          </div>
        )}

        <div className="sidebar-layout">
          <div className="hide-mobile" style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 16, position: 'sticky', top: 72 }}>
            <FilterContent />
          </div>

          <div>
            <div style={{ marginBottom: 14 }}>
              <input placeholder="ব্র্যান্ড বা মডেল খুঁজুন..."
                value={filters.search} onChange={e => set('search', e.target.value)} />
            </div>

            {loading ? (
              <div className="grid-auto">
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ height: 260, background: 'var(--surface-2)', borderRadius: 12 }} />
                ))}
              </div>
            ) : (
              <>
                {/* Featured vehicle slots */}
                {featuredVehicles.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <span style={{ background: 'rgba(245,166,35,0.15)', color: '#92400E', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99, border: '1px solid rgba(245,166,35,0.3)' }}>
                        ⚡ স্পন্সরড বিজ্ঞাপন
                      </span>
                    </div>
                    <div className="grid-auto">
                      {featuredVehicles.map((f: any) => (
                        <VehicleCard
                          key={`f-${f.featuredId}`}
                          vehicle={f.listing}
                          featuredId={f.featuredId}
                          isFeaturedSlot={true}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '20px 0 16px' }}>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>সাধারণ বিজ্ঞাপন</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>
                  </div>
                )}

                {/* Regular vehicles */}
                {vehicles.length > 0 ? (
                  <>
                    <div className="grid-auto" style={{ marginBottom: 28 }}>
                      {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
                    </div>
                    <Pagination current={filters.page} total={totalPages}
                      onChange={p => setFilters(prev => ({ ...prev, page: p }))} />
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🚗</div>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>কোনো গাড়ি পাওয়া যায়নি</div>
                    <div style={{ fontSize: '0.88rem' }}>অন্য ফিল্টার দিয়ে চেষ্টা করুন</div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
