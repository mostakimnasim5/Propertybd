'use client'
import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ textAlign: 'center', maxWidth: 420 }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>কিছু একটা সমস্যা হয়েছে</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
          পেজটি লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={reset} className="btn-primary">🔄 আবার চেষ্টা করুন</button>
          <Link href="/" className="btn-outline" style={{ textDecoration: 'none' }}>হোমপেজ</Link>
        </div>
      </div>
    </div>
  )
}
