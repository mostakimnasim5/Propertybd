import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px' }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontSize: '5rem', marginBottom: 16 }}>🏚️</div>
        <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--green-deep)', marginBottom: 8 }}>404</h1>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>পেজটি পাওয়া যায়নি</p>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 28 }}>
          আপনি যে পেজটি খুঁজছেন সেটি সরানো হয়েছে বা ঠিকানা পরিবর্তন হয়েছে।
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>🏠 হোমপেজে যান</Link>
          <Link href="/properties" className="btn-outline" style={{ textDecoration: 'none' }}>প্রপার্টি দেখুন</Link>
        </div>
      </div>
    </div>
  )
}
