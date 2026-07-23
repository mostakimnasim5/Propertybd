'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.message) {
      toast.error('সব প্রয়োজনীয় তথ্য দিন')
      return
    }
    setSending(true)
    // In production: send to email API
    await new Promise(r => setTimeout(r, 1000))
    toast.success('আপনার বার্তা পাঠানো হয়েছে। শীঘ্রই যোগাযোগ করা হবে।')
    setForm({ name: '', phone: '', subject: '', message: '' })
    setSending(false)
  }

  return (
    <div style={{ padding: '48px 0', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: 680 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: 8 }}>যোগাযোগ করুন</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 36 }}>যেকোনো সমস্যা বা প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Info */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                { icon: '📞', label: 'ফোন', value: '01700-000000' },
                { icon: '📧', label: 'ইমেইল', value: 'support@propertybd.com' },
                { icon: '🕐', label: 'সময়', value: 'শনি–বৃহস্পতি: সকাল ৯টা – রাত ৯টা' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.3rem', marginTop: 2 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontWeight: 600 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label>নাম *</label>
              <input placeholder="আপনার নাম" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label>মোবাইল *</label>
              <input placeholder="01XXXXXXXXX" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <label>বিষয়</label>
              <input placeholder="বিষয়" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
            </div>
            <div>
              <label>বার্তা *</label>
              <textarea rows={4} placeholder="আপনার বার্তা লিখুন..." value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
            <button className="btn-primary" onClick={handleSubmit} disabled={sending}
              style={{ justifyContent: 'center' }}>
              {sending ? 'পাঠানো হচ্ছে...' : '📤 বার্তা পাঠান'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
