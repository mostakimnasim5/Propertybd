'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

type Step = 'phone' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const redirect = searchParams.get('redirect') || '/'

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const startCountdown = () => {
    setCountdown(60)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendOTP = async () => {
    const phoneRegex = /^01[3-9]\d{8}$/
    if (!phoneRegex.test(phone)) {
      toast.error('সঠিক মোবাইল নম্বর দিন (যেমন: 01XXXXXXXXX)')
      return
    }
    setLoading(true)
    try {
      await axios.post('/api/auth/send-otp', { phone })
      setStep('otp')
      startCountdown()
      toast.success('OTP পাঠানো হয়েছে')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'OTP পাঠাতে সমস্যা হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const code = otp.join('')
    if (code.length !== 6) { toast.error('৬ সংখ্যার OTP দিন'); return }
    setLoading(true)
    try {
      const res = await axios.post('/api/auth/verify-otp', { phone, code, name: name || undefined })
      const data = res.data.data
      if (data.isNewUser && !name) {
        setIsNewUser(true)
        setLoading(false)
        return
      }
      await refreshUser()
      toast.success('লগইন সফল!')
      router.push(redirect)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'OTP সঠিক নয়')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'white', borderRadius: 20,
      padding: '40px 36px', width: '100%', maxWidth: 400,
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontWeight: 800, fontSize: '1.7rem', color: 'var(--green-deep)' }}>
            Property<span style={{ color: 'var(--amber)' }}>BD</span>
          </div>
        </Link>
        <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.95rem' }}>
          {step === 'phone' ? 'মোবাইল নম্বর দিয়ে লগইন করুন' : 'OTP যাচাই করুন'}
        </p>
      </div>

      {step === 'phone' ? (
        <div>
          <label>মোবাইল নম্বর</label>
          <input
            type="tel" placeholder="01XXXXXXXXX" value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
            maxLength={11} autoFocus
            style={{ fontSize: '1.1rem', letterSpacing: 1 }}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 6 }}>
            এই নম্বরে একটি OTP পাঠানো হবে
          </p>
          <button className="btn-primary" onClick={handleSendOTP}
            disabled={loading || phone.length < 11}
            style={{ width: '100%', marginTop: 20, justifyContent: 'center', padding: '14px' }}>
            {loading ? 'পাঠানো হচ্ছে...' : 'OTP পাঠান'}
          </button>
        </div>
      ) : (
        <div>
          {isNewUser && (
            <div style={{ marginBottom: 20 }}>
              <label>আপনার নাম (নতুন অ্যাকাউন্ট)</label>
              <input type="text" placeholder="আপনার পুরো নাম"
                value={name} onChange={e => setName(e.target.value)} autoFocus />
            </div>
          )}

          <label>OTP কোড — {phone}</label>
          <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
            {otp.map((digit, i) => (
              <input key={i}
                ref={el => { otpRefs.current[i] = el }}
                type="text" inputMode="numeric" value={digit}
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                maxLength={1}
                style={{
                  width: '100%', textAlign: 'center',
                  fontSize: '1.4rem', fontWeight: 700, padding: '12px 4px',
                  borderColor: digit ? 'var(--green-deep)' : 'var(--border)',
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <button onClick={() => { setStep('phone'); setOtp(['','','','','','']) }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.88rem' }}>
              ← নম্বর পরিবর্তন
            </button>
            <button onClick={handleSendOTP} disabled={countdown > 0 || loading}
              style={{
                background: 'none', border: 'none',
                color: countdown > 0 ? 'var(--text-muted)' : 'var(--green-deep)',
                cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600, fontFamily: 'inherit', fontSize: '0.88rem',
              }}>
              {countdown > 0 ? `পুনরায় পাঠান (${countdown}s)` : 'পুনরায় পাঠান'}
            </button>
          </div>

          <button className="btn-primary" onClick={handleVerifyOTP}
            disabled={loading || otp.join('').length < 6}
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
            {loading ? 'যাচাই হচ্ছে...' : isNewUser ? 'অ্যাকাউন্ট তৈরি করুন' : 'লগইন করুন'}
          </button>
        </div>
      )}

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
        লগইন করলে আমাদের{' '}
        <Link href="/terms" style={{ color: 'var(--green-deep)' }}>শর্তাবলি</Link> ও{' '}
        <Link href="/privacy" style={{ color: 'var(--green-deep)' }}>গোপনীয়তা নীতি</Link> মেনে নিয়েছেন বলে ধরা হবে
      </p>
    </div>
  )
}
