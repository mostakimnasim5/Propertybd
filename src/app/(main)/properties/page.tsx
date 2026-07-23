'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'
import ListingCard from '@/components/listing/ListingCard'
import Pagination from '@/components/common/Pagination'

const TYPES = [
  { id: '', label: 'সব ধরন' },
  { id: 'FLAT', label: 'ফ্ল্যাট' },
  { id: 'HOUSE', label: 'বাড়ি' },
  { id: 'LAND', label: 'জমি' },
  { id: 'SHOP', label: 'দোকান/অফিস' },
  { id: 'WAREHOUSE', label: 'গোডাউন' },
]

const PURPOSES = [
  { id: '', label: 'সব' },
  { id: 'SALE', label: 'বিক্রি' },
  { id: 'RENT', label: 'ভাড়া' },
]

const BEDROOMS = [
  { id: '', label: 'যেকোনো' },
  { id: '1', label: '১ রুম' },
  { id: '2', label: '২ রুম' },
  { id: '3', label: '৩ রুম' },
  { id: '4', label: '৪+ রুম' },
]

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [listings, setListings] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [divisions, setDivisions] = useState<any[]>([])

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    purpose: searchParams.get('purpose') || '',
    divisionId: '',
    districtId: searchParams.get('districtId') || '',
    bedrooms: '',
    minPrice: '',
    maxPrice: '',
    search: searchParams.get('search') || '',
    page: 1,
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
    } catch {
      setListings([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchListings() }, [fetchListings])

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  return (
    <div style={{ padding: '32px 0', minHeight: '70vh' }}>
      <div className="container">
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 24, color: 'var(--green-deep)' }}>
          🏠 প্রপার্টি — {total} টি বিজ্ঞাপন
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 24, alignItems: 'start' }}>
          {/* Sidebar filters */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20, position: 'sticky', top: 80 }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, color: 'var(--green-deep)' }}>
              🔧 ফিল্টার
            </div>

            {/* Purpose */}
            <div style={{ marginBottom: 16 }}>
              <label>উদ্দেশ্য</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                {PURPOSES.map(p => (
                  <button key={p.id} onClick={() => updateFilter('purpose', p.id)} style={{
                    padding: '5px 14px', borderRadius: 99,
                    border: `1.5px solid ${filters.purpose === p.id ? 'var(--green-deep)' : 'var(--border)'}`,
                    background: filters.purpose === p.id ? 'var(--green-deep)' : 'white',
                    color: filters.purpose === p.id ? 'white' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
                  }}>{p.label}</button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div style={{ marginBottom: 16 }}>
              <label>ধরন</label>
              <select value={filters.type} onChange={e => updateFilter('type', e.target.value)}>
                {TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>

            {/* Location */}
            <div style={{ marginBottom: 16 }}>
              <label>বিভাগ</label>
              <select value={filters.divisionId}
                onChange={e => { updateFilter('divisionId', e.target.value); updateFilter('districtId', '') }}>
                <option value="">সব বিভাগ</option>
                {divisions.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label>জেলা</label>
              <select value={filters.districtId} onChange={e => updateFilter('districtId', e.target.value)}
                disabled={!filters.divisionId}>
                <option value="">সব জেলা</option>
                {districts.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
              </select>
            </div>

            {/* Bedrooms */}
            <div style={{ marginBottom: 16 }}>
              <label>বেডরুম</label>
              <select value={filters.bedrooms} onChange={e => updateFilter('bedrooms', e.target.value)}>
                {BEDROOMS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
              </select>
            </div>

            {/* Price range */}
            <div style={{ marginBottom: 16 }}>
              <label>দাম (টাকা)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input placeholder="সর্বনিম্ন" type="number"
                  value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} />
                <input placeholder="সর্বোচ্চ" type="number"
                  value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} />
              </div>
            </div>

            <button onClick={() => setFilters({ type: '', purpose: '', divisionId: '', districtId: '', bedrooms: '', minPrice: '', maxPrice: '', search: '', page: 1 })}
              className="btn-outline" style={{ width: '100%', marginTop: 8 }}>
              ফিল্টার রিসেট
            </button>
          </div>

          {/* Listings grid */}
          <div>
            {/* Search bar */}
            <div style={{ marginBottom: 20 }}>
              <input placeholder="এলাকা বা কীওয়ার্ড দিয়ে খুঁজুন..."
                value={filters.search}
                onChange={e => updateFilter('search', e.target.value)} />
            </div>

            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} style={{ height: 280, background: 'var(--surface-2)', borderRadius: 12 }} />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginBottom: 32 }}>
                  {listings.map(l => <ListingCard key={l.id} listing={l} />)}
                </div>
                <Pagination current={filters.page} total={totalPages}
                  onChange={p => setFilters(prev => ({ ...prev, page: p }))} />
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🏚️</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>কোনো বিজ্ঞাপন পাওয়া যায়নি</div>
                <div style={{ fontSize: '0.9rem' }}>অন্য ফিল্টার দিয়ে চেষ্টা করুন</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
