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
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [hoveredStar, setHoveredStar] = useState(0)

  const fetchData = () => {
    axios.get(`/api/construction/${id}`)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('কোম্পানি পাওয়া যায়নি'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [id])

  const handleUnlock = async () => {
    if (!user) { window.location.href = `/login?redirect=/construction/${id}`; return }
    setUnlocking(true)
    try {
      const res = await axios.post('/api/payments/init', { type: 'lead', itemId: id, amount: 20 })
      window.location.href = res.data.data.gatewayUrl
    } catch { toast.error('Payment শুরু করতে সমস্যা হয়েছে') }
    finally { setUnlocking(false) }
  }

  const handleReview = async () => {
    if (!user) { window.location.href = '/login'; return }
    setSubmittingReview(true)
    try {
      await axios.post('/api/reviews', { constructionId: id, rating, comment })
      toast.success('রিভিউ জমা হয়েছে!')
      setComment('')
      setRating(5)
      fetchData() // Refresh to show new review
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'রিভিউ দেওয়া যায়নি')
    } finally { setSubmittingReview(false) }
  }

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ লোড হচ্ছে...</div>
  if (!data) return (
    <div style={{ padding: '80px 0', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem' }}>😕</div>
      <Link href="/construction" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex', textDecoration: 'none' }}>ফিরে যান</Link>
    </div>
  )

  const { company, isUnlocked, ownerPhone, avgRating } = data
  const services = (() => { try { return JSON.parse(company.services) } catch { return [] } })()
  const waLink = ownerPhone
    ? `https://wa.me/${ownerPhone.startsWith('0') ? '88' + ownerPhone : ownerPhone}?text=${encodeURIComponent(`PropertyBD থেকে ${company.companyName} সম্পর্কে জানতে চাই।`)}`
    : '#'

  return (
    <div style={{ padding: '24px 0' }}>
      <div className="container">
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>হোম</Link> →{' '}
          <Link href="/construction" style={{ color: 'inherit', textDecoration: 'none' }}>নির্মাণ</Link> → {company.companyName}
        </div>

        <div className="detail-layout">
          {/* Left */}
          <div>
            {company.coverImage && (
              <div style={{ borderRadius: 14, overflow: 'hidden', paddingTop: '45%', position: 'relative', marginBottom: 20, background: 'var(--surface-2)' }}>
                <img src={company.coverImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            <div className="flex-between" style={{ marginBottom: 10 }}>
              <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: 800 }}>{company.companyName}</h1>
              {avgRating && <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--amber)' }}>★ {avgRating.toFixed(1)}</span>}
            </div>

            <div style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>
              📍 {company.district?.nameBn} • {company.experience} বছরের অভিজ্ঞতা
              {company.owner?.nidVerified && <span className="badge-verified" style={{ marginLeft: 8 }}>✓ যাচাই</span>}
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 18, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>আমাদের সম্পর্কে</div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, fontSize: '0.95rem' }}>{company.description}</p>
            </div>

            {services.length > 0 && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 18, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>সেবাসমূহ</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {services.map((s: string, i: number) => (
                    <span key={i} style={{ background: 'var(--green-light)', color: 'var(--green-deep)', padding: '6px 14px', borderRadius: 99, fontSize: '0.85rem', fontWeight: 600 }}>{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {company.portfolio?.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>পোর্টফোলিও</div>
                <div className="grid-3" style={{ gap: 10 }}>
                  {company.portfolio.map((item: any) => (
                    <div key={item.id} style={{ borderRadius: 10, overflow: 'hidden', background: 'var(--surface-2)' }}>
                      <div style={{ paddingTop: '70%', position: 'relative' }}>
                        <img src={item.imageUrl} alt={item.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ padding: '8px 10px', fontSize: '0.8rem', fontWeight: 600 }}>{item.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 18, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 16 }}>
                রিভিউ {company.reviews?.length > 0 ? `(${company.reviews.length})` : ''}
              </div>

              {company.reviews?.length > 0 ? (
                <div style={{ marginBottom: 20 }}>
                  {company.reviews.map((r: any) => (
                    <div key={r.id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
                      <div className="flex-between" style={{ marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.reviewer?.name || 'ব্যবহারকারী'}</span>
                        <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '0.9rem' }}>
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </span>
                      </div>
                      {r.comment && <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{r.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 16 }}>এখনো কোনো রিভিউ নেই। প্রথম রিভিউ দিন!</p>
              )}

              {/* Review form */}
              {user && user.role !== 'ADMIN' && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>রিভিউ দিন</div>

                  {/* Star rating */}
                  <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setRating(star)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          fontSize: '1.8rem', lineHeight: 1, padding: 0,
                          color: star <= (hoveredStar || rating) ? 'var(--amber)' : '#D1D5DB',
                          transition: 'color 0.1s',
                        }}>★</button>
                    ))}
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', alignSelf: 'center', marginLeft: 6 }}>
                      {['', 'খারাপ', 'মোটামুটি', 'ভালো', 'অনেক ভালো', 'চমৎকার'][hoveredStar || rating]}
                    </span>
                  </div>

                  <textarea rows={3} placeholder="আপনার অভিজ্ঞতা লিখুন (ঐচ্ছিক)..."
                    value={comment} onChange={e => setComment(e.target.value)}
                    style={{ resize: 'vertical', marginBottom: 10 }} />

                  <button className="btn-primary" onClick={handleReview} disabled={submittingReview}>
                    {submittingReview ? 'জমা হচ্ছে...' : '✅ রিভিউ দিন'}
                  </button>
                </div>
              )}

              {!user && (
                <Link href="/login" style={{ color: 'var(--green-deep)', fontWeight: 600, textDecoration: 'none', fontSize: '0.88rem' }}>
                  রিভিউ দিতে লগইন করুন →
                </Link>
              )}
            </div>
          </div>

          {/* Right: Contact card */}
          <div className="detail-contact-card" style={{ position: 'sticky', top: 72 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 4 }}>{company.companyName}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 14 }}>
                {company.experience} বছরের অভিজ্ঞতা
                {avgRating && ` • ★ ${avgRating.toFixed(1)}`}
              </div>

              {isUnlocked ? (
                <>
                  <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 14, textAlign: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 3 }}>যোগাযোগ নম্বর</div>
                    <a href={`tel:${ownerPhone}`} style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--green-deep)', textDecoration: 'none' }}>
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
                  }}>
                    💬 WhatsApp করুন
                  </a>
                </>
              ) : (
                <>
                  <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: 10, marginBottom: 10, fontSize: '0.85rem', color: '#92400E' }}>
                    🔒 নম্বর দেখতে মাত্র ৳২০ দিন
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
