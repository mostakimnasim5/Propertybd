'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { SUBSCRIPTION_PLANS } from '@/lib/subscriptionPlans'

export default function SubscriptionPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState<string | null>(null)

  useEffect(() => {
    axios.get('/api/subscription')
      .then(r => setSubscription(r.data.data.subscription))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubscribe = async (planId: string) => {
    if (!user) { window.location.href = '/login'; return }
    setPaying(planId)
    try {
      const res = await axios.post('/api/payments/init', {
        type: 'subscription',
        plan: planId,
      })
      window.location.href = res.data.data.gatewayUrl
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Payment শুরু করতে সমস্যা')
    } finally {
      setPaying(null)
    }
  }

  const plans = Object.values(SUBSCRIPTION_PLANS)

  return (
    <div style={{ padding: '32px 0', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: 900 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--green-light)', color: 'var(--green-deep)', fontSize: '0.8rem', fontWeight: 700, padding: '4px 12px', borderRadius: 99, marginBottom: 14 }}>
            👔 Broker Subscription
          </div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 800, marginBottom: 10 }}>
            Broker হিসেবে বেশি listing দিন
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
            Subscription নিলে আনলিমিটেড listing, Verified badge, আর Boost voucher পাবেন। একটা deal-এই subscription cost উঠে আসে।
          </p>
        </div>

        {/* Current subscription status */}
        {!loading && subscription && subscription.isActive && (
          <div style={{ background: 'var(--green-light)', borderRadius: 14, padding: 20, marginBottom: 32, border: '2px solid rgba(22,106,71,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--green-deep)', marginBottom: 4 }}>
                  ✅ সক্রিয় Subscription — {subscription.planDetails?.nameBn}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {subscription.daysLeft} দিন বাকি •{' '}
                  {subscription.listingCount}/{subscription.listingLimit === 999999 ? '∞' : subscription.listingLimit} listing এই মাসে
                </div>
              </div>
              <div style={{ background: 'var(--green-deep)', color: 'white', padding: '8px 16px', borderRadius: 8, fontWeight: 700, fontSize: '0.88rem' }}>
                Renew — ৳{subscription.planDetails?.price?.toLocaleString()}/মাস
              </div>
            </div>

            {/* Usage bar */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                <span>Listing ব্যবহার এই মাসে</span>
                <span>{subscription.listingCount} / {subscription.listingLimit === 999999 ? '∞' : subscription.listingLimit}</span>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.08)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  width: `${Math.min(100, (subscription.listingCount / (subscription.listingLimit || 1)) * 100)}%`,
                  background: 'var(--green-deep)',
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 48 }}>
          {plans.map(plan => {
            const isCurrentPlan = subscription?.isActive && subscription?.plan === plan.id
            const isPopular = plan.popular

            return (
              <div key={plan.id} style={{
                background: 'white',
                borderRadius: 16,
                border: `2px solid ${isPopular ? plan.color : isCurrentPlan ? 'var(--green-deep)' : 'var(--border)'}`,
                overflow: 'hidden',
                position: 'relative',
                transform: isPopular ? 'scale(1.02)' : 'none',
                boxShadow: isPopular ? 'var(--shadow-md)' : 'none',
              }}>
                {/* Popular badge */}
                {isPopular && (
                  <div style={{ background: plan.color, color: 'white', textAlign: 'center', padding: '6px 0', fontSize: '0.75rem', fontWeight: 800, letterSpacing: 1 }}>
                    ⭐ সবচেয়ে জনপ্রিয়
                  </div>
                )}

                {isCurrentPlan && !isPopular && (
                  <div style={{ background: 'var(--green-deep)', color: 'white', textAlign: 'center', padding: '6px 0', fontSize: '0.75rem', fontWeight: 800 }}>
                    ✅ বর্তমান Plan
                  </div>
                )}

                <div style={{ padding: 24 }}>
                  {/* Plan name & price */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                      {plan.nameBn}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: plan.color }}>
                        ৳{plan.price.toLocaleString()}
                      </span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/মাস</span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                    {plan.featuresBn.map((feature, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10, fontSize: '0.88rem' }}>
                        <span style={{ color: plan.color, fontWeight: 800, fontSize: '0.9rem', marginTop: 1, flexShrink: 0 }}>✓</span>
                        <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrentPlan ? (
                    <button disabled style={{ width: '100%', padding: '12px', borderRadius: 10, border: '2px solid var(--green-deep)', background: 'var(--green-light)', color: 'var(--green-deep)', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'inherit', cursor: 'not-allowed' }}>
                      বর্তমান Plan ✓
                    </button>
                  ) : (
                    <button onClick={() => handleSubscribe(plan.id)}
                      disabled={!!paying}
                      style={{
                        width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                        background: paying === plan.id ? '#ccc' : plan.color,
                        color: 'white', fontWeight: 700, fontSize: '0.9rem',
                        fontFamily: 'inherit', cursor: paying ? 'not-allowed' : 'pointer',
                        transition: 'opacity 0.2s',
                      }}>
                      {paying === plan.id ? '⏳ প্রক্রিয়া হচ্ছে...' : subscription?.isActive ? '🔄 Upgrade করুন' : '⚡ শুরু করুন'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid var(--border)', padding: 24, marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 20 }}>সাধারণ প্রশ্নোত্তর</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { q: 'Subscription cancel করা যাবে?', a: 'হ্যাঁ। যেকোনো সময় cancel করতে পারবেন। মেয়াদ শেষ হলে auto-renew হবে না।' },
              { q: 'Payment কীভাবে করবো?', a: 'bKash, Nagad, Rocket এবং সব ধরনের card-এ payment করা যাবে SSLCommerz-এর মাধ্যমে।' },
              { q: 'Listing limit কখন reset হয়?', a: 'প্রতি মাসের ১ তারিখে reset হয়।' },
              { q: 'Boost voucher কীভাবে ব্যবহার করবো?', a: 'Dashboard → Boost Panel থেকে voucher apply করে listing boost করা যাবে।' },
            ].map((item, i) => (
              <div key={i} style={{ borderBottom: i < 3 ? '1px solid var(--border)' : 'none', paddingBottom: i < 3 ? 14 : 0 }}>
                <div style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.95rem' }}>Q: {item.q}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>A: {item.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/dashboard" style={{ color: 'var(--green-deep)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Dashboard-এ ফিরুন
          </Link>
        </div>
      </div>
    </div>
  )
}
