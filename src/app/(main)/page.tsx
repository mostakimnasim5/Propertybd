'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import ListingCard from '@/components/listing/ListingCard'
import VehicleCard from '@/components/vehicle/VehicleCard'

const CATEGORIES = [
  { id: 'property', label: 'প্রপার্টি', icon: '🏠', sub: 'ফ্ল্যাট • বাড়ি • জমি' },
  { id: 'vehicle', label: 'গাড়ি', icon: '🚗', sub: 'কার • বাইক' },
  { id: 'construction', label: 'নির্মাণ', icon: '🏗️', sub: 'বিল্ডার • ঠিকাদার' },
]
const PURPOSES = [
  { id: 'ALL', label: 'সব' },
  { id: 'SALE', label: 'বিক্রি' },
  { id: 'RENT', label: 'ভাড়া' },
]
const STATS = [
  { value: '৫০,০০০+', label: 'সক্রিয় বিজ্ঞাপন' },
  { value: '৬৪', label: 'জেলায় সেবা' },
  { value: '১০,০০০+', label: 'সন্তুষ্ট গ্রাহক' },
  { value: '৯৮%', label: 'যাচাইকৃত বিজ্ঞাপন' },
]

export default function HomePage() {
  const router = useRouter()
  const [category, setCategory] = useState('property')
  const [purpose, setPurpose] = useState('ALL')
  const [searchText, setSearchText] = useState('')
  const [divisions, setDivisions] = useState<any[]>([])
  const [selectedDivision, setSelectedDivision] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [featuredListings, setFeaturedListings] = useState<any[]>([])
  const [featuredVehicles, setFeaturedVehicles] = useState<any[]>([])
  const [loadingListings, setLoadingListings] = useState(true)

  useEffect(() => {
    axios.get('/api/locations').then(r => setDivisions(r.data.data.divisions)).catch(() => {})
    axios.get('/api/listings/search?limit=6').then(r => {
      setFeaturedListings(r.data.data.listings || [])
      setLoadingListings(false)
    }).catch(() => setLoadingListings(false))
    axios.get('/api/vehicles/search?limit=4').then(r => setFeaturedVehicles(r.data.data.vehicles || [])).catch(() => {})
  }, [])

  const districts = divisions.find(d => d.id.toString() === selectedDivision)?.districts || []

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchText) params.set('search', searchText)
    if (selectedDistrict) params.set('districtId', selectedDistrict)
    if (purpose !== 'ALL') params.set('purpose', purpose)
    if (category === 'vehicle') return router.push(`/vehicles?${params}`)
    if (category === 'construction') return router.push(`/construction?${params}`)
    router.push(`/properties?${params}`)
  }

  return (
    <div>
      {/* ── Hero ─────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, var(--green-deep) 0%, #1a6b47 60%, #0d5a3c 100%)', padding: 'clamp(36px, 8vw, 64px) 0 clamp(48px, 10vw, 80px)', position: 'relative', overflow: 'hidden' }}>
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <p style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '0.82rem', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>বাংলাদেশের সেরা মার্কেটপ্লেস</p>
            <h1 className="hero-title" style={{ color: 'white', fontSize: 'clamp(1.5rem, 5vw, 2.8rem)', fontWeight: 800, lineHeight: 1.25, marginBottom: 12 }}>
              আপনার স্বপ্নের সম্পদ<br /><span style={{ color: 'var(--amber)' }}>এখানেই খুঁজুন</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)', maxWidth: 500, margin: '0 auto' }}>
              সারা বাংলাদেশে ফ্ল্যাট, বাড়ি, জমি, গাড়ি কেনা-বেচা ও ভাড়া
            </p>
          </div>

          {/* Search box */}
          <div style={{ background: 'white', borderRadius: 16, padding: 'clamp(16px, 4vw, 24px)', maxWidth: 760, margin: '0 auto', boxShadow: 'var(--shadow-lg)' }}>
            {/* Category tabs */}
            <div className="hero-cats" style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '2px solid var(--border)', paddingBottom: 14 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} onClick={() => setCategory(cat.id)} className="hero-cat-btn" style={{
                  flex: 1, padding: '8px 6px', border: 'none', borderRadius: 10, cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: category === cat.id ? 700 : 500, fontSize: '0.85rem',
                  background: category === cat.id ? 'var(--green-light)' : 'transparent',
                  color: category === cat.id ? 'var(--green-deep)' : 'var(--text-secondary)',
                  textAlign: 'center', transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: 2 }}>{cat.icon}</div>
                  <div>{cat.label}</div>
                  <div style={{ fontSize: '0.68rem', opacity: 0.7, marginTop: 1 }} className="hide-mobile">{cat.sub}</div>
                </button>
              ))}
            </div>

            {/* Purpose pills */}
            {category !== 'construction' && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {PURPOSES.map(p => (
                  <button key={p.id} onClick={() => setPurpose(p.id)} style={{
                    padding: '5px 16px', border: `2px solid ${purpose === p.id ? 'var(--green-deep)' : 'var(--border)'}`,
                    borderRadius: 99, background: purpose === p.id ? 'var(--green-deep)' : 'transparent',
                    color: purpose === p.id ? 'white' : 'var(--text-secondary)',
                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
                  }}>{p.label}</button>
                ))}
              </div>
            )}

            {/* Search inputs */}
            <div className="hero-search-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8 }}>
              <select value={selectedDivision} onChange={e => { setSelectedDivision(e.target.value); setSelectedDistrict('') }} style={{ fontSize: '0.9rem' }}>
                <option value="">বিভাগ</option>
                {divisions.map(d => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
              </select>
              <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)} disabled={!selectedDivision} style={{ fontSize: '0.9rem' }}>
                <option value="">জেলা</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
              </select>
              <input placeholder="এলাকা / কীওয়ার্ড..." value={searchText} onChange={e => setSearchText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} style={{ fontSize: '0.9rem' }} />
              <button className="btn-primary" onClick={handleSearch} style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>🔍 খুঁজুন</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ───────────────────────────── */}
      <section style={{ background: 'white', borderBottom: '1px solid var(--border)' }}>
        <div className="container stats-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '20px 1rem', gap: 8 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '4px 0' }}>
              <div style={{ fontSize: 'clamp(1.2rem, 4vw, 1.7rem)', fontWeight: 800, color: 'var(--green-deep)' }}>{s.value}</div>
              <div style={{ fontSize: 'clamp(0.72rem, 2vw, 0.85rem)', color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recent Listings ─────────────────────── */}
      <section style={{ padding: 'clamp(36px, 8vw, 56px) 0' }}>
        <div className="container">
          <div className="flex-between" style={{ marginBottom: 20 }}>
            <div>
              <div className="section-title">সাম্প্রতিক প্রপার্টি</div>
              <div className="section-sub" style={{ marginBottom: 0 }}>নতুন যোগ হওয়া বিজ্ঞাপন</div>
            </div>
            <a href="/properties" style={{ color: 'var(--green-deep)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>সব দেখুন →</a>
          </div>

          {loadingListings ? (
            <div className="grid-auto">
              {[...Array(6)].map((_, i) => <div key={i} style={{ height: 260, background: 'var(--surface-2)', borderRadius: 12 }} />)}
            </div>
          ) : featuredListings.length > 0 ? (
            <div className="grid-auto">
              {featuredListings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 10 }}>🏠</div>
              <div>এখনো কোনো বিজ্ঞাপন নেই</div>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────── */}
      <section style={{ background: 'var(--amber-light)', padding: 'clamp(32px, 6vw, 48px) 0', borderTop: '1px solid rgba(245,166,35,0.3)' }}>
        <div className="container flex-between">
          <div>
            <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 800, color: 'var(--green-deep)', marginBottom: 6 }}>
              সম্পদ বিক্রি বা ভাড়া দিতে চান?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>বিনামূল্যে বিজ্ঞাপন দিন, লক্ষ মানুষের কাছে পৌঁছান।</p>
          </div>
          <a href="/post-listing" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', whiteSpace: 'nowrap', marginTop: 8 }}>+ বিজ্ঞাপন দিন</a>
        </div>
      </section>

      {/* ── Vehicles ────────────────────────────── */}
      {featuredVehicles.length > 0 && (
        <section style={{ padding: 'clamp(36px, 8vw, 56px) 0', background: 'white' }}>
          <div className="container">
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <div>
                <div className="section-title">গাড়ি ও বাইক</div>
                <div className="section-sub" style={{ marginBottom: 0 }}>সেকেন্ড হ্যান্ড গাড়ি ও বাইক</div>
              </div>
              <a href="/vehicles" style={{ color: 'var(--green-deep)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>সব দেখুন →</a>
            </div>
            <div className="grid-auto">
              {featuredVehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── How it works ────────────────────────── */}
      <section style={{ padding: 'clamp(36px, 8vw, 56px) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className="section-title">কীভাবে কাজ করে?</div>
            <div className="section-sub">মাত্র ৩টি ধাপে কাজ সম্পন্ন করুন</div>
          </div>
          <div className="grid-3" style={{ gap: 20 }}>
            {[
              { step: '১', title: 'অনুসন্ধান করুন', desc: 'লোকেশন, বাজেট ও ধরন দিয়ে খুঁজুন', icon: '🔍' },
              { step: '২', title: 'যোগাযোগ করুন', desc: 'লিড আনলক করে সরাসরি মালিকের সাথে যোগাযোগ করুন', icon: '📞' },
              { step: '৩', title: 'চুক্তি করুন', desc: 'সরাসরি দেখে পছন্দ হলে চুক্তি করুন', icon: '🤝' },
            ].map(item => (
              <div key={item.step} style={{ textAlign: 'center', padding: '28px 20px', background: 'white', borderRadius: 16, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>{item.icon}</div>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--green-deep)', color: 'white', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>{item.step}</div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{item.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
