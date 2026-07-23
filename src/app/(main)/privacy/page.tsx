export default function PrivacyPage() {
  const sections = [
    { title: '১. তথ্য সংগ্রহ', content: 'আমরা আপনার মোবাইল নম্বর, নাম এবং বিজ্ঞাপন সংক্রান্ত তথ্য সংগ্রহ করি। OTP যাচাইয়ের মাধ্যমে পরিচয় নিশ্চিত করা হয়।' },
    { title: '২. তথ্য ব্যবহার', content: 'আপনার তথ্য শুধুমাত্র প্ল্যাটফর্মের সেবা প্রদানের জন্য ব্যবহার করা হয়। তৃতীয় পক্ষের কাছে বিক্রি করা হয় না।' },
    { title: '৩. তথ্য সুরক্ষা', content: 'আমরা শিল্পমানের নিরাপত্তা ব্যবস্থা (HTTPS, এনক্রিপশন) ব্যবহার করে আপনার তথ্য সুরক্ষিত রাখি।' },
    { title: '৪. কুকি', content: 'আমরা লগইন সেশন বজায় রাখতে HTTP-only কুকি ব্যবহার করি। এটি আপনার নিরাপত্তার জন্য।' },
    { title: '৫. আপনার অধিকার', content: 'আপনি যেকোনো সময় আপনার অ্যাকাউন্ট মুছে ফেলার জন্য আমাদের সাথে যোগাযোগ করতে পারেন।' },
  ]

  return (
    <div style={{ padding: '48px 0', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: 8 }}>গোপনীয়তা নীতি</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 36 }}>সর্বশেষ আপডেট: জানুয়ারি ২০২৫</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections.map(s => (
            <div key={s.title} style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
              <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--green-deep)' }}>{s.title}</div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9 }}>{s.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
