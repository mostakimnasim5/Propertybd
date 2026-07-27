'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'নতুন', EXCELLENT: 'চমৎকার', GOOD: 'ভালো', FAIR: 'মোটামুটি',
}

export default function VehicleDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    axios.get(`/api/vehicles/${id}`)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('গাড়ি পাওয়া যায়নি'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ লোড হচ্ছে...</div>
  if (!data) return (
    <div style={{ padding: '80px 0', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem' }}>😕</div>
      <Link href="/vehicles" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex', textDecoration: 'none' }}>গাড়ি দেখুন</Link>
    </div>
  )

  const { vehicle, ownerPhone } = data
  const images = vehicle.images || []
  const waLink = ownerPhone
    ? `https://wa.me/${ownerPhone.startsWith('0') ? '88' + ownerPhone : ownerPhone}?text=${encodeURIComponent(`PropertyBD থেকে ${vehicle.brand} ${vehicle.model} সম্পর্কে জানতে চাই।`)}`
    : '#'

  return (
    <div style={{ padding: '24px 0' }}>
      <div className="container">
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>হোম</Link> →{' '}
          <Link href="/vehicles" style={{ color: 'inherit', textDecoration: 'none' }}>গাড়ি</Link> → {vehicle.brand} {vehicle.model}
        </div>

        <div className="detail-layout">
          <div>
            {/* Image */}
            <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--surface-2)', paddingTop: '60%', position: 'relative', marginBottom: 10 }}>
              {images[activeImg]?.url
                ? <img src={images[activeImg].url} alt={vehicle.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>{vehicle.type === 'CAR' ? '🚗' : '🏍️'}</div>
              }
            </div>

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
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

            <h1 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: 800, marginBottom: 8 }}>{vehicle.title}</h1>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.88rem' }}>
              📍 {vehicle.district?.nameBn} {vehicle.areaName ? `• ${vehicle.areaName}` : ''}
            </div>

            {/* Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginBottom: 20 }}>
              {[
                { icon: '🏷️', label: 'ব্র্যান্ড', value: vehicle.brand },
                { icon: '🚘', label: 'মডেল', value: vehicle.model },
                { icon: '📅', label: 'বছর', value: vehicle.year },
                { icon: '🔧', label: 'অবস্থা', value: CONDITION_LABELS[vehicle.condition] },
                vehicle.mileage && { icon: '🛣️', label: 'মাইলেজ', value: `${vehicle.mileage.toLocaleString()} কিমি` },
                vehicle.color && { icon: '🎨', label: 'রঙ', value: vehicle.color },
                vehicle.fuelType && { icon: '⛽', label: 'জ্বালানি', value: vehicle.fuelType },
                vehicle.transmission && { icon: '⚙️', label: 'গিয়ার', value: vehicle.transmission },
              ].filter(Boolean).map((spec: any, i) => (
                <div key={i} style={{ background: 'var(--green-light)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: '1rem', marginBottom: 3 }}>{spec.icon}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{spec.label}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--green-deep)' }}>{spec.value}</div>
                </div>
              ))}
            </div>

            {vehicle.description && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 18 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>বিবরণ</div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{vehicle.description}</p>
              </div>
            )}
          </div>

          {/* Contact card */}
          <div className="detail-contact-card" style={{ position: 'sticky', top: 72 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                <span style={{ background: vehicle.purpose === 'SALE' ? 'var(--green-light)' : '#DBEAFE', color: vehicle.purpose === 'SALE' ? 'var(--green-deep)' : '#1D4ED8', fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                  {vehicle.purpose === 'SALE' ? 'বিক্রয়' : 'ভাড়া'}
                </span>
                <span style={{ background: 'var(--surface-2)', fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99, color: 'var(--text-secondary)' }}>
                  {CONDITION_LABELS[vehicle.condition]}
                </span>
              </div>

              <div className="price-tag" style={{ fontSize: '1.7rem', marginBottom: 4 }}>
                ৳ {Number(vehicle.price).toLocaleString('bn-BD')}
              </div>
              {vehicle.negotiable && <div style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginBottom: 14 }}>আলোচনাসাপেক্ষ</div>}

              <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green-deep)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {(vehicle.owner?.name || 'M')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{vehicle.owner?.name || 'মালিক'}</div>
                  {vehicle.owner?.nidVerified && <span className="badge-verified">✓ যাচাইকৃত</span>}
                </div>
              </div>

              {/* Phone — always visible */}
              {ownerPhone && (
                <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: 14, textAlign: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 3 }}>মালিকের নম্বর</div>
                  <a href={`tel:${ownerPhone}`} style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--green-deep)', textDecoration: 'none' }}>
                    📞 {ownerPhone}
                  </a>
                </div>
              )}

              <a href={`tel:${ownerPhone}`} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none', marginBottom: 8 }}>
                📞 কল করুন
              </a>
              <a href={waLink} target="_blank" rel="noopener" style={{
                display: 'flex', justifyContent: 'center', padding: '10px', borderRadius: 8,
                textDecoration: 'none', background: '#25D366', color: 'white', fontWeight: 600, fontSize: '0.9rem',
              }}>
                💬 WhatsApp করুন
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
