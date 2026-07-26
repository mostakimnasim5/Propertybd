'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE: { label: '▶ চলছে', color: '#166A47', bg: '#D1FAE5' },
  PAUSED: { label: '⏸ বিরতি', color: '#D97706', bg: '#FEF3C7' },
  BUDGET_DONE: { label: '💰 বাজেট শেষ', color: '#DC2626', bg: '#FEE2E2' },
  EXPIRED: { label: '⏹ শেষ হয়েছে', color: '#6B7280', bg: '#F3F4F6' },
}

const TYPE_LABELS: Record<string, string> = {
  FLAT: 'ফ্ল্যাট', HOUSE: 'বাড়ি', LAND: 'জমি',
  SHOP: 'দোকান', OFFICE: 'অফিস', WAREHOUSE: 'গোডাউন',
}

export default function BoostPage() {
  const { user } = useAuth()
  const [boosts, setBoosts] = useState<any[]>([])
  const [myListings, setMyListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [divisions, setDivisions] = useState<any[]>([])
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [form, setForm] = useState({
    listingId: '',
    bidPerDay: '100',
    totalBudget: '500',
    targetDistrictId: '',
    targetType: '',
    targetPurpose: '',
    endDate: '',
  })

  useEffect(() => {
    Promise.all([
      axios.get('/api/featured/manage'),
      axios.get('/api/users/listings?category=property'),
      axios.get('/api/locations'),
    ]).then(([boostRes, listingsRes, locRes]) => {
      setBoosts(boostRes.data.data.boosts || [])
      setMyListings(listingsRes.data.data.listings?.filter((l: any) => l.status === 'ACTIVE') || [])
      setDivisions(locRes.data.data.divisions || [])
    }).catch(() => toast.error('লোড হয়নি'))
      .finally(() => setLoading(false))
  }, [])

  const districts = divisions.flatMap((d: any) => d.districts || [])

  const estimatedDays = () => {
    const bid = parseFloat(form.bidPerDay) || 0
    const budget = parseFloat(form.totalBudget) || 0
    if (bid <= 0) return 0
    return Math.floor(budget / bid)
  }

  const handleCreate = async () => {
    if (!form.listingId) { toast.error('Listing বেছে নিন'); return }
    if (parseFloat(form.bidPerDay) < 50) { toast.error('সর্বনিম্ন daily bid ৳৫০'); return }
    if (parseFloat(form.totalBudget) < 200) { toast.error('সর্বনিম্ন budget ৳২০০'); return }

    try {
      await axios.post('/api/featured/create', {
        ...form,
        bidPerDay: parseFloat(form.bidPerDay),
        totalBudget: parseFloat(form.totalBudget),
        targetDistrictId: form.targetDistrictId || null,
        targetType: form.targetType || null,
        targetPurpose: form.targetPurpose || null,
        endDate: form.endDate || null,
      })
      toast.success('✅ Boost সফলভাবে চালু হয়েছে!')
      setShowForm(false)
      const res = await axios.get('/api/featured/manage')
      setBoosts(res.data.data.boosts || [])
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'সমস্যা হয়েছে')
    }
  }

  const handleAction = async (featuredId: string, action: string) => {
    setActionLoading(featuredId + action)
    try {
      await axios.patch('/api/featured/manage', { featuredId, action })
      toast.success(
        action === 'pause' ? '⏸ Boost বিরতি দেওয়া হয়েছে' :
        action === 'resume' ? '▶ Boost আবার চালু হয়েছে' :
        '⏹ Boost বন্ধ করা হয়েছে'
      )
      const res = await axios.get('/api/featured/manage')
      setBoosts(res.data.data.boosts || [])
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'সমস্যা হয়েছে')
    } finally {
      setActionLoading(null)
    }
  }

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div style={{ padding: '28px 0', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: 900 }}>

        {/* Header */}
        <div className="flex-between" style={{ marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: 4 }}>
              ⚡ Listing Boost
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              আপনার listing সার্চে উপরে দেখান, বেশি buyer পান
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/dashboard" style={{ textDecoration: 'none' }} className="btn-outline">
              ← Dashboard
            </Link>
            <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
              {showForm ? '✕ বন্ধ করুন' : '+ নতুন Boost'}
            </button>
          </div>
        </div>

        {/* How it works */}
        <div style={{ background: 'var(--green-light)', borderRadius: 12, padding: 16, marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { icon: '🎯', title: 'Location targeting', desc: 'নির্দিষ্ট জেলায় দেখান' },
            { icon: '🔄', title: 'Rotation system', desc: 'সবাই সমান সুযোগ পায়' },
            { icon: '📊', title: 'CTR-based rank', desc: 'ভালো listing = বেশি সুযোগ' },
            { icon: '💰', title: 'Budget control', desc: 'শেষ হলে auto-stop' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--green-deep)' }}>{item.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Create Form */}
        {showForm && (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 24, marginBottom: 28 }}>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 20, color: 'var(--green-deep)' }}>
              নতুন Boost তৈরি করুন
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              {/* Select listing */}
              <div>
                <label>কোন listing boost করবেন? *</label>
                {myListings.length === 0 ? (
                  <div style={{ padding: 12, background: 'var(--surface-2)', borderRadius: 8, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    কোনো active listing নেই।{' '}
                    <Link href="/post-listing" style={{ color: 'var(--green-deep)', fontWeight: 700 }}>বিজ্ঞাপন দিন →</Link>
                  </div>
                ) : (
                  <select value={form.listingId} onChange={e => set('listingId', e.target.value)}>
                    <option value="">Listing বেছে নিন</option>
                    {myListings.map((l: any) => (
                      <option key={l.id} value={l.id}>
                        {l.title} — ৳{Number(l.price).toLocaleString()} ({l.district?.nameBn || ''})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Budget */}
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label>দৈনিক bid (৳) * — সর্বনিম্ন ৳৫০</label>
                  <input type="number" min="50" placeholder="100"
                    value={form.bidPerDay} onChange={e => set('bidPerDay', e.target.value)} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    বেশি bid = বেশি impression
                  </div>
                </div>
                <div>
                  <label>মোট budget (৳) * — সর্বনিম্ন ৳২০০</label>
                  <input type="number" min="200" placeholder="500"
                    value={form.totalBudget} onChange={e => set('totalBudget', e.target.value)} />
                  {estimatedDays() > 0 && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--green-deep)', marginTop: 4, fontWeight: 600 }}>
                      ≈ {estimatedDays()} দিন চলবে
                    </div>
                  )}
                </div>
              </div>

              {/* Targeting */}
              <div style={{ background: 'var(--surface)', borderRadius: 10, padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 12, color: 'var(--text-secondary)' }}>
                  🎯 Targeting (ঐচ্ছিক — নির্দিষ্ট না করলে সারাদেশে দেখাবে)
                </div>
                <div className="grid-3" style={{ gap: 10 }}>
                  <div>
                    <label>জেলা</label>
                    <select value={form.targetDistrictId} onChange={e => set('targetDistrictId', e.target.value)}>
                      <option value="">সব জেলা</option>
                      {districts.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.nameBn}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>ধরন</label>
                    <select value={form.targetType} onChange={e => set('targetType', e.target.value)}>
                      <option value="">সব ধরন</option>
                      {Object.entries(TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>উদ্দেশ্য</label>
                    <select value={form.targetPurpose} onChange={e => set('targetPurpose', e.target.value)}>
                      <option value="">বিক্রি ও ভাড়া</option>
                      <option value="SALE">শুধু বিক্রয়</option>
                      <option value="RENT">শুধু ভাড়া</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <label>শেষ তারিখ (ঐচ্ছিক)</label>
                  <input type="date" value={form.endDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => set('endDate', e.target.value)} />
                </div>
              </div>

              {/* Summary */}
              {form.listingId && parseFloat(form.bidPerDay) >= 50 && parseFloat(form.totalBudget) >= 200 && (
                <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: 14, border: '1px solid rgba(245,166,35,0.3)' }}>
                  <div style={{ fontWeight: 700, marginBottom: 8, color: '#92400E' }}>📋 সারসংক্ষেপ</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.85rem' }}>
                    {[
                      ['দৈনিক bid', `৳${form.bidPerDay}`],
                      ['মোট budget', `৳${form.totalBudget}`],
                      ['আনুমানিক মেয়াদ', `${estimatedDays()} দিন`],
                      ['Targeting', form.targetDistrictId ? 'নির্দিষ্ট জেলা' : 'সারাদেশ'],
                    ].map(([label, value]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#92400E' }}>{label}:</span>
                        <span style={{ fontWeight: 700, color: '#92400E' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className="btn-primary" onClick={handleCreate}
                style={{ justifyContent: 'center', padding: '14px' }}>
                ⚡ Boost চালু করুন
              </button>
            </div>
          </div>
        )}

        {/* Active boosts */}
        <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 16, color: 'var(--green-deep)' }}>
          আমার Boost সমূহ
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>⏳ লোড হচ্ছে...</div>
        ) : boosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>⚡</div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>কোনো Boost নেই</div>
            <div style={{ fontSize: '0.88rem', marginBottom: 20 }}>Boost করলে আপনার listing সার্চে উপরে দেখাবে</div>
            <button className="btn-primary" onClick={() => setShowForm(true)}>+ প্রথম Boost তৈরি করুন</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {boosts.map((boost: any) => {
              const cfg = STATUS_CONFIG[boost.status] || STATUS_CONFIG.EXPIRED
              const isActive = boost.status === 'ACTIVE'
              const isPaused = boost.status === 'PAUSED'

              return (
                <div key={boost.id} style={{ background: 'white', borderRadius: 14, border: `1px solid ${boost.status === 'ACTIVE' ? 'rgba(22,106,71,0.3)' : 'var(--border)'}`, overflow: 'hidden' }}>
                  {/* Top bar */}
                  <div style={{ background: isActive ? 'var(--green-light)' : 'var(--surface)', padding: '10px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: cfg.bg, color: cfg.color, fontSize: '0.78rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(boost.createdAt).toLocaleDateString('bn-BD')} থেকে
                    </span>
                  </div>

                  <div style={{ padding: 18 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                      {/* Listing info */}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>
                          {boost.listing?.title || 'Listing'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
                          📍 {boost.listing?.district?.nameBn}
                          {boost.targetDistrictId && ' • নির্দিষ্ট জেলা targeted'}
                          {boost.targetType && ` • ${TYPE_LABELS[boost.targetType] || boost.targetType}`}
                          {boost.targetPurpose && ` • ${boost.targetPurpose === 'SALE' ? 'বিক্রয়' : 'ভাড়া'}`}
                        </div>

                        {/* Stats grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                          {[
                            { label: 'দেখানো হয়েছে', value: boost.impressions.toLocaleString(), icon: '👁️' },
                            { label: 'Click', value: boost.clicks.toLocaleString(), icon: '🖱️' },
                            { label: 'CTR', value: `${boost.ctrPercent}%`, icon: '📊' },
                            { label: 'বাকি দিন', value: boost.daysLeft > 0 ? `${boost.daysLeft} দিন` : '—', icon: '📅' },
                          ].map(stat => (
                            <div key={stat.label} style={{ background: 'var(--surface)', borderRadius: 8, padding: '8px 10px' }}>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>{stat.icon} {stat.label}</div>
                              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--green-deep)' }}>{stat.value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Budget progress */}
                        <div style={{ marginTop: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                            <span>Budget ব্যবহার</span>
                            <span>৳{Number(boost.budgetSpent).toFixed(0)} / ৳{Number(boost.totalBudget).toFixed(0)}</span>
                          </div>
                          <div style={{ background: 'var(--surface-2)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 99,
                              width: `${boost.budgetPercent}%`,
                              background: boost.budgetPercent > 80 ? '#DC2626' : boost.budgetPercent > 60 ? '#D97706' : 'var(--green-deep)',
                              transition: 'width 0.3s',
                            }} />
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 120 }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                          Daily bid: <strong style={{ color: 'var(--green-deep)' }}>৳{Number(boost.bidPerDay)}</strong>
                        </div>

                        {isActive && (
                          <button onClick={() => handleAction(boost.id, 'pause')}
                            disabled={actionLoading === boost.id + 'pause'}
                            style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {actionLoading === boost.id + 'pause' ? '...' : '⏸ বিরতি'}
                          </button>
                        )}

                        {isPaused && (
                          <button onClick={() => handleAction(boost.id, 'resume')}
                            disabled={actionLoading === boost.id + 'resume'}
                            className="btn-primary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                            {actionLoading === boost.id + 'resume' ? '...' : '▶ চালু করুন'}
                          </button>
                        )}

                        {(isActive || isPaused) && (
                          <button onClick={() => handleAction(boost.id, 'stop')}
                            disabled={actionLoading === boost.id + 'stop'}
                            style={{ padding: '8px 14px', borderRadius: 8, border: '1.5px solid #DC2626', background: '#FEE2E2', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.82rem', color: '#DC2626' }}>
                            {actionLoading === boost.id + 'stop' ? '...' : '⏹ বন্ধ করুন'}
                          </button>
                        )}

                        <Link href={`/properties/${boost.listingId}`} style={{ textDecoration: 'none', textAlign: 'center', fontSize: '0.78rem', color: 'var(--green-deep)', fontWeight: 600 }}>
                          Listing দেখুন →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
