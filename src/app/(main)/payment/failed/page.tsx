'use client'
import Link from 'next/link'

export default function PaymentFailedPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontSize: '5rem', marginBottom: 20 }}>❌</div>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 10, color: '#DC2626' }}>
          Payment ব্যর্থ হয়েছে
        </h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 28 }}>
          আপনার Payment সম্পন্ন হয়নি। কোনো টাকা কাটা হয়নি।
          আবার চেষ্টা করুন অথবা অন্য পেমেন্ট পদ্ধতি ব্যবহার করুন।
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => window.history.back()} className="btn-primary">
            ← আবার চেষ্টা করুন
          </button>
          <Link href="/" className="btn-outline" style={{ textDecoration: 'none' }}>
            হোমপেজে যান
          </Link>
        </div>
      </div>
    </div>
  )
}
