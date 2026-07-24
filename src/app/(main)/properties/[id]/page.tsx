'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import ListingCard from '@/components/listing/ListingCard'

const TYPE_LABELS: Record<string, string> = {
  FLAT: 'ফ্ল্যাট', HOUSE: 'বাড়ি', LAND: 'জমি',
  SHOP: 'দোকান', OFFICE: 'অফিস', WAREHOUSE: 'গোডাউন', BUILDING: 'ভবন',
}
const PURPOSE_LABELS: Record<string, string> = { SALE: 'বিক্রয়', RENT: 'ভাড়া' }

export default function PropertyDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [unlocking, setUnlocking] = useState(false)
  const [saved, setSaved] = useState(false)
  const [similar, setSimilar] = useState<any[]>([])

  useEffect(() => {
    axios.get(`/api/listings/${id}`)
      .then(r => {
        setData(r.data.data)
        const l = r.data.data.listing
        // Fetch similar listings
        axios.get(`/api/listings/similar?listingId=${id}&districtId=${l.districtId}&type=${l.type}&purpose=${l.purpose}`)
          .then(r2 => setSimilar(r2.data.data.similar || []))
          .catch(() => {})
      })
      .catch(() => toast.error('বিজ্ঞাপন পাওয়া যায়নি'))
      .finally(() => setLoading(false))
  }, [id])

  const handleUnlock = async () => {
    if (!user) { window.location.href = `/login?redirect=/properties/${id}`; return }
    setUnlocking(true)
    try {
      const res = await axios.post('/api/payments/init', { type: 'lead', itemId: id, amount: 20 })
      window.location.href = res.data.data.gatewayUrl
    } catch {
      toast.error('Payment শুরু করতে সমস্যা হয়েছে')
    } finally { setUnlocking(false) }
  }

  const handleSave = async () => {
    if (!user) { window.location.href = '/login'; return }
    try {
      const res = await axios.post('/api/users/saved', { listingId: id })
      setSaved(res.data.data.saved)
      toast.success(res.data.data.saved ? '❤️ সংরক্ষিত হয়েছে' : 'সরানো হয়েছে')
    } catch { toast.error('সমস্যা হয়েছে') }
  }

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ লোড হচ্ছে...</div>
  if (!data) return (
    <div style={{ padding: '80px 0', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem' }}>😕</div>
      <div style={{ fontWeight: 600, marginTop: 12 }}>বিজ্ঞাপন পাওয়া যায়নি</div>
      <Link href="/properties" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex', textDecoration: 'none' }}>প্রপার্টি দেখুন</Link>
    </div>
  )

  const { listing, isUnlocked, ownerPhone } = data
  const images = listing.images || []
  const waLink = ownerPhone
    ? `https://wa.me/${ownerPhone.startsWith('0') ? '88' + ownerPhone : ownerPhone}?text=${encodeURIComponent(`PropertyBD থেকে আপনার বিজ্ঞাপন "${listing.title}" সম্পর্কে জানতে চাই।`)}`
    : '#'

  return (
    <div style={{ padding: '24px 0' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>হোম</Link> →{' '}
          <Link href="/properties" style={{ color: 'inherit', textDecoration: 'none' }}>প্রপার্টি</Link> → {listing.title}
        </div>

        <div className="detail-layout">
          {/* Left */}
          <div>
            {/* Main image */}
            <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--surface-2)', paddingTop: '60%', position: 'relative', marginBottom: 10 }}>
              {images[activeImg]?.url
                ? <img src={images[activeImg].url} alt={listing.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🏠</div>
              }
              {listing.isFeatured && <span className="badge-featured" style={{ position: 'absolute', top: 10, left: 10 }}>⭐ ফিচার্ড</span>}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{
                    width: 68, height: 52, flexShrink: 0, borderRadius: 8, overflow: 'hidden',
                    padding: 0, cursor: 'pointer', background: 'none',
                    border: `2.5px solid ${i === activeImg ? 'var(--green-deep)' : 'transparent'}`,
                  }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Badges + title */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              <span className="badge-featured">{TYPE_LABELS[listing.type]}</span>
              <span style={{ background: listing.purpose === 'SALE' ? 'var(--green-light)' : '#DBEAFE', color: listing.purpose === 'SALE' ? 'var(--green-deep)' : '#1D4ED8', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                {PURPOSE_LABELS[listing.purpose]}
              </span>
              {listing.owner?.nidVerified && <span className="badge-verified">✓ যাচাইকৃত</span>}
            </div>

            <h1 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>{listing.title}</h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
              📍 {listing.areaName ? `${listing.areaName}, ` : ''}{listing.district?.nameBn}
              <span style={{ marginLeft: 12 }}>👁️ {listing.viewCount} বার দেখা হয়েছে</span>
            </div>

            {/* Specs */}
            <div className="spec-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
              {[
                listing.area && { icon: '📐', label: 'আয়তন', value: `${listing.area} বর্গফুট` },
                listing.bedrooms && { icon: '🛏️', label: 'বেডরুম', value: `${listing.bedrooms}টি` },
                listing.bathrooms && { icon: '🚿', label: 'বাথরুম', value: `${listing.bathrooms}টি` },
                listing.floor && { icon: '🏢', label: 'ফ্লোর', value: `${listing.floor}/${listing.totalFloors}` },
                listing.facing && { icon: '🧭', label: 'দিক', value: listing.facing },
                { icon: '🛋️', label: 'ফার্নিচার', value: listing.furnished ? 'ফার্নিশড' : 'আনফার্নিশড' },
                listing.parking && { icon: '🚗', label: 'পার্কিং', value: 'আছে' },
                listing.lift && { icon: '🛗', label: 'লিফট', value: 'আছে' },
                listing.gasLine && { icon: '🔥', label: 'গ্যাস', value: 'আছে' },
              ].filter(Boolean).map((spec: any, i) => (
                <div key={i} style={{ background: 'var(--green-light)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: '1.1rem', marginBottom: 3 }}>{spec.icon}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{spec.label}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--green-deep)' }}>{spec.value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 18, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>বিবরণ</div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{listing.description}</p>
            </div>

            {/* Share buttons */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank" rel="noopener" style={{
                  padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
                  background: '#1877F2', color: 'white', fontWeight: 600, fontSize: '0.85rem',
                }}>📘 Facebook-এ শেয়ার</a>
              <a href={`https://wa.me/?text=${encodeURIComponent(`PropertyBD-তে দেখুন: ${listing.title} - ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                target="_blank" rel="noopener" style={{
                  padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
                  background: '#25D366', color: 'white', fontWeight: 600, fontSize: '0.85rem',
                }}>💬 WhatsApp-এ শেয়ার</a>
            </div>
          </div>

          {/* Right: Contact card */}
          <div className="detail-contact-card" style={{ position: 'sticky', top: 72 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div className="price-tag" style={{ fontSize: '1.7rem', marginBottom: 4 }}>
                ৳ {Number(listing.price).toLocaleString('bn-BD')}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: 4 }}>
                {listing.purpose === 'RENT' ? 'প্রতি মাসে' : 'সর্বমোট'}
                {listing.negotiable && ' • আলোচনাসাপেক্ষ'}
              </div>

              <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />

              {/* Owner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green-deep)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                  {(listing.owner?.name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{listing.owner?.name || 'মালিক'}</div>
                  {listing.owner?.nidVerified && <span className="badge-verified">✓ NID যাচাই</span>}
                </div>
              </div>

              {isUnlocked ? (
                <>
                  <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 14, textAlign: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 3 }}>মালিকের নম্বর</div>
                    <a href={`tel:${ownerPhone}`} style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--green-deep)', textDecoration: 'none' }}>
                      📞 {ownerPhone}
                    </a>
                  </div>
                  <a href={`tel:${ownerPhone}`} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none', marginBottom: 8 }}>
                    📞 কল করুন
                  </a>
                  <a href={waLink} target="_blank" rel="noopener" style={{
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6,
                    padding: '10px', borderRadius: 8, textDecoration: 'none',
                    background: '#25D366', color: 'white', fontWeight: 600, fontSize: '0.9rem',
                    marginBottom: 8,
                  }}>
                    💬 WhatsApp করুন
                  </a>
                </>
              ) : (
                <>
                  <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: 10, marginBottom: 10, fontSize: '0.85rem', color: '#92400E' }}>
                    🔒 নম্বর দেখতে মাত্র ৳২০ দিন
                  </div>
                  <button className="btn-primary" onClick={handleUnlock} disabled={unlocking}
                    style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}>
                    {unlocking ? 'প্রক্রিয়া হচ্ছে...' : '🔓 নম্বর দেখুন — ৳২০'}
                  </button>
                </>
              )}

              <button onClick={handleSave} className="btn-outline" style={{ width: '100%' }}>
                {saved ? '❤️ সংরক্ষিত' : '🤍 সংরক্ষণ করুন'}
              </button>

              <div style={{ marginTop: 14, fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                বিজ্ঞাপন ID: {listing.id.slice(0, 8).toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Similar listings */}
        {similar.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div className="flex-between" style={{ marginBottom: 20 }}>
              <div className="section-title" style={{ fontSize: '1.2rem' }}>একই এলাকার আরো বিজ্ঞাপন</div>
              <Link href={`/properties?districtId=${listing.districtId}&type=${listing.type}`}
                style={{ color: 'var(--green-deep)', fontWeight: 700, textDecoration: 'none', fontSize: '0.88rem' }}>
                সব দেখুন →
              </Link>
            </div>
            <div className="grid-auto">
              {similar.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
