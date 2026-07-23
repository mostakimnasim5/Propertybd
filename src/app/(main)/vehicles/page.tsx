'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import VehicleCard from '@/components/vehicle/VehicleCard'
import Pagination from '@/components/common/Pagination'

const VEHICLE_TYPES = [
  { id: '', label: 'সব গাড়ি' },
  { id: 'CAR', label: '🚗 প্রাইভেট কার' },
  { id: 'BIKE', label: '🏍️ বাইক' },
]
const CONDITIONS = [
  { id: '', label: 'যেকোনো' },
  { id: 'NEW', label: 'নতুন' },
  { id: 'EXCELLENT', label: 'চমৎকার' },
  { id: 'GOOD', label: 'ভালো' },
  { id: 'FAIR', label: 'মোটামুটি' },
]
const PURPOSES = [
  { id: '', label: 'সব' },
  { id: 'SALE', label: 'বিক্রি' },
  { id: 'RENT', label: 'ভাড়া' },
]

export default function VehiclesPage() {
  const searchParams = useSearchParams()
  const [vehicles, setVehicles] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [divisions, setDivisions] = useState<any[]>([])

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    purpose: searchParams.get('purpose') || '',
    divisionId: '',
    districtId: searchParams.get('districtId') || '',
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
      const res = await axios.get(`/api/vehicles/search?${params}`)
      setVehicles(res.data.data.vehicles)
      setTotal(res.data.data.pagination.total)
      setTotalPages(res.data.data.pagination.totalPages)
    } catch { setVehicles([]) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])
  const upd = (k: string, v: string) => setFilters(p => ({ ...p, [k]: v, page: 1 }))

  return (
    <div style={{ padding: '32px 0', minHeight: '70vh' }}>
      <div className="container">
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 24, color: 'var(--green-deep)' }}>
          🚗 গাড়ি ও বাইক — {total} টি বিজ্ঞাপন
        </h1>

        {/* Type tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {VEHICLE_TYPES.map(t => (
            <button key={t.id} onClick={() => upd('type', t.id)} style={{
              padding: '8px 20px', borderRadius: 99, fontFamily: 'inherit',
              border: `2px solid ${filters.type === t.id ? 'var(--green-deep)' : 'var(--border)'}`,
              background: filters.type === t.id ? 'var(--green-deep)' : 'white',
              color: filters.type === t.id ? 'white' : 'var(--text-secondary)',
              fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Sidebar */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20, position: 'sticky', top: 80 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--green-deep)' }}>🔧 ফিল্টার</div>

            <div style={{ marginBottom: 16 }}>
              <label>উদ্দেশ্য</label>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                {PURPOSES.map(p => (
                  <button key={p.id} onClick={() => upd('purpose', p.id)} style={{
                    flex: 1, padding: '5px 8px', borderRadius: 99, fontFamily: 'inherit',
                    border: `1.5px solid ${filters.purpose === p.id ? 'var(--green-deep)' : 'var(--border)'}`,
                    background: filters.purpose === p.id ? 'var(--green-deep)' : 'white',
                    color: filters.purpose === p.id ? 'white' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
                  }}>{p.label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>অবস্থা</label>
              <select value={filters.condition} onChange={e => upd('condition', e.target.value)}>
                {CONDITIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>বিভাগ</label>
              <select value={filters.divisionId}
                onChange={e => { upd('divisionId', e.target.value); upd('districtId', '') }}>
                <option value="">সব বিভাগ</option>
                {divisions.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>জেলা</label>
              <select value={filters.districtId} onChange={e => upd('districtId', e.target.value)} disabled={!filters.divisionId}>
                <option value="">সব জেলা</option>
                {districts.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>দাম (টাকা)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input placeholder="সর্বনিম্ন" type="number" value={filters.minPrice} onChange={e => upd('minPrice', e.target.value)} />
                <input placeholder="সর্বোচ্চ" type="number" value={filters.maxPrice} onChange={e => upd('maxPrice', e.target.value)} />
              </div>
            </div>

            <button onClick={() => setFilters({ type: '', purpose: '', divisionId: '', districtId: '', condition: '', minPrice: '', maxPrice: '', search: '', page: 1 })}
              className="btn-outline" style={{ width: '100%' }}>ফিল্টার রিসেট</button>
          </div>

          {/* Grid */}
          <div>
            <input placeholder="ব্র্যান্ড, মডেল বা কীওয়ার্ড..." value={filters.search}
              onChange={e => upd('search', e.target.value)} style={{ marginBottom: 20 }} />

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
                {[...Array(6)].map((_, i) => <div key={i} style={{ height: 260, background: 'var(--surface-2)', borderRadius: 12 }} />)}
              </div>
            ) : vehicles.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
                  {vehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
                </div>
                <Pagination current={filters.page} total={totalPages} onChange={p => setFilters(prev => ({ ...prev, page: p }))} />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🚗</div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>কোনো গাড়ি পাওয়া যায়নি</div>
                <div style={{ fontSize: '0.9rem' }}>অন্য ফিল্টার দিয়ে চেষ্টা করুন</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
