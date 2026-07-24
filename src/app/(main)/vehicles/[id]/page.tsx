'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'নতুন', EXCELLENT: 'চমৎকার', GOOD: 'ভালো', FAIR: 'মোটামুটি',
}

export default function VehicleDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [unlocking, setUnlocking] = useState(false)

  useEffect(() => {
    axios.get(`/api/vehicles/${id}`)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('গাড়ি পাওয়া যায়নি'))
      .finally(() => setLoading(false))
  }, [id])

  const handleUnlock = async () => {
    if (!user) { window.location.href = `/login?redirect=/vehicles/${id}`; return }
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

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ লোড হচ্ছে...</div>
  if (!data) return (
    <div style={{ padding: '80px 0', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem' }}>😕</div>
      <div style={{ fontWeight: 600, marginTop: 12 }}>গাড়ি পাওয়া যায়নি</div>
      <Link href="/vehicles" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex', textDecoration: 'none' }}>গাড়ি দেখুন</Link>
    </div>
  )

  const { vehicle, isUnlocked, ownerPhone } = data
  const images = vehicle.images || []

  return (
    <div style={{ padding: '32px 0' }}>
      <div className="container">
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>হোম</Link> →{' '}
          <Link href="/vehicles" style={{ color: 'inherit', textDecoration: 'none' }}>গাড়ি</Link> → {vehicle.brand} {vehicle.model}
        </div>

        <div style={{ className="detail-layout" style={{ alignItems: 'start' }} }}>
          <div>
            {/* Main image */}
            <div style={{ borderRadius: 16, overflow: 'hidden', background: 'var(--surface-2)', paddingTop: '60%', position: 'relative', marginBottom: 10 }}>
              {images[activeImg]?.url ? (
                <img src={images[activeImg].url} alt={vehicle.title}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>
                  {vehicle.type === 'CAR' ? '🚗' : '🏍️'}
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{
                    width: 72, height: 52, borderRadius: 8, overflow: 'hidden', padding: 0, cursor: 'pointer',
                    border: `2.5px solid ${i === activeImg ? 'var(--green-deep)' : 'transparent'}`, background: 'none',
                  }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>{vehicle.title}</h1>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              📍 {vehicle.district?.nameBn} {vehicle.areaName ? `• ${vehicle.areaName}` : ''}
            </div>

            {/* Specs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 24 }}>
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
                  <div style={{ fontSize: '1.1rem', marginBottom: 3 }}>{spec.icon}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{spec.label}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--green-deep)' }}>{spec.value}</div>
                </div>
              ))}
            </div>

            {vehicle.description && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 10 }}>বিবরণ</div>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>{vehicle.description}</p>
              </div>
            )}
          </div>

          {/* Contact card */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span style={{ background: vehicle.purpose === 'SALE' ? 'var(--green-light)' : '#DBEAFE', color: vehicle.purpose === 'SALE' ? 'var(--green-deep)' : '#1D4ED8', fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                  {vehicle.purpose === 'SALE' ? 'বিক্রয়' : 'ভাড়া'}
                </span>
                <span style={{ background: 'var(--surface-2)', fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99, color: 'var(--text-secondary)' }}>
                  {CONDITION_LABELS[vehicle.condition]}
                </span>
              </div>

              <div className="price-tag" style={{ fontSize: '1.8rem', marginBottom: 4 }}>
                ৳ {Number(vehicle.price).toLocaleString('bn-BD')}
              </div>
              {vehicle.negotiable && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>দাম আলোচনাসাপেক্ষ</div>}

              <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--green-deep)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  {(vehicle.owner?.name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{vehicle.owner?.name || 'মালিক'}</div>
                  {vehicle.owner?.nidVerified && <span className="badge-verified">✓ যাচাইকৃত</span>}
                </div>
              </div>

              {isUnlocked ? (
                <>
                  <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 14, textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>মালিকের নম্বর</div>
                    <a href={`tel:${ownerPhone}`} style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--green-deep)', textDecoration: 'none' }}>📞 {ownerPhone}</a>
                  </div>
                  <a href={`tel:${ownerPhone}`} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none', marginBottom: 8 }}>📞 কল করুন</a>
                  <a href={`https://wa.me/${ownerPhone?.startsWith('0') ? '88' + ownerPhone : ownerPhone}`} target="_blank" rel="noopener" style={{ display: 'flex', justifyContent: 'center', padding: '10px', borderRadius: 8, textDecoration: 'none', background: '#25D366', color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>💬 WhatsApp করুন</a>
                </>
              ) : (
                <>
                  <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: '0.88rem', color: '#92400E' }}>
                    🔒 মালিকের নম্বর দেখতে ৳২০ দিন
                  </div>
                  <button className="btn-primary" onClick={handleUnlock} disabled={unlocking} style={{ width: '100%', justifyContent: 'center' }}>
                    {unlocking ? 'প্রক্রিয়া হচ্ছে...' : '🔓 নম্বর দেখুন — ৳২০'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
