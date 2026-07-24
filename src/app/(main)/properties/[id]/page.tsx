'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

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

  useEffect(() => {
    axios.get(`/api/listings/${id}`).then(r => {
      setData(r.data.data)
    }).catch(() => toast.error('বিজ্ঞাপন পাওয়া যায়নি'))
      .finally(() => setLoading(false))
  }, [id])

  const handleUnlock = async () => {
    if (!user) { window.location.href = `/login?redirect=/properties/${id}`; return }
    // Initiate payment
    setUnlocking(true)
    try {
      const res = await axios.post('/api/payments/init', { type: 'lead', itemId: id, amount: 20 })
      window.location.href = res.data.data.gatewayUrl
    } catch {
      toast.error('Payment শুরু করতে সমস্যা হয়েছে')
    } finally {
      setUnlocking(false)
    }
  }

  const handleSave = async () => {
    if (!user) { window.location.href = '/login'; return }
    try {
      const res = await axios.post('/api/users/saved', { listingId: id })
      setSaved(res.data.data.saved)
      toast.success(res.data.data.saved ? 'সংরক্ষিত হয়েছে' : 'সরানো হয়েছে')
    } catch { toast.error('সমস্যা হয়েছে') }
  }

  if (loading) return (
    <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '2rem' }}>⏳</div>
      <div style={{ marginTop: 12 }}>লোড হচ্ছে...</div>
    </div>
  )

  if (!data) return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem' }}>😕</div>
      <div style={{ marginTop: 12, fontWeight: 600 }}>বিজ্ঞাপন পাওয়া যায়নি</div>
      <Link href="/properties" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex', textDecoration: 'none' }}>প্রপার্টি দেখুন</Link>
    </div>
  )

  const { listing, isUnlocked, ownerPhone } = data
  const images = listing.images || []
  const primaryImg = images[activeImg]?.url || '/placeholder.jpg'

  return (
    <div style={{ padding: '32px 0', minHeight: '70vh' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>হোম</Link>
          {' → '}
          <Link href="/properties" style={{ color: 'inherit', textDecoration: 'none' }}>প্রপার্টি</Link>
          {' → '} {listing.title}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 24, alignItems: "start" }}>
          {/* Left: Images + details */}
          <div>
            {/* Main image */}
            <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--surface-2)', marginBottom: 12, position: 'relative', paddingTop: '60%' }}>
              <img src={primaryImg} alt={listing.title}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              {listing.isFeatured && (
                <span className="badge-featured" style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px' }}>
                  ⭐ ফিচার্ড
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto' }}>
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{
                    width: 72, height: 56, flexShrink: 0, borderRadius: 8,
                    overflow: 'hidden', padding: 0, cursor: 'pointer',
                    border: `2.5px solid ${i === activeImg ? 'var(--green-deep)' : 'transparent'}`,
                    background: 'none',
                  }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Title + badges */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <span className="badge-featured">{TYPE_LABELS[listing.type]}</span>
                <span className="badge-featured">{PURPOSE_LABELS[listing.purpose]}</span>
                {listing.owner?.nidVerified && <span className="badge-verified">✓ যাচাইকৃত</span>}
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>{listing.title}</h1>
              <div style={{ color: 'var(--text-secondary)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span>📍 {listing.areaName && `${listing.areaName}, `}{listing.district?.nameBn}</span>
                <span>👁️ {listing.viewCount} বার দেখা হয়েছে</span>
              </div>
            </div>

            {/* Specs grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
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
                <div key={i} style={{
                  background: 'var(--green-light)', borderRadius: 10,
                  padding: '12px 14px',
                }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{spec.icon}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{spec.label}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--green-deep)' }}>{spec.value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>বিবরণ</div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{listing.description}</p>
            </div>
          </div>

          {/* Right: Price + Contact card */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <div className="price-tag" style={{ fontSize: '1.7rem', marginBottom: 4 }}>
                ৳ {Number(listing.price).toLocaleString('bn-BD')}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 4 }}>
                {listing.purpose === 'RENT' ? 'প্রতি মাসে' : 'সর্বমোট'}
                {listing.negotiable && ' • দাম আলোচনাসাপেক্ষ'}
              </div>

              <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />

              {/* Owner info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'var(--green-deep)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '1.1rem',
                }}>
                  {(listing.owner?.name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{listing.owner?.name || 'মালিক'}</div>
                  {listing.owner?.nidVerified && <span className="badge-verified">✓ NID যাচাইকৃত</span>}
                </div>
              </div>

              {isUnlocked ? (
                <div>
                  <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 16, marginBottom: 12, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>মালিকের নম্বর</div>
                    <a href={`tel:${ownerPhone}`} style={{
                      fontSize: '1.3rem', fontWeight: 800,
                      color: 'var(--green-deep)', textDecoration: 'none',
                    }}>
                      📞 {ownerPhone}
                    </a>
                  </div>
                  <a href={`tel:${ownerPhone}`} className="btn-primary"
                    style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none', marginBottom: 10 }}>
                    কল করুন
                  </a>
                </div>
              ) : (
                <div>
                  <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: '0.88rem', color: '#92400E' }}>
                    🔒 মালিকের নম্বর দেখতে ৳২০ দিন
                  </div>
                  <button className="btn-primary" onClick={handleUnlock} disabled={unlocking}
                    style={{ width: '100%', justifyContent: 'center', marginBottom: 10 }}>
                    {unlocking ? 'প্রক্রিয়া হচ্ছে...' : '🔓 নম্বর দেখুন — ৳২০'}
                  </button>
                </div>
              )}

              <button onClick={handleSave} className="btn-outline"
                style={{ width: '100%', marginTop: 4 }}>
                {saved ? '❤️ সংরক্ষিত' : '🤍 সংরক্ষণ করুন'}
              </button>

              <div style={{ marginTop: 16, fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                বিজ্ঞাপন আইডি: {listing.id.slice(0, 8).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
