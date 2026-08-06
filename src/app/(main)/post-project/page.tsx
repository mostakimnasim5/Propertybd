'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

type Step = 1 | 2 | 3 | 4

const AMENITY_PRESETS = [
  'Lift / Elevator', 'Generator Backup', 'Rooftop Garden', 'Gym / Fitness Center',
  'Swimming Pool', 'Community Hall', 'Underground Parking', 'CCTV Security',
  '24/7 Security Guard', 'Kids Play Area', 'Mosque', 'Intercom',
  'Gas Connection', 'Water Reservoir', 'Fire Safety System',
]

export default function PostProjectPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [divisions, setDivisions] = useState<any[]>([])
  const [myCompanies, setMyCompanies] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [units, setUnits] = useState([
    { unitType: '2 Bed', floor: '', size: '', price: '' },
  ])
  const [form, setForm] = useState({
    constructionId: '', title: '', description: '',
    projectType: 'RESIDENTIAL', status: 'ONGOING',
    address: '', divisionId: '', districtId: '', areaName: '',
    totalUnits: '', floorCount: '', landArea: '',
    handoverDate: '', startDate: '',
    pricePerSqft: '', minPrice: '', maxPrice: '',
    coverImage: '', floorPlan: '',
  })

  const districts = divisions.find((d: any) => d.id.toString() === form.divisionId)?.districts || []
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/post-project')
  }, [user, loading, router])

  useEffect(() => {
    axios.get('/api/locations').then(r => setDivisions(r.data.data.divisions)).catch(() => {})
    axios.get('/api/users/listings?category=construction').then(r => {
      setMyCompanies(r.data.data.companies || [])
    }).catch(() => {})
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field?: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!field && images.length >= 10) { toast.error('সর্বোচ্চ ১০টি ছবি'); return }
    setUploadingImg(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await axios.post('/api/upload', fd)
      field ? set(field, res.data.data.url) : setImages(p => [...p, res.data.data.url])
      toast.success('✅ আপলোড সফল')
    } catch { toast.error('আপলোড ব্যর্থ') }
    finally { setUploadingImg(false) }
  }

  const toggleAmenity = (a: string) =>
    setSelectedAmenities(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a])

  const addUnit = () => setUnits(p => [...p, { unitType: '', floor: '', size: '', price: '' }])
  const removeUnit = (i: number) => setUnits(p => p.filter((_, j) => j !== i))
  const setUnit = (i: number, k: string, v: string) =>
    setUnits(p => p.map((u, j) => j === i ? { ...u, [k]: v } : u))

  const validate = (): boolean => {
    if (step === 1) {
      if (!form.constructionId) { toast.error('কোম্পানি বেছে নিন'); return false }
      if (!form.title.trim()) { toast.error('Project-এর নাম দিন'); return false }
      if (!form.description.trim()) { toast.error('বিবরণ দিন'); return false }
    }
    if (step === 2) {
      if (!form.districtId) { toast.error('জেলা বেছে নিন'); return false }
      if (!form.address.trim()) { toast.error('ঠিকানা দিন'); return false }
      if (!form.totalUnits) { toast.error('মোট unit সংখ্যা দিন'); return false }
    }
    if (step === 3) {
      if (!form.minPrice || !form.maxPrice) { toast.error('মূল্য সীমা দিন'); return false }
      if (parseFloat(form.maxPrice) < parseFloat(form.minPrice)) {
        toast.error('সর্বোচ্চ মূল্য সর্বনিম্নের চেয়ে বেশি হতে হবে'); return false
      }
      if (units.some(u => !u.unitType || !u.size || !u.price)) {
        toast.error('সব unit-এর তথ্য পূরণ করুন'); return false
      }
    }
    return true
  }

  const next = () => { if (validate()) setStep(p => (p + 1) as Step) }
  const back = () => setStep(p => (p - 1) as Step)

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      await axios.post('/api/projects/create', {
        ...form, images, amenities: selectedAmenities,
        units: units.filter(u => u.unitType && u.size && u.price),
        availableUnits: form.totalUnits,
      })
      toast.success('✅ Project জমা হয়েছে! অনুমোদনের পর প্রকাশিত হবে।')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'সমস্যা হয়েছে')
    } finally { setSubmitting(false) }
  }

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center' }}>⏳</div>

  const STEPS = ['Project তথ্য', 'অবস্থান', 'মূল্য ও Unit', 'ছবি ও সুবিধা']

  return (
    <div style={{ padding: '32px 0', minHeight: '70vh', background: 'var(--surface)' }}>
      <div className="container" style={{ maxWidth: 740 }}>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: 4 }}>🏗️ নতুন Project দিন</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>অনুমোদনের পর প্রকাশিত হবে।</p>

        {/* Step bar */}
        <div style={{ display: 'flex', background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', marginBottom: 24 }}>
          {STEPS.map((title, i) => {
            const s = (i + 1) as Step
            const active = step === s, done = step > s
            return (
              <div key={s} onClick={() => done && setStep(s)} style={{
                flex: 1, padding: '12px 8px', textAlign: 'center',
                background: active ? 'var(--green-deep)' : done ? 'var(--green-light)' : 'white',
                borderRight: i < 3 ? '1px solid var(--border)' : 'none',
                cursor: done ? 'pointer' : 'default',
              }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 700, color: active ? 'rgba(255,255,255,0.7)' : done ? 'var(--green-deep)' : 'var(--text-muted)', marginBottom: 2 }}>
                  {done ? '✓' : `Step ${s}`}
                </div>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: active ? 'white' : done ? 'var(--green-deep)' : 'var(--text-secondary)' }}>
                  {title}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
            <div style={{ fontWeight: 800, color: 'var(--green-deep)', marginBottom: 18 }}>📋 Project তথ্য</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label>Developer কোম্পানি *</label>
                {myCompanies.length === 0 ? (
                  <div style={{ padding: 12, background: 'var(--amber-light)', borderRadius: 8, fontSize: '0.85rem', color: '#92400E' }}>
                    ⚠️ আপনার কোনো Construction company নেই।{' '}
                    <a href="/post-listing" style={{ color: 'var(--green-deep)', fontWeight: 700 }}>আগে company যোগ করুন →</a>
                  </div>
                ) : (
                  <select value={form.constructionId} onChange={e => set('constructionId', e.target.value)}>
                    <option value="">কোম্পানি বেছে নিন</option>
                    {myCompanies.map((c: any) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label>Project-এর নাম *</label>
                <input placeholder="যেমন: Gulshan Heights Residency" value={form.title} onChange={e => set('title', e.target.value)} />
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label>Project ধরন *</label>
                  <select value={form.projectType} onChange={e => set('projectType', e.target.value)}>
                    <option value="RESIDENTIAL">🏠 আবাসিক</option>
                    <option value="COMMERCIAL">🏢 বাণিজ্যিক</option>
                    <option value="MIXED">🏙️ মিশ্র</option>
                  </select>
                </div>
                <div>
                  <label>বর্তমান অবস্থা *</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="UPCOMING">🔜 শীঘ্রই</option>
                    <option value="ONGOING">🏗️ নির্মাণাধীন</option>
                    <option value="READY">✅ রেডি টু মুভ</option>
                    <option value="COMPLETED">🏁 সম্পন্ন</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Project-এর বিবরণ *</label>
                <textarea rows={4} placeholder="Project সম্পর্কে বিস্তারিত লিখুন..."
                  value={form.description} onChange={e => set('description', e.target.value)}
                  style={{ resize: 'vertical' }} />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
            <div style={{ fontWeight: 800, color: 'var(--green-deep)', marginBottom: 18 }}>📍 অবস্থান ও বিবরণ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label>বিভাগ *</label>
                  <select value={form.divisionId} onChange={e => { set('divisionId', e.target.value); set('districtId', '') }}>
                    <option value="">বিভাগ বেছে নিন</option>
                    {divisions.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
                  </select>
                </div>
                <div>
                  <label>জেলা *</label>
                  <select value={form.districtId} onChange={e => set('districtId', e.target.value)} disabled={!form.divisionId}>
                    <option value="">জেলা বেছে নিন</option>
                    {districts.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label>এলাকার নাম</label>
                  <input placeholder="যেমন: গুলশান ২" value={form.areaName} onChange={e => set('areaName', e.target.value)} />
                </div>
                <div>
                  <label>পূর্ণ ঠিকানা *</label>
                  <input placeholder="রাস্তা, বাড়ি নং" value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label>মোট Unit সংখ্যা *</label>
                  <input type="number" placeholder="50" value={form.totalUnits} onChange={e => set('totalUnits', e.target.value)} />
                </div>
                <div>
                  <label>মোট তলা সংখ্যা</label>
                  <input type="number" placeholder="10" value={form.floorCount} onChange={e => set('floorCount', e.target.value)} />
                </div>
              </div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div>
                  <label>জমির পরিমাণ</label>
                  <input placeholder="যেমন: ১০ কাঠা" value={form.landArea} onChange={e => set('landArea', e.target.value)} />
                </div>
                <div>
                  <label>হস্তান্তরের সম্ভাব্য তারিখ</label>
                  <input type="date" value={form.handoverDate} min={new Date().toISOString().split('T')[0]} onChange={e => set('handoverDate', e.target.value)} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
              <div style={{ fontWeight: 800, color: 'var(--green-deep)', marginBottom: 16 }}>💰 মূল্য</div>
              <div className="grid-3" style={{ gap: 12 }}>
                <div>
                  <label>সর্বনিম্ন মূল্য (৳) *</label>
                  <input type="number" placeholder="5000000" value={form.minPrice} onChange={e => set('minPrice', e.target.value)} />
                </div>
                <div>
                  <label>সর্বোচ্চ মূল্য (৳) *</label>
                  <input type="number" placeholder="10000000" value={form.maxPrice} onChange={e => set('maxPrice', e.target.value)} />
                </div>
                <div>
                  <label>প্রতি বর্গফুট (৳)</label>
                  <input type="number" placeholder="5500" value={form.pricePerSqft} onChange={e => set('pricePerSqft', e.target.value)} />
                </div>
              </div>
            </div>
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontWeight: 800, color: 'var(--green-deep)' }}>🏠 Unit বিবরণ</div>
                <button onClick={addUnit} style={{ background: 'var(--green-light)', color: 'var(--green-deep)', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.82rem' }}>
                  + Unit যোগ
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 32px', gap: 6, marginBottom: 8 }}>
                {['Unit Type', 'তলা', 'আয়তন (sqft)', 'মূল্য (৳)', ''].map(h => (
                  <div key={h} style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{h}</div>
                ))}
              </div>
              {units.map((u, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 32px', gap: 6, marginBottom: 8 }}>
                  <input placeholder="2 Bed / Studio" value={u.unitType} onChange={e => setUnit(i, 'unitType', e.target.value)} />
                  <input type="number" placeholder="5" value={u.floor} onChange={e => setUnit(i, 'floor', e.target.value)} />
                  <input type="number" placeholder="1200" value={u.size} onChange={e => setUnit(i, 'size', e.target.value)} />
                  <input type="number" placeholder="6500000" value={u.price} onChange={e => setUnit(i, 'price', e.target.value)} />
                  <button onClick={() => removeUnit(i)} disabled={units.length === 1} style={{
                    background: units.length === 1 ? 'var(--surface-2)' : '#FEE2E2',
                    color: units.length === 1 ? 'var(--text-muted)' : '#DC2626',
                    border: 'none', borderRadius: 6, cursor: units.length === 1 ? 'not-allowed' : 'pointer', fontWeight: 700,
                  }}>✕</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4 ── */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Cover image */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
              <div style={{ fontWeight: 800, color: 'var(--green-deep)', marginBottom: 14 }}>🖼️ Cover Image</div>
              {form.coverImage ? (
                <div style={{ position: 'relative' }}>
                  <img src={form.coverImage} alt="cover" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10 }} />
                  <button onClick={() => set('coverImage', '')} style={{ position: 'absolute', top: 8, right: 8, background: '#DC2626', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontWeight: 800 }}>✕</button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, border: '2px dashed var(--border)', borderRadius: 10, cursor: 'pointer', fontWeight: 400 }}>
                  <span style={{ fontSize: '2rem', marginBottom: 6 }}>{uploadingImg ? '⏳' : '📸'}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Cover image আপলোড করুন</span>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'coverImage')} style={{ display: 'none' }} disabled={uploadingImg} />
                </label>
              )}
            </div>

            {/* Gallery */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
              <div style={{ fontWeight: 800, color: 'var(--green-deep)', marginBottom: 14 }}>📷 Gallery (সর্বোচ্চ ১০টি)</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', border: '1.5px dashed var(--border)', borderRadius: 10, cursor: 'pointer', marginBottom: 12, fontWeight: 400 }}>
                <span style={{ fontSize: '1.5rem' }}>{uploadingImg ? '⏳' : '➕'}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{uploadingImg ? 'আপলোড হচ্ছে...' : 'ছবি যোগ করুন'}</span>
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e)} style={{ display: 'none' }} disabled={uploadingImg} />
              </label>
              {images.length > 0 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {images.map((url, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <img src={url} alt="" style={{ width: 80, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                      <button onClick={() => setImages(p => p.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#DC2626', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Floor plan */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
              <div style={{ fontWeight: 800, color: 'var(--green-deep)', marginBottom: 14 }}>📐 Floor Plan (ঐচ্ছিক)</div>
              {form.floorPlan ? (
                <div style={{ position: 'relative' }}>
                  <img src={form.floorPlan} alt="floor plan" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 10, border: '1px solid var(--border)' }} />
                  <button onClick={() => set('floorPlan', '')} style={{ position: 'absolute', top: 8, right: 8, background: '#DC2626', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontWeight: 800 }}>✕</button>
                </div>
              ) : (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20, border: '2px dashed var(--border)', borderRadius: 10, cursor: 'pointer', fontWeight: 400 }}>
                  <span style={{ fontSize: '1.8rem', marginBottom: 4 }}>📐</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Floor plan আপলোড করুন</span>
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'floorPlan')} style={{ display: 'none' }} disabled={uploadingImg} />
                </label>
              )}
            </div>

            {/* Amenities */}
            <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 24 }}>
              <div style={{ fontWeight: 800, color: 'var(--green-deep)', marginBottom: 14 }}>✨ সুযোগ-সুবিধা</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {AMENITY_PRESETS.map(a => (
                  <button key={a} onClick={() => toggleAmenity(a)} style={{
                    padding: '6px 14px', borderRadius: 99, cursor: 'pointer', fontFamily: 'inherit',
                    border: `1.5px solid ${selectedAmenities.includes(a) ? 'var(--green-deep)' : 'var(--border)'}`,
                    background: selectedAmenities.includes(a) ? 'var(--green-light)' : 'white',
                    color: selectedAmenities.includes(a) ? 'var(--green-deep)' : 'var(--text-secondary)',
                    fontWeight: selectedAmenities.includes(a) ? 700 : 400, fontSize: '0.82rem',
                  }}>
                    {selectedAmenities.includes(a) ? '✓ ' : ''}{a}
                  </button>
                ))}
              </div>
              {selectedAmenities.length > 0 && (
                <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--green-deep)', fontWeight: 600 }}>
                  {selectedAmenities.length}টি সুবিধা বেছে নেওয়া হয়েছে
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          {step > 1 ? (
            <button onClick={back} className="btn-outline">← আগে</button>
          ) : <div />}
          {step < 4 ? (
            <button onClick={next} className="btn-primary">পরের ধাপ →</button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary" style={{ padding: '12px 28px' }}>
              {submitting ? '⏳ জমা হচ্ছে...' : '✅ Project জমা দিন'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
