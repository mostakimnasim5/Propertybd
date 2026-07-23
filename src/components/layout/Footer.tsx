import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--green-deep)', color: 'white', marginTop: 64 }}>
      <div className="container" style={{ padding: '48px 1rem 32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: 12 }}>
              Property<span style={{ color: 'var(--amber)' }}>BD</span>
            </div>
            <p style={{ opacity: 0.8, lineHeight: 1.8, fontSize: '0.9rem' }}>
              বাংলাদেশের সব ধরনের সম্পদ কেনা-বেচা ও ভাড়ার জন্য সবচেয়ে বিশ্বস্ত প্ল্যাটফর্ম।
            </p>
          </div>

          {[
            {
              title: 'প্রপার্টি', links: [
                { href: '/properties?purpose=RENT', label: 'ভাড়ার ফ্ল্যাট' },
                { href: '/properties?purpose=SALE&type=FLAT', label: 'ফ্ল্যাট বিক্রি' },
                { href: '/properties?type=LAND', label: 'জমি বিক্রি' },
                { href: '/properties?type=SHOP', label: 'দোকান ভাড়া' },
              ]
            },
            {
              title: 'গাড়ি', links: [
                { href: '/vehicles?type=CAR&purpose=SALE', label: 'গাড়ি বিক্রি' },
                { href: '/vehicles?type=CAR&purpose=RENT', label: 'গাড়ি ভাড়া' },
                { href: '/vehicles?type=BIKE', label: 'বাইক বিক্রি' },
              ]
            },
            {
              title: 'আমাদের সম্পর্কে', links: [
                { href: '/about', label: 'আমাদের পরিচয়' },
                { href: '/contact', label: 'যোগাযোগ' },
                { href: '/privacy', label: 'গোপনীয়তা নীতি' },
                { href: '/terms', label: 'শর্তাবলি' },
              ]
            },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontWeight: 700, marginBottom: 12, opacity: 0.9 }}>{col.title}</div>
              {col.links.map(l => (
                <Link key={l.href} href={l.href} style={{
                  display: 'block', opacity: 0.7, textDecoration: 'none',
                  color: 'white', marginBottom: 8, fontSize: '0.9rem',
                  transition: 'opacity 0.15s',
                }}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>© {new Date().getFullYear()} PropertyBD. সর্বস্বত্ব সংরক্ষিত।</p>
          <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Made with ❤️ for Bangladesh</p>
        </div>
      </div>
    </footer>
  )
}
