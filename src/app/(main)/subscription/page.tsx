'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptionPlans'

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth()
  const [currentSub, setCurrentSub] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<string | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    if (user) {
      axios.get('/api/subscription/status')
        .then(r => setCurrentSub(r.data.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      window.location.href = '/login?redirect=/subscription'
      return
    }

    setPaying(planId)
    try {
      // In production: go through payment gateway first
      // For now: direct activation (add SSLCommerz in production)
      const res = await axios.post('/api/subscription/create', {
        plan: planId,
        transactionId: `TEST-${Date.now()}`,
      })

      toast.success(res.data.data.message)
      await refreshUser()

      // Reload subscription status
      const statusRes = await axios.get('/api/subscription/status')
      setCurrentSub(statusRes.data.data)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'সমস্যা হয়েছে')
    } finally {
      setPaying(null)
    }
  }

  const plans = Object.values(SUBSCRIPTION_PLANS)

  return (
    <div style={{ minHeight: '70vh', background: 'var(--surface)', padding: '40px 0 60px' }}>
      <div className="container" style={{ maxWidth: 900 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-block', background: 'var(--green-light)', color: 'var(--green-deep)', fontSize: '0.78rem', fontWeight: 700, padding: '4px 14px', borderRadius: 99, marginBottom: 12 }}>
            👔 ব্রোকার সাবস্ক্রিপশন
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 10 }}>
            আপনার Business বাড়ান
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
            মাসিক সাবস্ক্রিপশনে বেশি listing দিন, verified badge পান এবং বেশি buyer পান।
          </p>
        </div>

        {/* Current subscription status */}
        {currentSub?.isActive && (
          <div style={{ background: 'var(--green-light)', borderRadius: 14, border: '1px solid rgba(22,106,71,0.25)', padding: '20px 24px', marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 800, color: 'var(--green-deep)', fontSize: '1rem', marginBottom: 4 }}>
                ✅ আপনার বর্তমান plan: {currentSub.subscription?.planDetails?.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {currentSub.subscription?.daysLeft} দিন বাকি •{' '}
                {currentSub.subscription?.listingCount}/{currentSub.subscription?.listingLimit} listing ব্যবহৃত
              </div>
            </div>
            <Link href="/dashboard" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 18px', fontSize: '0.88rem' }}>
              Dashboard →
            </Link>
          </div>
        )}

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 40 }}>
          {plans.map(plan => {
            const isCurrentPlan = currentSub?.isActive && currentSub?.subscription?.plan === plan.id
            const isPaying = paying === plan.id

            return (
              <div key={plan.id} style={{
                background: 'white',
                borderRadius: 16,
                border: plan.popular
                  ? '2px solid var(--green-deep)'
                  : '1px solid var(--border)',
                overflow: 'hidden',
                position: 'relative',
                transform: plan.popular ? 'scale(1.02)' : 'none',
                boxShadow: plan.popular ? 'var(--shadow-md)' : 'none',
              }}>
                {/* Popular badge */}
                {plan.popular && (
                  <div style={{ background: 'var(--green-deep)', color: 'white', textAlign: 'center', padding: '6px', fontSize: '0.75rem', fontWeight: 800, letterSpacing: 1 }}>
                    ⭐ সবচেয়ে জনপ্রিয়
                  </div>
                )}

                <div style={{ padding: '24px 22px' }}>
                  {/* Plan header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem', marginBottom: 4 }}>{plan.name}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: '2rem', fontWeight: 900, color: plan.color }}>৳{plan.price.toLocaleString()}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/মাস</span>
                      </div>
                    </div>
                    <div style={{ background: plan.bg, borderRadius: 10, padding: '8px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.7rem', color: plan.color, fontWeight: 700 }}>Listing</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 900, color: plan.color }}>
                        {plan.maxListings === 999 ? '∞' : plan.maxListings}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div style={{ marginBottom: 20 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 7 }}>
                        <span style={{ color: plan.color, fontWeight: 700, marginTop: 1 }}>✓</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map(f => (
                      <div key={f} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 7 }}>
                        <span style={{ color: 'var(--text-muted)', marginTop: 1 }}>✗</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{f}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {isCurrentPlan ? (
                    <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: '12px', textAlign: 'center', fontWeight: 700, color: 'var(--green-deep)', fontSize: '0.9rem' }}>
                      ✅ বর্তমান Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isPaying || !!paying}
                      style={{
                        width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                        background: plan.popular ? 'var(--green-deep)' : plan.bg,
                        color: plan.popular ? 'white' : plan.color,
                        fontWeight: 800, fontSize: '0.95rem', cursor: isPaying || !!paying ? 'not-allowed' : 'pointer',
                        fontFamily: 'inherit', opacity: !!paying && !isPaying ? 0.7 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      {isPaying ? '⏳ প্রক্রিয়া হচ্ছে...' : `${plan.name} শুরু করুন`}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: '28px 28px' }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 20, color: 'var(--green-deep)' }}>
            সাধারণ প্রশ্ন
          </div>
          <div style={{ display: 'grid', gap: 0 }}>
            {[
              {
                q: 'Subscription কীভাবে কাজ করে?',
                a: 'মাসিক subscription নিলে আপনি নির্ধারিত সংখ্যক listing দিতে পারবেন। Verified badge পাবেন। বেশি buyer আপনার listing দেখবে।',
              },
              {
                q: 'মেয়াদ শেষ হলে কী হবে?',
                a: 'Subscription শেষ হলে আপনার listing গুলো সাধারণ listing হিসেবে থাকবে — delete হবে না। নতুন listing দিতে পারবেন না।',
              },
              {
                q: 'Plan upgrade করা যাবে?',
                a: 'হ্যাঁ। বর্তমান subscription শেষ হওয়ার আগেও upgrade করা যাবে।',
              },
              {
                q: 'Refund পাওয়া যাবে?',
                a: 'Technical সমস্যার ক্ষেত্রে refund দেওয়া হয়। সাধারণ ক্ষেত্রে refund নীতি প্রযোজ্য নয়।',
              },
            ].map((faq, i, arr) => (
              <div key={faq.q} style={{ paddingBottom: i < arr.length - 1 ? 16 : 0, marginBottom: i < arr.length - 1 ? 16 : 0, borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.95rem' }}>{faq.q}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{faq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact for Enterprise */}
        <div style={{ textAlign: 'center', marginTop: 28, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
          বড় agency বা enterprise-এর জন্য custom deal-এর জন্য{' '}
          <Link href="/contact" style={{ color: 'var(--green-deep)', fontWeight: 700, textDecoration: 'none' }}>
            যোগাযোগ করুন →
          </Link>
        </div>
      </div>
    </div>
  )
}
