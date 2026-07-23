'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import ListingCard from '@/components/listing/ListingCard'

export default function SavedPage() {
  const [saved, setSaved] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('/api/users/saved')
      .then(r => setSaved(r.data.data.saved || []))
      .catch(() => toast.error('সমস্যা হয়েছে'))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (listingId: string) => {
    try {
      await axios.post('/api/users/saved', { listingId })
      setSaved(prev => prev.filter(s => s.listingId !== listingId))
      toast.success('সরানো হয়েছে')
    } catch { toast.error('সমস্যা হয়েছে') }
  }

  return (
    <div style={{ padding: '32px 0', minHeight: '70vh' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--green-deep)' }}>❤️ সংরক্ষিত বিজ্ঞাপন</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{saved.length} টি সংরক্ষিত</p>
          </div>
          <Link href="/properties" style={{ color: 'var(--green-deep)', fontWeight: 700, textDecoration: 'none' }}>
            আরো দেখুন →
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {[...Array(4)].map((_, i) => <div key={i} style={{ height: 280, background: 'var(--surface-2)', borderRadius: 12 }} />)}
          </div>
        ) : saved.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {saved.map((s: any) => (
              <div key={s.id} style={{ position: 'relative' }}>
                <ListingCard listing={s.listing} />
                <button onClick={() => handleRemove(s.listingId)} style={{
                  position: 'absolute', top: 10, right: 10,
                  background: 'rgba(220,38,38,0.9)', color: 'white',
                  border: 'none', borderRadius: '50%', width: 28, height: 28,
                  cursor: 'pointer', fontSize: '0.8rem', zIndex: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🤍</div>
            <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: 8 }}>কোনো বিজ্ঞাপন সংরক্ষিত নেই</div>
            <div style={{ fontSize: '0.9rem', marginBottom: 20 }}>পছন্দের বিজ্ঞাপনে ❤️ চিহ্নে ক্লিক করে সংরক্ষণ করুন</div>
            <Link href="/properties" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex' }}>
              প্রপার্টি দেখুন
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
