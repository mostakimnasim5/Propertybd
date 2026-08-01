'use client'
import Link from 'next/link'
import axios from 'axios'

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'নতুন', EXCELLENT: 'চমৎকার', GOOD: 'ভালো', FAIR: 'মোটামুটি',
}

interface Props {
  vehicle: any
  featuredId?: string
  isFeaturedSlot?: boolean
}

export default function VehicleCard({ vehicle, featuredId, isFeaturedSlot }: Props) {
  const img = vehicle.images?.[0]?.url || null

  const handleClick = () => {
    if (featuredId && vehicle.id) {
      axios.post('/api/featured/click', {
        featuredId,
        listingId: vehicle.id,
        districtId: vehicle.districtId,
      }).catch(() => {})
    }
  }

  return (
    <Link href={`/vehicles/${vehicle.id}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={handleClick}>
      <div className="card" style={{
        cursor: 'pointer',
        outline: isFeaturedSlot ? '2px solid rgba(245,166,35,0.4)' : 'none',
      }}>
        <div style={{ position: 'relative', paddingTop: '62%', background: 'var(--surface-2)', overflow: 'hidden' }}>
          {img ? (
            <img src={img} alt={vehicle.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>
              {vehicle.type === 'CAR' ? '🚗' : '🏍️'}
            </div>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4 }}>
            {isFeaturedSlot && (
              <span style={{ background: 'rgba(245,166,35,0.95)', color: '#1A1A2E', fontSize: '0.65rem', fontWeight: 800, padding: '2px 7px', borderRadius: 99 }}>
                ⚡ স্পন্সরড
              </span>
            )}
            {vehicle.isFeatured && !isFeaturedSlot && (
              <span className="badge-featured">⭐ ফিচার্ড</span>
            )}
          </div>

          <span style={{
            position: 'absolute', top: 8, right: 8,
            background: vehicle.purpose === 'SALE' ? 'var(--green-deep)' : '#1D4ED8',
            color: 'white', fontSize: '0.65rem', fontWeight: 700,
            padding: '2px 7px', borderRadius: 99,
          }}>
            {vehicle.purpose === 'SALE' ? 'বিক্রয়' : 'ভাড়া'}
          </span>
        </div>

        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
            <span style={{ background: 'var(--surface-2)', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 99, color: 'var(--text-secondary)' }}>
              {CONDITION_LABELS[vehicle.condition]}
            </span>
            <span style={{ background: 'var(--green-light)', color: 'var(--green-deep)', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>
              {vehicle.year}
            </span>
          </div>

          <div style={{ fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.35, marginBottom: 4 }}>
            {vehicle.brand} {vehicle.model}
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            📍 {vehicle.district?.nameBn}
            {vehicle.mileage ? ` • ${vehicle.mileage.toLocaleString()} কিমি` : ''}
          </div>

          <div className="price-tag">
            ৳ {Number(vehicle.price).toLocaleString('bn-BD')}
            {vehicle.negotiable && (
              <span style={{ fontSize: '0.68rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 4 }}>আলোচনাসাপেক্ষ</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
