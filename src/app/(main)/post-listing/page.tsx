'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

type Category = 'property' | 'vehicle' | 'construction'

const PROPERTY_TYPES = ['FLAT','HOUSE','LAND','SHOP','OFFICE','WAREHOUSE','BUILDING']
const PROPERTY_TYPE_LABELS: Record<string,string> = { FLAT:'ফ্ল্যাট', HOUSE:'বাড়ি', LAND:'জমি', SHOP:'দোকান', OFFICE:'অফিস', WAREHOUSE:'গোডাউন', BUILDING:'ভবন' }
const VEHICLE_TYPES = ['CAR','BIKE']
const VEHICLE_TYPE_LABELS: Record<string,string> = { CAR:'গাড়ি', BIKE:'বাইক' }
const CONDITIONS = ['NEW','EXCELLENT','GOOD','FAIR']
const CONDITION_LABELS: Record<string,string> = { NEW:'নতুন', EXCELLENT:'চমৎকার', GOOD:'ভালো', FAIR:'মোটামুটি' }

export default function PostListingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [category, setCategory] = useState<Category>('property')
  const [divisions, setDivisions] = useState<any[]>([])
  const [selectedDiv, setSelectedDiv] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [images, setImages] = useState<string[]>([])

  const [form, setForm] = useState<Record<string, any>>({
    title: '', description: '', type: 'FLAT', purpose: 'SALE',
    price: '', negotiable: false, area: '', bedrooms: '', bathrooms: '',
    floor: '', totalFloors: '', furnished: false, parking: false,
    gasLine: false, lift: false, facing: '', address: '',
    districtId: '', areaName: '',
    // Vehicle
    brand: '', model: '', year: new Date().getFullYear(), mileage: '',
    condition: 'GOOD', color: '', fuelType: '', transmission: '',
    // Construction
    companyName: '', services: '', experience: '',
  })

  const districts = divisions.find((d: any) => d.id.toString() === selectedDiv)?.districts || []

  useEffect(() => {
    if (!loading && !user) router.push('/login?redirect=/post-listing')
  }, [user, loading, router])

  useEffect(() => {
    axios.get('/api/locations').then(r => setDivisions(r.data.data.divisions)).catch(() => {})
  }, [])

  const set = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (images.length + files.length > 8) { toast.error('সর্বোচ্চ ৮টি ছবি দেওয়া যাবে'); return }
    setUploadingImg(true)
    for (const file of files) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await axios.post('/api/upload', fd)
        setImages(prev => [...prev, res.data.data.url])
      } catch { toast.error(`${file.name} আপলোড ব্যর্থ`) }
    }
    setUploadingImg(false)
  }

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.districtId) {
      toast.error('সব প্রয়োজনীয় তথ্য দিন')
      return
    }
    setSubmitting(true)
    try {
      let endpoint = '/api/listings/create'
      let payload: any = { ...form, images, districtId: form.districtId }

      if (category === 'vehicle') {
        endpoint = '/api/vehicles/create'
      } else if (category === 'construction') {
        endpoint = '/api/construction/create'
        payload.services = form.services.split(',').map((s: string) => s.trim()).filter(Boolean)
      }

      await axios.post(endpoint, payload)
      toast.success('বিজ্ঞাপন জমা হয়েছে! অনুমোদনের পর প্রকাশিত হবে।')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'সমস্যা হয়েছে')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center' }}>⏳ লোড হচ্ছে...</div>

  const inputStyle = { marginBottom: 0 }

  return (
    <div style={{ padding: '32px 0', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8, color: 'var(--green-deep)' }}>+ নতুন বিজ্ঞাপন দিন</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>বিজ্ঞাপন অনুমোদনের পর সর্বসাধারণের কাছে প্রকাশিত হবে।</p>

        {/* Category select */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20, marginBottom: 20 }}>
          <label>বিজ্ঞাপনের ধরন</label>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {[
              { id: 'property', label: '🏠 প্রপার্টি' },
              { id: 'vehicle', label: '🚗 গাড়ি/বাইক' },
              { id: 'construction', label: '🏗️ নির্মাণ' },
            ].map(c => (
              <button key={c.id} onClick={() => setCategory(c.id as Category)} style={{
                flex: 1, padding: '10px 8px', border: `2px solid ${category === c.id ? 'var(--green-deep)' : 'var(--border)'}`,
                borderRadius: 10, background: category === c.id ? 'var(--green-light)' : 'white',
                color: category === c.id ? 'var(--green-deep)' : 'var(--text-secondary)',
                fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem',
              }}>{c.label}</button>
            ))}
          </div>
        </div>

        {/* Main form */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 24, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, color: 'var(--green-deep)', borderBottom: '2px solid var(--green-light)', paddingBottom: 10 }}>
            📝 মূল তথ্য
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {/* Category-specific type */}
            {category === 'property' && (
              <div style={{ display: 'grid', className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} }}>
                <div>
                  <label>প্রপার্টির ধরন *</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)}>
                    {PROPERTY_TYPES.map(t => <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label>উদ্দেশ্য *</label>
                  <select value={form.purpose} onChange={e => set('purpose', e.target.value)}>
                    <option value="SALE">বিক্রয়</option>
                    <option value="RENT">ভাড়া</option>
                  </select>
                </div>
              </div>
            )}

            {category === 'vehicle' && (
              <div style={{ display: 'grid', className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} }}>
                <div>
                  <label>গাড়ির ধরন *</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)}>
                    {VEHICLE_TYPES.map(t => <option key={t} value={t}>{VEHICLE_TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label>উদ্দেশ্য *</label>
                  <select value={form.purpose} onChange={e => set('purpose', e.target.value)}>
                    <option value="SALE">বিক্রয়</option>
                    <option value="RENT">ভাড়া</option>
                  </select>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label>{category === 'construction' ? 'কোম্পানির নাম *' : 'বিজ্ঞাপনের শিরোনাম *'}</label>
              <input placeholder={category === 'construction' ? 'যেমন: ABC Construction Ltd.' : 'যেমন: গুলশানে ৩ রুমের ফার্নিশড ফ্ল্যাট ভাড়া'}
                value={category === 'construction' ? form.companyName : form.title}
                onChange={e => set(category === 'construction' ? 'companyName' : 'title', e.target.value)} />
            </div>

            {/* Description */}
            <div>
              <label>বিস্তারিত বিবরণ *</label>
              <textarea rows={4} placeholder="প্রপার্টি/গাড়ি সম্পর্কে বিস্তারিত লিখুন..."
                value={form.description} onChange={e => set('description', e.target.value)}
                style={{ resize: 'vertical' }} />
            </div>

            {/* Vehicle-specific fields */}
            {category === 'vehicle' && (
              <div style={{ display: 'grid', className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} }}>
                <div><label>ব্র্যান্ড *</label><input placeholder="Toyota" value={form.brand} onChange={e => set('brand', e.target.value)} /></div>
                <div><label>মডেল *</label><input placeholder="Corolla" value={form.model} onChange={e => set('model', e.target.value)} /></div>
                <div><label>বছর *</label><input type="number" value={form.year} onChange={e => set('year', e.target.value)} /></div>
                <div>
                  <label>অবস্থা *</label>
                  <select value={form.condition} onChange={e => set('condition', e.target.value)}>
                    {CONDITIONS.map(c => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
                  </select>
                </div>
                <div><label>মাইলেজ (কিমি)</label><input type="number" placeholder="50000" value={form.mileage} onChange={e => set('mileage', e.target.value)} /></div>
                <div><label>রঙ</label><input placeholder="White" value={form.color} onChange={e => set('color', e.target.value)} /></div>
              </div>
            )}

            {/* Property-specific fields */}
            {category === 'property' && form.type !== 'LAND' && (
              <div style={{ display: 'grid', className="form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }} }}>
                <div><label>আয়তন (বর্গফুট)</label><input type="number" placeholder="1200" value={form.area} onChange={e => set('area', e.target.value)} /></div>
                {['FLAT','HOUSE'].includes(form.type) && <>
                  <div><label>বেডরুম</label><input type="number" placeholder="3" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} /></div>
                  <div><label>বাথরুম</label><input type="number" placeholder="2" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} /></div>
                  <div><label>ফ্লোর নং</label><input type="number" placeholder="5" value={form.floor} onChange={e => set('floor', e.target.value)} /></div>
                  <div><label>মোট ফ্লোর</label><input type="number" placeholder="10" value={form.totalFloors} onChange={e => set('totalFloors', e.target.value)} /></div>
                </>}
              </div>
            )}

            {/* Construction services */}
            {category === 'construction' && (
              <div style={{ display: 'grid', className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} }}>
                <div>
                  <label>অভিজ্ঞতা (বছর) *</label>
                  <input type="number" placeholder="10" value={form.experience} onChange={e => set('experience', e.target.value)} />
                </div>
                <div>
                  <label>সেবাসমূহ (কমা দিয়ে আলাদা করুন)</label>
                  <input placeholder="ভবন নির্মাণ, ইন্টেরিয়র ডিজাইন" value={form.services} onChange={e => set('services', e.target.value)} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Price */}
        {category !== 'construction' && (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 24, marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--green-deep)' }}>💰 মূল্য</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, alignItems: 'end' }}>
              <div>
                <label>মূল্য (টাকা) *</label>
                <input type="number" placeholder="25000" value={form.price} onChange={e => set('price', e.target.value)} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 0, cursor: 'pointer', fontWeight: 500 }}>
                <input type="checkbox" checked={form.negotiable} onChange={e => set('negotiable', e.target.checked)} style={{ width: 'auto' }} />
                দাম আলোচনাসাপেক্ষ
              </label>
            </div>
          </div>
        )}

        {/* Location */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 24, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--green-deep)' }}>📍 অবস্থান</div>
          <div style={{ display: 'grid', className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} }}>
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
          <div style={{ marginTop: 12 }}>
            <label>এলাকার নাম</label>
            <input placeholder="যেমন: গুলশান ২, বনানী" value={form.areaName} onChange={e => set('areaName', e.target.value)} />
          </div>
          <div style={{ marginTop: 12 }}>
            <label>পূর্ণ ঠিকানা</label>
            <input placeholder="বাড়ি নং, রাস্তা, এলাকা" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
        </div>

        {/* Images */}
        <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 24, marginBottom: 28 }}>
          <div style={{ fontWeight: 700, marginBottom: 16, color: 'var(--green-deep)' }}>📸 ছবি (সর্বোচ্চ ৮টি)</div>

          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--border)', borderRadius: 10, padding: 24, cursor: 'pointer', marginBottom: 12, fontWeight: 400 }}>
            <span style={{ fontSize: '2rem', marginBottom: 6 }}>{uploadingImg ? '⏳' : '📁'}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {uploadingImg ? 'আপলোড হচ্ছে...' : 'ক্লিক করে ছবি বেছে নিন'}
            </span>
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImg} />
          </label>

          {images.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {images.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt="" style={{ width: 80, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                  <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'var(--red)', color: 'white', border: 'none',
                    cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn-primary" onClick={handleSubmit} disabled={submitting}
          style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '1.05rem' }}>
          {submitting ? '⏳ জমা হচ্ছে...' : '✅ বিজ্ঞাপন জমা দিন'}
        </button>
      </div>
    </div>
  )
}
