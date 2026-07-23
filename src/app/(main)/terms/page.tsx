export default function TermsPage() {
  const sections = [
    { title: '১. সেবার শর্ত', content: 'PropertyBD শুধুমাত্র বিজ্ঞাপন প্রকাশের মাধ্যম। আমরা ক্রেতা ও বিক্রেতার মধ্যে সরাসরি লেনদেনের পক্ষ নই।' },
    { title: '২. ব্যবহারকারীর দায়িত্ব', content: 'বিজ্ঞাপনদাতা সকল তথ্যের সত্যতা নিশ্চিত করতে বাধ্য। মিথ্যা তথ্য দিলে বিজ্ঞাপন বাতিল করা হবে।' },
    { title: '৩. নিষিদ্ধ কার্যক্রম', content: 'প্রতারণামূলক বিজ্ঞাপন, অবৈধ সম্পদ বিক্রয়, এবং স্প্যাম কঠোরভাবে নিষিদ্ধ।' },
    { title: '৪. পেমেন্ট ও রিফান্ড', content: 'লিড আনলকের পেমেন্ট সাধারণত ফেরতযোগ্য নয়। তবে প্রযুক্তিগত সমস্যার ক্ষেত্রে আবেদন করা যাবে।' },
    { title: '৫. বিরোধ নিষ্পত্তি', content: 'ক্রেতা ও বিক্রেতার মধ্যে যেকোনো বিরোধের দায় PropertyBD বহন করে না। উভয়পক্ষ নিজেরা সমাধান করবেন।' },
  ]

  return (
    <div style={{ padding: '48px 0', minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-deep)', marginBottom: 8 }}>শর্তাবলি</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 36 }}>PropertyBD ব্যবহার করলে নিচের শর্তগুলো মেনে নেওয়া হয়</p>
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
