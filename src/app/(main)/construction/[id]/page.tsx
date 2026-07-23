'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

export default function ConstructionDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [unlocking, setUnlocking] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    axios.get(`/api/construction/${id}`)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('কোম্পানি পাওয়া যায়নি'))
      .finally(() => setLoading(false))
  }, [id])

  const handleUnlock = async () => {
    if (!user) { window.location.href = `/login?redirect=/construction/${id}`; return }
    setUnlocking(true)
    try {
      const res = await axios.post('/api/payments/init', { type: 'lead', itemId: id, amount: 20 })
      window.location.href = res.data.data.gatewayUrl
    } catch { toast.error('Payment শুরু করতে সমস্যা হয়েছে') }
    finally { setUnlocking(false) }
  }

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ লোড হচ্ছে...</div>
  if (!data) return <div style={{ padding: '80px 0', textAlign: 'center' }}><div style={{ fontSize: '3rem' }}>😕</div><Link href="/construction" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex', textDecoration: 'none' }}>ফিরে যান</Link></div>

  const { company, isUnlocked, ownerPhone, avgRating } = data
  const services = (() => { try { return JSON.parse(company.services) } catch { return [] } })()

  return (
    <div style={{ padding: '32px 0' }}>
      <div className="container">
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>হোম</Link> →{' '}
          <Link href="/construction" style={{ color: 'inherit', textDecoration: 'none' }}>নির্মাণ</Link> → {company.companyName}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
          <div>
            {/* Cover image */}
            {company.coverImage && (
              <div style={{ borderRadius: 16, overflow: 'hidden', paddingTop: '45%', position: 'relative', marginBottom: 24, background: 'var(--surface-2)' }}>
                <img src={company.coverImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{company.companyName}</h1>
              {avgRating && <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--amber)' }}>★ {avgRating.toFixed(1)}</span>}
            </div>

            <div style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
              📍 {company.district?.nameBn} • {company.experience} বছরের অভিজ্ঞতা
              {company.owner?.nidVerified && <span className="badge-verified" style={{ marginLeft: 8 }}>✓ যাচাইকৃত</span>}
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20, marginBottom: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>আমাদের সম্পর্কে</div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9 }}>{company.description}</p>
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20, marginBottom: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>সেবাসমূহ</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {services.map((s: string, i: number) => (
                    <span key={i} style={{ background: 'var(--green-light)', color: 'var(--green-deep)', padding: '6px 14px', borderRadius: 99, fontSize: '0.88rem', fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {company.portfolio?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 12 }}>পোর্টফোলিও</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {company.portfolio.map((item: any) => (
                    <div key={item.id} style={{ borderRadius: 10, overflow: 'hidden', background: 'var(--surface-2)' }}>
                      <div style={{ paddingTop: '70%', position: 'relative' }}>
                        <img src={item.imageUrl} alt={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '8px 10px', fontSize: '0.82rem', fontWeight: 600 }}>{item.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {company.reviews?.length > 0 && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
                <div style={{ fontWeight: 700, marginBottom: 16 }}>রিভিউ ({company.reviews.length})</div>
                {company.reviews.map((r: any) => (
                  <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14, marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontWeight: 700 }}>{r.reviewer?.name || 'ব্যবহারকারী'}</span>
                      <span style={{ color: 'var(--amber)', fontWeight: 700 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    {r.comment && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact card */}
          <div style={{ position: 'sticky', top: 80 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>{company.companyName}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 16 }}>{company.experience} বছরের অভিজ্ঞতা</div>

              {isUnlocked ? (
                <>
                  <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 14, textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>যোগাযোগ নম্বর</div>
                    <a href={`tel:${ownerPhone}`} style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--green-deep)', textDecoration: 'none' }}>📞 {ownerPhone}</a>
                  </div>
                  <a href={`tel:${ownerPhone}`} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none' }}>কল করুন</a>
                </>
              ) : (
                <>
                  <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: 12, marginBottom: 12, fontSize: '0.88rem', color: '#92400E' }}>
                    🔒 যোগাযোগ নম্বর দেখতে ৳২০ দিন
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
