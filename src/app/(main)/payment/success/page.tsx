'use client'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [unlocking, setUnlocking] = useState(true)
  const [phone, setPhone] = useState<string | null>(null)

  useEffect(() => {
    const valId = searchParams.get('val_id')
    const type = searchParams.get('type')
    const itemId = searchParams.get('itemId')

    if (!valId || !itemId) { setUnlocking(false); return }

    const unlockPayload: Record<string, string> = { transactionId: valId }
    if (type === 'lead') {
      // Determine which ID type based on URL context
      unlockPayload.listingId = itemId
    }

    axios.post('/api/leads/unlock', unlockPayload)
      .then(r => {
        setPhone(r.data.data.phone)
        toast.success('Lead unlock সফল!')
      })
      .catch(() => toast.error('Lead unlock-এ সমস্যা হয়েছে'))
      .finally(() => setUnlocking(false))
  }, [searchParams])

  return (
    <div style={{ padding: '80px 0', textAlign: 'center', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: 480 }}>
        {unlocking ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⏳</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Payment যাচাই হচ্ছে...</div>
          </>
        ) : (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'var(--green-light)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', margin: '0 auto 20px',
            }}>✅</div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: 8 }}>
              Payment সফল!
            </h1>

            {phone ? (
              <div style={{ background: 'var(--green-light)', borderRadius: 14, padding: '24px 20px', margin: '20px 0' }}>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 8 }}>মালিকের যোগাযোগ নম্বর</div>
                <a href={`tel:${phone}`} style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green-deep)', textDecoration: 'none' }}>
                  📞 {phone}
                </a>
                <div style={{ marginTop: 14 }}>
                  <a href={`tel:${phone}`} className="btn-primary" style={{ display: 'inline-flex', textDecoration: 'none', padding: '10px 24px' }}>
                    এখনই কল করুন
                  </a>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                Payment সম্পন্ন হয়েছে।
              </p>
            )}

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
              <Link href="/properties" className="btn-outline" style={{ textDecoration: 'none' }}>প্রপার্টি দেখুন</Link>
              <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>ড্যাশবোর্ড</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
