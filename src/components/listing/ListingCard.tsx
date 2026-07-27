'use client'
import Link from 'next/link'
import axios from 'axios'

const TYPE_LABELS: Record<string, string> = {
  FLAT: 'ফ্ল্যাট', HOUSE: 'বাড়ি', LAND: 'জমি',
  SHOP: 'দোকান', OFFICE: 'অফিস', WAREHOUSE: 'গোডাউন', BUILDING: 'ভবন',
}

interface Props {
  listing: any
  featuredId?: string   // থাকলে click track করবে
  isFeaturedSlot?: boolean  // sponsored badge দেখাবে
}

export default function ListingCard({ listing, featuredId, isFeaturedSlot }: Props) {
  const img = listing.images?.[0]?.url || null

  const handleClick = () => {
    if (featuredId && listing.id) {
      // Fire-and-forget click tracking
      axios.post('/api/featured/click', {
        featuredId,
        listingId: listing.id,
        districtId: listing.districtId,
      }).catch(() => {})
    }
  }

  return (
    <Link href={`/properties/${listing.id}`} style={{ textDecoration: 'none', color: 'inherit' }} onClick={handleClick}>
      <div className="card" style={{
        cursor: 'pointer',
        outline: isFeaturedSlot ? '2px solid rgba(245,166,35,0.4)' : 'none',
      }}>
        {/* Image */}
        <div style={{ position: 'relative', paddingTop: '62%', background: 'var(--surface-2)', overflow: 'hidden' }}>
          {img ? (
            <img src={img} alt={listing.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem' }}>🏠</div>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {isFeaturedSlot && (
              <span style={{ background: 'rgba(245,166,35,0.95)', color: '#1A1A2E', fontSize: '0.65rem', fontWeight: 800, padding: '2px 7px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
                ⚡ স্পন্সরড
              </span>
            )}
            {listing.isFeatured && !isFeaturedSlot && (
              <span className="badge-featured">⭐ ফিচার্ড</span>
            )}
          </div>

          <span style={{
            position: 'absolute', top: 8, right: 8,
            background: listing.purpose === 'SALE' ? 'var(--green-deep)' : '#1D4ED8',
            color: 'white', fontSize: '0.65rem', fontWeight: 700,
            padding: '2px 7px', borderRadius: 99,
          }}>
            {listing.purpose === 'SALE' ? 'বিক্রয়' : 'ভাড়া'}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
            <span style={{ background: 'var(--green-light)', color: 'var(--green-deep)', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>
              {TYPE_LABELS[listing.type] || listing.type}
            </span>
            {listing.owner?.nidVerified && (
              <span className="badge-verified">✓ যাচাই</span>
            )}
          </div>

          <div style={{
            fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.35, marginBottom: 5,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {listing.title}
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            📍 {listing.areaName ? `${listing.areaName}, ` : ''}{listing.district?.nameBn}
          </div>

          {(listing.bedrooms || listing.bathrooms || listing.area) && (
            <div style={{ display: 'flex', gap: 8, fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
              {listing.bedrooms && <span>🛏 {listing.bedrooms}</span>}
              {listing.bathrooms && <span>🚿 {listing.bathrooms}</span>}
              {listing.area && <span>📐 {listing.area}</span>}
            </div>
          )}

          <div className="price-tag">
            ৳ {Number(listing.price).toLocaleString('bn-BD')}
            {listing.purpose === 'RENT' && (
              <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 2 }}>/মাস</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
