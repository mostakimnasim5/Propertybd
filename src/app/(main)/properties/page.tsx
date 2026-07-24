'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import ListingCard from '@/components/listing/ListingCard'
import Pagination from '@/components/common/Pagination'

const TYPES = [
  { id: '', label: 'সব ধরন' }, { id: 'FLAT', label: 'ফ্ল্যাট' },
  { id: 'HOUSE', label: 'বাড়ি' }, { id: 'LAND', label: 'জমি' },
  { id: 'SHOP', label: 'দোকান/অফিস' }, { id: 'WAREHOUSE', label: 'গোডাউন' },
]
const PURPOSES = [{ id: '', label: 'সব' }, { id: 'SALE', label: 'বিক্রি' }, { id: 'RENT', label: 'ভাড়া' }]
const BEDROOMS = [{ id: '', label: 'যেকোনো' }, { id: '1', label: '১ রুম' }, { id: '2', label: '২ রুম' }, { id: '3', label: '৩ রুম' }, { id: '4', label: '৪+' }]

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [divisions, setDivisions] = useState<any[]>([])
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '', purpose: searchParams.get('purpose') || '',
    divisionId: '', districtId: searchParams.get('districtId') || '',
    bedrooms: '', minPrice: '', maxPrice: '',
    search: searchParams.get('search') || '', page: 1,
  })

  const districts = divisions.find((d: any) => d.id.toString() === filters.divisionId)?.districts || []

  useEffect(() => {
    axios.get('/api/locations').then(r => setDivisions(r.data.data.divisions)).catch(() => {})
  }, [])

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v.toString()) })
      const res = await axios.get(`/api/listings/search?${params}`)
      setListings(res.data.data.listings)
      setTotal(res.data.data.pagination.total)
      setTotalPages(res.data.data.pagination.totalPages)
    } catch { setListings([]) }
    finally { setLoading(false) }
  }, [filters])

  useEffect(() => { fetchListings() }, [fetchListings])

  const set = (key: string, value: string) => setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  const reset = () => setFilters({ type: '', purpose: '', divisionId: '', districtId: '', bedrooms: '', minPrice: '', maxPrice: '', search: '', page: 1 })

  const FilterContent = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontWeight: 700, color: 'var(--green-deep)' }}>🔧 ফিল্টার</div>
        <button onClick={reset} style={{ background: 'none', border: 'none', color: 'var(--red)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem' }}>রিসেট</button>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label>উদ্দেশ্য</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
          {PURPOSES.map(p => (
            <button key={p.id} onClick={() => set('purpose', p.id)} style={{
              padding: '5px 12px', borderRadius: 99, fontFamily: 'inherit',
              border: `1.5px solid ${filters.purpose === p.id ? 'var(--green-deep)' : 'var(--border)'}`,
              background: filters.purpose === p.id ? 'var(--green-deep)' : 'white',
              color: filters.purpose === p.id ? 'white' : 'var(--text-secondary)',
              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer',
            }}>{p.label}</button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label>ধরন</label>
        <select value={filters.type} onChange={e => set('type', e.target.value)}>
          {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label>বিভাগ</label>
        <select value={filters.divisionId} onChange={e => { set('divisionId', e.target.value); set('districtId', '') }}>
          <option value="">সব বিভাগ</option>
          {divisions.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label>জেলা</label>
        <select value={filters.districtId} onChange={e => set('districtId', e.target.value)} disabled={!filters.divisionId}>
          <option value="">সব জেলা</option>
          {districts.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label>বেডরুম</label>
        <select value={filters.bedrooms} onChange={e => set('bedrooms', e.target.value)}>
          {BEDROOMS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label>দাম (টাকা)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
          <h1 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.6rem)', fontWeight: 800, color: 'var(--green-deep)' }}>
            🏠 প্রপার্টি — {total}টি
          </h1>
          {/* Mobile filter toggle */}
          <button onClick={() => setFilterOpen(!filterOpen)} className="show-mobile" style={{
            padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--green-deep)',
            background: filterOpen ? 'var(--green-deep)' : 'white',
            color: filterOpen ? 'white' : 'var(--green-deep)',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem',
            display: 'none',
          }}>
            {filterOpen ? '✕ বন্ধ' : '🔧 ফিল্টার'}
          </button>
        </div>

        {/* Mobile filter panel */}
        {filterOpen && (
          <div className="show-mobile" style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 16, marginBottom: 16, display: 'none' }}>
            <FilterContent />
          </div>
        )}

        <div className="sidebar-layout">
          {/* Desktop sidebar */}
          <div className="hide-mobile" style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 18, position: 'sticky', top: 72 }}>
            <FilterContent />
          </div>

          {/* Listings */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <input placeholder="এলাকা বা কীওয়ার্ড দিয়ে খুঁজুন..."
                value={filters.search} onChange={e => set('search', e.target.value)} />
            </div>

            {loading ? (
              <div className="grid-auto">
                {[...Array(6)].map((_, i) => <div key={i} style={{ height: 260, background: 'var(--surface-2)', borderRadius: 12 }} />)}
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="grid-auto" style={{ marginBottom: 28 }}>
                  {listings.map(l => <ListingCard key={l.id} listing={l} />)}
                </div>
                <Pagination current={filters.page} total={totalPages} onChange={p => setFilters(prev => ({ ...prev, page: p }))} />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🏚️</div>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>কোনো বিজ্ঞাপন পাওয়া যায়নি</div>
                <div style={{ fontSize: '0.88rem' }}>অন্য ফিল্টার দিয়ে চেষ্টা করুন</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
