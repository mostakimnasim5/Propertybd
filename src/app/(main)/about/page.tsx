import Link from 'next/link'

export default function AboutPage() {
  return (
    <div style={{ padding: '48px 0', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: 8 }}>আমাদের সম্পর্কে</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 40, fontSize: '1.05rem' }}>
          PropertyBD — বাংলাদেশের সবচেয়ে বিশ্বস্ত প্রপার্টি মার্কেটপ্লেস
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {[
            {
              icon: '🎯', title: 'আমাদের লক্ষ্য',
              content: 'বাংলাদেশের মানুষের জন্য সম্পদ কেনা-বেচা ও ভাড়ার প্রক্রিয়াকে সহজ, স্বচ্ছ এবং নিরাপদ করে তোলা। আমরা বিশ্বাস করি প্রযুক্তির সাহায্যে রিয়েল এস্টেট বাজারকে সবার কাছে সহজলভ্য করা সম্ভব।',
            },
            {
              icon: '🛡️', title: 'বিশ্বস্ততা',
              content: 'আমাদের প্ল্যাটফর্মে প্রতিটি বিজ্ঞাপন অ্যাডমিন কর্তৃক যাচাই করা হয়। NID যাচাইকৃত মালিকদের বিশেষ ব্যাজ দেওয়া হয়। ফলে ক্রেতা ও ভাড়াটেরা নিশ্চিন্তে যোগাযোগ করতে পারেন।',
            },
            {
              icon: '📍', title: 'সারাদেশে সেবা',
              content: 'বাংলাদেশের ৮টি বিভাগ এবং ৬৪টি জেলায় আমাদের সেবা পাওয়া যায়। ঢাকা থেকে চট্টগ্রাম, রাজশাহী থেকে সিলেট — সর্বত্র আমরা আছি।',
            },
            {
              icon: '💰', title: 'সাশ্রয়ী মূল্য',
              content: 'বিজ্ঞাপন দেওয়া সম্পূর্ণ বিনামূল্যে। শুধুমাত্র যোগাযোগের তথ্য দেখতে সামান্য ফি প্রযোজ্য, যা দালালের তুলনায় অনেক কম।',
            },
          ].map(item => (
            <div key={item.title} style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: '24px' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: 10 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8 }}>{item.title}</div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9 }}>{item.content}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <Link href="/contact" className="btn-primary" style={{ textDecoration: 'none', marginRight: 12 }}>যোগাযোগ করুন</Link>
          <Link href="/properties" className="btn-outline" style={{ textDecoration: 'none' }}>প্রপার্টি দেখুন</Link>
        </div>
      </div>
    </div>
  )
}
