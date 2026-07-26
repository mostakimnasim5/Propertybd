'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:      { label: '✅ চলছে',       color: '#166A47', bg: '#D1FAE5' },
  PAUSED:      { label: '⏸️ বিরতি',      color: '#D97706', bg: '#FEF3C7' },
  BUDGET_DONE: { label: '💰 বাজেট শেষ', color: '#DC2626', bg: '#FEE2E2' },
  EXPIRED:     { label: '🕐 মেয়াদ শেষ', color: '#6B7280', bg: '#F3F4F6' },
}

export default function BoostPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [boosts, setBoosts] = useState<any[]>([])
  const [myListings, setMyListings] = useState<any[]>([])
  const [loadingBoosts, setLoadingBoosts] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [divisions, setDivisions] = useState<any[]>([])

  // Create form state
  const [form, setForm] = useState({
    listingId: '',
    bidPerDay: '100',
    totalBudget: '500',
    targetDistrictId: '',
    targetType: '',
    targetPurpose: '',
    durationDays: '',
  })

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/boost')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    fetchBoosts()
    axios.get('/api/users/listings?category=property')
      .then(r => setMyListings(r.data.data.listings?.filter((l: any) => l.status === 'ACTIVE') || []))
      .catch(() => {})
    axios.get('/api/locations')
      .then(r => setDivisions(r.data.data.divisions || []))
      .catch(() => {})
  }, [user])

  const fetchBoosts = async () => {
    setLoadingBoosts(true)
    try {
      const res = await axios.get('/api/featured/manage')
      setBoosts(res.data.data.boosts || [])
    } catch { setBoosts([]) }
    finally { setLoadingBoosts(false) }
  }

  const handleCreate = async () => {
    if (!form.listingId) { toast.error('কোন listing বেছে নিন'); return }
    if (parseInt(form.bidPerDay) < 50) { toast.error('দৈনিক বিড সর্বনিম্ন ৳৫০'); return }
    if (parseInt(form.totalBudget) < 200) { toast.error('মোট বাজেট সর্বনিম্ন ৳২০০'); return }

    setActionLoading('create')
    try {
      await axios.post('/api/featured/create', {
        ...form,
        bidPerDay: parseFloat(form.bidPerDay),
        totalBudget: parseFloat(form.totalBudget),
        durationDays: form.durationDays ? parseInt(form.durationDays) : null,
      })
      toast.success('🚀 Boost চালু হয়েছে!')
      setShowCreateForm(false)
      setForm({ listingId: '', bidPerDay: '100', totalBudget: '500', targetDistrictId: '', targetType: '', targetPurpose: '', durationDays: '' })
      fetchBoosts()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Boost তৈরি হয়নি')
    } finally { setActionLoading(null) }
  }

  const handleAction = async (featuredId: string, action: string) => {
    setActionLoading(featuredId + action)
    try {
      const res = await axios.patch('/api/featured/manage', { featuredId, action })
      toast.success(res.data.data.message)
      fetchBoosts()
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'সমস্যা হয়েছে')
    } finally { setActionLoading(null) }
  }

  const estimatedDays = Math.floor(parseInt(form.totalBudget || '0') / parseInt(form.bidPerDay || '1'))

  const allDistricts = divisions.flatMap((d: any) => d.districts || [])

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center' }}>⏳ লোড হচ্ছে...</div>

  return (
    <div style={{ padding: '24px 0', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: 860 }}>

        {/* Header */}
        <div className="flex-between" style={{ marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: 4 }}>
              🚀 Boost — আপনার বিজ্ঞাপন সামনে রাখুন
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              সার্চে উপরে দেখাবে, বেশি মানুষ দেখবে, বেশি inquiry আসবে
            </p>
          </div>
          <button onClick={() => setShowCreateForm(!showCreateForm)} className="btn-primary">
            {showCreateForm ? '✕ বন্ধ করুন' : '+ নতুন Boost'}
          </button>
        </div>

        {/* How it works */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { icon: '🎯', title: 'এলাকা ভিত্তিক', desc: 'আপনার এলাকায় শুধু আপনার সাথে competition' },
            { icon: '🔄', title: 'Rotation System', desc: 'প্রতি search-এ randomly আপনাকে দেখাবে' },
            { icon: '📊', title: 'Quality Bonus', desc: 'ভালো listing বেশি ক্লিক পেলে rank বাড়বে' },
          ].map(item => (
            <div key={item.title} style={{ background: 'white', borderRadius: 10, border: '1px solid var(--border)', padding: 14 }}>
              <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Create form */}
        {showCreateForm && (
          <div style={{ background: 'white', borderRadius: 14, border: '2px solid var(--green-deep)', padding: 24, marginBottom: 24 }}>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--green-deep)', marginBottom: 20 }}>
              নতুন Boost তৈরি করুন
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {/* Select listing */}
              <div>
                <label>কোন listing boost করবেন? *</label>
                <select value={form.listingId} onChange={e => setForm(p => ({ ...p, listingId: e.target.value }))}>
                  <option value="">listing বেছে নিন</option>
                  {myListings.map((l: any) => (
                    <option key={l.id} value={l.id}>
                      {l.title} — ৳{Number(l.price).toLocaleString()}
                    </option>
                  ))}
                </select>
                {myListings.length === 0 && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--red)', marginTop: 4 }}>
                    কোনো active listing নেই। <Link href="/post-listing" style={{ color: 'var(--green-deep)' }}>বিজ্ঞাপন দিন</Link>
                  </p>
                )}
              </div>

              {/* Budget */}
              <div className="form-grid-2">
                <div>
                  <label>দৈনিক বিড (৳) *</label>
                  <input type="number" min="50" value={form.bidPerDay}
                    onChange={e => setForm(p => ({ ...p, bidPerDay: e.target.value }))}
                    placeholder="সর্বনিম্ন ৳৫০" />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    বেশি bid = বেশি visibility
                  </p>
                </div>
                <div>
                  <label>মোট বাজেট (৳) *</label>
                  <input type="number" min="200" value={form.totalBudget}
                    onChange={e => setForm(p => ({ ...p, totalBudget: e.target.value }))}
                    placeholder="সর্বনিম্ন ৳২০০" />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    বাজেট শেষ হলে auto-pause
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label>মেয়াদ (দিন) — ঐচ্ছিক</label>
                <input type="number" min="1" value={form.durationDays}
                  onChange={e => setForm(p => ({ ...p, durationDays: e.target.value }))}
                  placeholder="খালি রাখলে বাজেট শেষ পর্যন্ত চলবে" />
              </div>

              {/* Targeting */}
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 10, color: 'var(--text-secondary)' }}>
                  🎯 Targeting (ঐচ্ছিক — খালি রাখলে সারা বাংলাদেশে দেখাবে)
                </div>
                <div className="form-grid-3">
                  <div>
                    <label>জেলা</label>
                    <select value={form.targetDistrictId} onChange={e => setForm(p => ({ ...p, targetDistrictId: e.target.value }))}>
                      <option value="">সব জেলা</option>
                      {allDistricts.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.nameBn}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>ধরন</label>
                    <select value={form.targetType} onChange={e => setForm(p => ({ ...p, targetType: e.target.value }))}>
                      <option value="">সব ধরন</option>
                      {['FLAT','HOUSE','LAND','SHOP','OFFICE'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>উদ্দেশ্য</label>
                    <select value={form.targetPurpose} onChange={e => setForm(p => ({ ...p, targetPurpose: e.target.value }))}>
                      <option value="">সব</option>
                      <option value="SALE">বিক্রয়</option>
                      <option value="RENT">ভাড়া</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Estimate preview */}
              {form.bidPerDay && form.totalBudget && (
                <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontWeight: 700, color: 'var(--green-deep)', marginBottom: 8 }}>📊 আনুমানিক পারফরম্যান্স</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                    {[
                      { label: 'চলবে প্রায়', value: `${estimatedDays} দিন` },
                      { label: 'আনুমানিক দেখাবে', value: `${(estimatedDays * 50).toLocaleString()}+ বার` },
                      { label: 'প্রতিদিন খরচ', value: `৳${parseInt(form.bidPerDay).toLocaleString()}` },
                    ].map(stat => (
                      <div key={stat.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--green-deep)' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn-primary" onClick={handleCreate}
                disabled={actionLoading === 'create' || !form.listingId}
                style={{ justifyContent: 'center', padding: '14px', fontSize: '1rem' }}>
                {actionLoading === 'create' ? '⏳ তৈরি হচ্ছে...' : `🚀 Boost চালু করুন — ৳${parseInt(form.totalBudget || '0').toLocaleString()}`}
              </button>
            </div>
          </div>
        )}

        {/* Active boosts */}
        <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 16 }}>আমার Boost সমূহ</div>

        {loadingBoosts ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>⏳ লোড হচ্ছে...</div>
        ) : boosts.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📢</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8 }}>এখনো কোনো Boost নেই</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
              Boost করলে আপনার listing সার্চে উপরে দেখাবে এবং বেশি inquiry আসবে
            </p>
            <button onClick={() => setShowCreateForm(true)} className="btn-primary">
              + প্রথম Boost তৈরি করুন
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {boosts.map((boost: any) => {
              const statusCfg = STATUS_CONFIG[boost.status] || STATUS_CONFIG.EXPIRED
              const usedPercent = boost.budgetUsedPercent || 0

              return (
                <div key={boost.id} style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 18 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                    {/* Listing image */}
                    <div style={{ width: 64, height: 48, borderRadius: 8, background: 'var(--surface-2)', flexShrink: 0, overflow: 'hidden' }}>
                      {boost.listing?.images?.[0]?.url
                        ? <img src={boost.listing.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🏠</div>
                      }
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 3 }}>
                        {boost.listing?.title || 'Listing'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        📍 {boost.listing?.district?.nameBn}
                        {boost.targetType && ` • ${boost.targetType}`}
                        {boost.targetPurpose && ` • ${boost.targetPurpose === 'SALE' ? 'বিক্রয়' : 'ভাড়া'}`}
                      </div>
                    </div>

                    <span style={{
                      background: statusCfg.bg, color: statusCfg.color,
                      fontSize: '0.75rem', fontWeight: 700,
                      padding: '4px 10px', borderRadius: 99, whiteSpace: 'nowrap',
                    }}>{statusCfg.label}</span>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
                    {[
                      { label: 'দেখানো হয়েছে', value: boost.impressions.toLocaleString() + ' বার' },
                      { label: 'ক্লিক', value: boost.clicks.toLocaleString() + ' বার' },
                      { label: 'CTR', value: boost.ctr > 0 ? (boost.ctr * 100).toFixed(1) + '%' : '—' },
                      { label: 'বাকি দিন', value: boost.estimatedDaysLeft > 0 ? `~${boost.estimatedDaysLeft} দিন` : '—' },
                    ].map(stat => (
                      <div key={stat.label} style={{ textAlign: 'center', background: 'var(--surface)', borderRadius: 8, padding: '8px 4px' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--green-deep)' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Budget progress */}
                  <div style={{ marginBottom: 14 }}>
                    <div className="flex-between" style={{ marginBottom: 4 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        বাজেট: ৳{Number(boost.budgetSpent).toLocaleString()} / ৳{Number(boost.totalBudget).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: usedPercent > 80 ? 'var(--red)' : 'var(--green-deep)' }}>
                        {usedPercent}% ব্যবহৃত
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        width: `${Math.min(usedPercent, 100)}%`,
                        background: usedPercent > 80 ? 'var(--red)' : 'var(--green-deep)',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                  </div>

                  {/* Daily bid */}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 14 }}>
                    দৈনিক বিড: ৳{Number(boost.bidPerDay).toLocaleString()}
                    {boost.endDate && ` • মেয়াদ: ${new Date(boost.endDate).toLocaleDateString('bn-BD')}`}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {boost.status === 'ACTIVE' && (
                      <button onClick={() => handleAction(boost.id, 'pause')}
                        disabled={!!actionLoading}
                        style={{ padding: '7px 14px', borderRadius: 7, border: '1.5px solid var(--border)', background: 'white', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                        ⏸️ Pause
                      </button>
                    )}
                    {boost.status === 'PAUSED' && (
                      <button onClick={() => handleAction(boost.id, 'resume')}
                        disabled={!!actionLoading}
                        className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
                        ▶️ Resume
                      </button>
                    )}
                    {['ACTIVE', 'PAUSED'].includes(boost.status) && (
                      <button onClick={() => {
                        if (confirm('এই boost বাতিল করবেন?')) handleAction(boost.id, 'cancel')
                      }}
                        disabled={!!actionLoading}
                        style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: '#FEE2E2', color: '#DC2626', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
                        ❌ বাতিল
                      </button>
                    )}
                    {boost.status === 'BUDGET_DONE' && (
                      <button onClick={() => setShowCreateForm(true)} className="btn-primary" style={{ padding: '7px 14px', fontSize: '0.82rem' }}>
                        + আবার Boost করুন
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Back link */}
        <div style={{ marginTop: 24 }}>
          <Link href="/dashboard" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem' }}>
            ← Dashboard-এ ফিরুন
          </Link>
        </div>
      </div>
    </div>
  )
}
