'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

const AMENITY_OPTIONS = [
  'লিফট', 'পার্কিং', 'জেনারেটর', 'সিকিউরিটি ক্যামেরা', 'গার্ড',
  'ছাদ বাগান', 'খেলার মাঠ', 'জিম', 'সুইমিং পুল', 'কমিউনিটি হল',
  'মসজিদ', 'ইন্টারকম', 'গ্যাস লাইন', 'সোলার প্যানেল', 'ফায়ার এক্সিট',
]

export default function PostProjectPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [divisions, setDivisions] = useState<any[]>([])
  const [myCompanies, setMyCompanies] = useState<any[]>([])
  const [selectedDiv, setSelectedDiv] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [floorPlan, setFloorPlan] = useState('')
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [units, setUnits] = useState([{ unitType: '', size: '', price: '', floor: '' }])

  const [form, setForm] = useState({
    title: '', description: '', projectType: 'RESIDENTIAL',
    status: 'ONGOING', address: '', districtId: '', areaName: '',
    totalUnits: '', availableUnits: '', floorCount: '', landArea: '',
    handoverDate: '', startDate: '', pricePerSqft: '',
    minPrice: '', maxPrice: '', constructionId: '',
  })

  const districts = divisions.find((d: any) => d.id.toString() === selectedDiv)?.districts || []

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/post-project')
  }, [user, loading, router])

  useEffect(() => {
    axios.get('/api/locations').then(r => setDivisions(r.data.data.divisions)).catch(() => {})
    axios.get('/api/users/listings?category=construction').then(r =>
      setMyCompanies(r.data.data.companies || [])
    ).catch(() => {})
  }, [])

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const toggleAmenity = (a: string) =>
    setSelectedAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])

  const addUnit = () => setUnits(prev => [...prev, { unitType: '', size: '', price: '', floor: '' }])
  const setUnit = (i: number, k: string, v: string) =>
    setUnits(prev => prev.map((u, idx) => idx === i ? { ...u, [k]: v } : u))
  const removeUnit = (i: number) => setUnits(prev => prev.filter((_, idx) => idx !== i))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFloorPlan = false) => {
    const files = Array.from(e.target.files || [])
    if (!isFloorPlan && images.length + files.length > 10) { toast.error('সর্বোচ্চ ১০টি ছবি'); return }
    setUploadingImg(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await axios.post('/api/upload', fd)
        if (isFloorPlan) setFloorPlan(res.data.data.url)
        else setImages(prev => [...prev, res.data.data.url])
      } catch { toast.error(`${file.name} আপলোড ব্যর্থ`) }
    }
    setUploadingImg(false)
  }

  const handleSubmit = async () => {
    if (!form.title || !form.constructionId || !form.districtId || !form.totalUnits || !form.minPrice || !form.maxPrice) {
      toast.error('সব প্রয়োজনীয় তথ্য দিন')
      return
    }
    setSubmitting(true)
    try {
      await axios.post('/api/projects/create', {
        ...form,
        images,
        floorPlan: floorPlan || null,
        amenities: selectedAmenities,
        units: units.filter(u => u.unitType && u.size && u.price),
      })
      toast.success('✅ Project জমা হয়েছে! অনুমোদনের পর প্রকাশিত হবে।')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'সমস্যা হয়েছে')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center' }}>⏳</div>

  return (
    <div style={{ padding: '28px 0', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: 780 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6, color: 'var(--green-deep)' }}>🏗️ নতুন Project যোগ করুন</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>অনুমোদনের পর সর্বসাধারণের কাছে প্রকাশিত হবে।</p>

        {/* Company selector */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: 'var(--green-deep)' }}>🏢 Developer/Builder নির্বাচন করুন</div>
          {myCompanies.length === 0 ? (
            <div style={{ background: 'var(--amber-light)', borderRadius: 10, padding: 14, fontSize: '0.88rem', color: '#92400E' }}>
              প্রথমে একটি Construction company profile তৈরি করুন।{' '}
              <a href="/post-listing" style={{ fontWeight: 700, color: '#92400E' }}>তৈরি করুন →</a>
            </div>
          ) : (
            <select value={form.constructionId} onChange={e => set('constructionId', e.target.value)}>
              <option value="">Company বেছে নিন *</option>
              {myCompanies.map((c: any) => (
                <option key={c.id} value={c.id}>{c.companyName}</option>
              ))}
            </select>
          )}
        </div>

        {/* Basic info */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--green-deep)' }}>📋 Project তথ্য</div>
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <label>Project-এর নাম *</label>
              <input placeholder="যেমন: Greenview Residency" value={form.title} onChange={e => set('title', e.target.value)} />
            </div>
            <div className="grid-2" style={{ gap: 12 }}>
              <div>
                <label>ধরন *</label>
                <select value={form.projectType} onChange={e => set('projectType', e.target.value)}>
                  <option value="RESIDENTIAL">আবাসিক</option>
                  <option value="COMMERCIAL">বাণিজ্যিক</option>
                  <option value="MIXED">মিশ্র</option>
                </select>
              </div>
              <div>
                <label>অবস্থা *</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="UPCOMING">শীঘ্রই আসছে</option>
                  <option value="ONGOING">নির্মাণাধীন</option>
                  <option value="READY">রেডি টু মুভ</option>
                  <option value="COMPLETED">সম্পন্ন</option>
                </select>
              </div>
            </div>
            <div>
              <label>বিস্তারিত বিবরণ *</label>
              <textarea rows={4} placeholder="Project সম্পর্কে বিস্তারিত লিখুন..." value={form.description}
                onChange={e => set('description', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--green-deep)' }}>📍 অবস্থান</div>
          <div className="grid-2" style={{ gap: 12, marginBottom: 12 }}>
            <div>
              <label>বিভাগ *</label>
              <select value={selectedDiv} onChange={e => { setSelectedDiv(e.target.value); set('districtId', '') }}>
                <option value="">বিভাগ বেছে নিন</option>
                {divisions.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
              </select>
            </div>
            <div>
              <label>জেলা *</label>
              <select value={form.districtId} onChange={e => set('districtId', e.target.value)} disabled={!selectedDiv}>
                <option value="">জেলা বেছে নিন</option>
                {districts.map((d: any) => <option key={d.id} value={d.id}>{d.nameBn}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div>
              <label>এলাকার নাম</label>
              <input placeholder="যেমন: বসুন্ধরা R/A" value={form.areaName} onChange={e => set('areaName', e.target.value)} />
            </div>
            <div>
              <label>পূর্ণ ঠিকানা</label>
              <input placeholder="রাস্তা, ব্লক, সেক্টর" value={form.address} onChange={e => set('address', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Project specs */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--green-deep)' }}>🏗️ Project বিবরণ</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'মোট unit *', key: 'totalUnits', placeholder: '48' },
              { label: 'পাওয়া যাচ্ছে *', key: 'availableUnits', placeholder: '30' },
              { label: 'তলা সংখ্যা', key: 'floorCount', placeholder: '10' },
              { label: 'জমির পরিমাণ', key: 'landArea', placeholder: '10 কাঠা' },
              { label: 'শুরুর তারিখ', key: 'startDate', placeholder: '', type: 'date' },
              { label: 'Handover তারিখ', key: 'handoverDate', placeholder: '', type: 'date' },
            ].map(f => (
              <div key={f.key}>
                <label>{f.label}</label>
                <input type={f.type || 'text'} placeholder={f.placeholder}
                  value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--green-deep)' }}>💰 মূল্য</div>
          <div className="grid-3" style={{ gap: 12 }}>
            <div>
              <label>সর্বনিম্ন মূল্য (৳) *</label>
              <input type="number" placeholder="50,00,000" value={form.minPrice} onChange={e => set('minPrice', e.target.value)} />
            </div>
            <div>
              <label>সর্বোচ্চ মূল্য (৳) *</label>
              <input type="number" placeholder="80,00,000" value={form.maxPrice} onChange={e => set('maxPrice', e.target.value)} />
            </div>
            <div>
              <label>প্রতি বর্গফুট (৳)</label>
              <input type="number" placeholder="4,500" value={form.pricePerSqft} onChange={e => set('pricePerSqft', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Units */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: 'var(--green-deep)' }}>🏠 Unit তালিকা</div>
            <button onClick={addUnit} className="btn-outline" style={{ padding: '5px 14px', fontSize: '0.82rem' }}>+ Unit যোগ করুন</button>
          </div>
          {units.map((unit, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr 1fr auto', gap: 8, marginBottom: 10, alignItems: 'flex-end' }}>
              <div>
                {i === 0 && <label style={{ fontSize: '0.75rem' }}>Unit ধরন</label>}
                <input placeholder="2 Bed" value={unit.unitType} onChange={e => setUnit(i, 'unitType', e.target.value)} />
              </div>
              <div>
                {i === 0 && <label style={{ fontSize: '0.75rem' }}>তলা</label>}
                <input type="number" placeholder="3" value={unit.floor} onChange={e => setUnit(i, 'floor', e.target.value)} />
              </div>
              <div>
                {i === 0 && <label style={{ fontSize: '0.75rem' }}>আয়তন (বর্গফুট)</label>}
                <input type="number" placeholder="1200" value={unit.size} onChange={e => setUnit(i, 'size', e.target.value)} />
              </div>
              <div>
                {i === 0 && <label style={{ fontSize: '0.75rem' }}>মূল্য (৳)</label>}
                <input type="number" placeholder="6000000" value={unit.price} onChange={e => setUnit(i, 'price', e.target.value)} />
              </div>
              {units.length > 1 && (
                <button onClick={() => removeUnit(i)} style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
              )}
            </div>
          ))}
        </div>

        {/* Amenities */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: 'var(--green-deep)' }}>✨ সুযোগ সুবিধা</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {AMENITY_OPTIONS.map(a => (
              <button key={a} onClick={() => toggleAmenity(a)} style={{
                padding: '6px 14px', borderRadius: 99, cursor: 'pointer',
                border: `1.5px solid ${selectedAmenities.includes(a) ? 'var(--green-deep)' : 'var(--border)'}`,
                background: selectedAmenities.includes(a) ? 'var(--green-deep)' : 'white',
                color: selectedAmenities.includes(a) ? 'white' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: '0.82rem', fontFamily: 'inherit',
              }}>{selectedAmenities.includes(a) ? '✓ ' : ''}{a}</button>
            ))}
          </div>
        </div>

        {/* Images */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 14, color: 'var(--green-deep)' }}>📸 Project ছবি</div>
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px dashed var(--border)', borderRadius: 10, padding: 20, cursor: 'pointer', marginBottom: 12, fontWeight: 400 }}>
            <span style={{ fontSize: '2rem', marginBottom: 6 }}>{uploadingImg ? '⏳' : '📁'}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{uploadingImg ? 'আপলোড হচ্ছে...' : 'Project-এর ছবি বেছে নিন (সর্বোচ্চ ১০টি)'}</span>
            <input type="file" accept="image/*" multiple onChange={e => handleImageUpload(e)} style={{ display: 'none' }} disabled={uploadingImg} />
          </label>
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {images.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt="" style={{ width: 80, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                  <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--red)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 8 }}>Floor Plan (ঐচ্ছিক)</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px dashed var(--border)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', fontWeight: 400 }}>
            <span>{floorPlan ? '✅' : '📐'}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{floorPlan ? 'Floor plan আপলোড হয়েছে' : 'Floor plan আপলোড করুন'}</span>
            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, true)} style={{ display: 'none' }} disabled={uploadingImg} />
          </label>
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={submitting || !form.constructionId}
          style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1rem' }}>
          {submitting ? '⏳ জমা হচ্ছে...' : '✅ Project জমা দিন'}
        </button>
      </div>
    </div>
  )
}
