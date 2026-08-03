'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: '🔜 শীঘ্রই আসছে',
  ONGOING: '🏗️ নির্মাণাধীন',
  READY: '✅ রেডি টু মুভ',
  COMPLETED: '🏁 সম্পন্ন',
}
const UNIT_STATUS: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: 'পাওয়া যাচ্ছে', color: '#166A47' },
  BOOKED: { label: 'বায়না হয়েছে', color: '#D97706' },
  SOLD: { label: 'বিক্রিত', color: '#DC2626' },
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'amenities'>('overview')

  useEffect(() => {
    axios.get(`/api/projects/${id}`)
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Project পাওয়া যায়নি'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ লোড হচ্ছে...</div>
  )
  if (!data) return (
    <div style={{ padding: '80px 0', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem' }}>😕</div>
      <Link href="/projects" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex', textDecoration: 'none' }}>
        Projects দেখুন
      </Link>
    </div>
  )

  const { project, unitSummary, contactPhone } = data
  const images = project.images || []
  const amenities: string[] = project.amenities || []

  const waLink = contactPhone
    ? `https://wa.me/${contactPhone.startsWith('0') ? '88' + contactPhone : contactPhone}?text=${encodeURIComponent(`PropertyBD থেকে "${project.title}" project সম্পর্কে জানতে চাই।`)}`
    : '#'

  return (
    <div style={{ padding: '24px 0', minHeight: '70vh' }}>
      <div className="container">

        {/* Breadcrumb */}
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>হোম</Link> →{' '}
          <Link href="/projects" style={{ color: 'inherit', textDecoration: 'none' }}>Projects</Link> →{' '}
          {project.title}
        </div>

        <div className="detail-layout">
          {/* Left */}
          <div>
            {/* Main image */}
            <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--surface-2)', paddingTop: '55%', position: 'relative', marginBottom: 10 }}>
              {images[activeImg]?.url ? (
                <img src={images[activeImg].url} alt={project.title}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🏗️</div>
              )}
              <span style={{
                position: 'absolute', top: 12, left: 12,
                background: 'rgba(14,77,52,0.9)', color: 'white',
                fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 99,
              }}>
                {STATUS_LABEL[project.status]}
              </span>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
                {images.map((img: any, i: number) => (
                  <button key={i} onClick={() => setActiveImg(i)} style={{
                    width: 72, height: 54, flexShrink: 0, borderRadius: 8, overflow: 'hidden',
                    padding: 0, cursor: 'pointer', background: 'none',
                    border: `2.5px solid ${i === activeImg ? 'var(--green-deep)' : 'transparent'}`,
                  }}>
                    <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Title & developer */}
            <div style={{ marginBottom: 16 }}>
              <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: 800, marginBottom: 6 }}>
                {project.title}
              </h1>
              {project.construction && (
                <Link href={`/construction/${project.constructionId}`} style={{
                  color: 'var(--green-deep)', fontWeight: 700, fontSize: '0.9rem',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
                }}>
                  🏢 {project.construction.companyName}
                  {project.isVerified && <span className="badge-verified">✓ যাচাই</span>}
                </Link>
              )}
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 6 }}>
                📍 {project.areaName ? `${project.areaName}, ` : ''}{project.district?.nameBn}
                <span style={{ marginLeft: 12 }}>👁️ {project.viewCount} বার দেখা</span>
              </div>
            </div>

            {/* Key info chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {[
                project.totalUnits && `🏠 মোট ${project.totalUnits}টি unit`,
                project.availableUnits && `✅ ${project.availableUnits}টি available`,
                project.floorCount && `🏢 ${project.floorCount} তলা`,
                project.landArea && `📐 ${project.landArea}`,
                project.handoverDate && `🗓️ ${new Date(project.handoverDate).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' })}`,
              ].filter(Boolean).map((info: any, i) => (
                <span key={i} style={{ background: 'var(--green-light)', color: 'var(--green-deep)', fontSize: '0.78rem', fontWeight: 600, padding: '5px 12px', borderRadius: 99 }}>
                  {info}
                </span>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '2px solid var(--border)', marginBottom: 20 }}>
              {[
                { id: 'overview', label: '📋 বিবরণ' },
                { id: 'units', label: `🏠 Unit (${project.units?.length || 0})` },
                { id: 'amenities', label: '✨ সুবিধা' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
                  padding: '10px 18px', border: 'none', background: 'none',
                  fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', fontFamily: 'inherit',
                  color: activeTab === tab.id ? 'var(--green-deep)' : 'var(--text-secondary)',
                  borderBottom: `2px solid ${activeTab === tab.id ? 'var(--green-deep)' : 'transparent'}`,
                  marginBottom: -2,
                }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                  {project.description}
                </p>
                {project.floorPlan && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Floor Plan</div>
                    <img src={project.floorPlan} alt="Floor Plan"
                      style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'units' && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
                {/* Unit Summary */}
                {unitSummary?.length > 0 && (
                  <div style={{ padding: '14px 18px', background: 'var(--green-light)', borderBottom: '1px solid rgba(22,106,71,0.15)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--green-deep)', marginBottom: 10 }}>Unit সারসংক্ষেপ</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
                      {unitSummary.map((s: any) => (
                        <div key={s.type} style={{ background: 'white', borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 3 }}>{s.type}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            {s.available}/{s.total} available
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--green-deep)', fontWeight: 600, marginTop: 3 }}>
                            ৳{Number(s.minPrice).toLocaleString()}
                            {s.maxPrice !== s.minPrice && ` — ৳${Number(s.maxPrice).toLocaleString()}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Unit list */}
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface)' }}>
                      {['Unit Type', 'তলা', 'আয়তন', 'মূল্য', 'অবস্থা'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {project.units?.map((unit: any) => {
                      const us = UNIT_STATUS[unit.status] || UNIT_STATUS.AVAILABLE
                      return (
                        <tr key={unit.id} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 700, fontSize: '0.88rem' }}>{unit.unitType}</td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {unit.floor ? `${unit.floor} তলা` : '—'}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {unit.size} বর্গফুট
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--green-deep)', fontWeight: 700, fontSize: '0.88rem' }}>
                            ৳ {Number(unit.price).toLocaleString('bn-BD')}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span style={{ background: `${us.color}18`, color: us.color, fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>
                              {us.label}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'amenities' && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 20 }}>
                {amenities.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                    {amenities.map((a: string, i: number) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: 'var(--green-light)', borderRadius: 8 }}>
                        <span style={{ color: 'var(--green-deep)', fontWeight: 700 }}>✓</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{a}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                    কোনো amenity যোগ করা হয়নি
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Contact + Price card */}
          <div className="detail-contact-card" style={{ position: 'sticky', top: 72 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>

              {/* Price range */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 3 }}>মূল্য সীমা</div>
                <div className="price-tag" style={{ fontSize: '1.3rem' }}>
                  ৳ {Number(project.minPrice).toLocaleString('bn-BD')}
                </div>
                {Number(project.maxPrice) > Number(project.minPrice) && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    থেকে ৳ {Number(project.maxPrice).toLocaleString('bn-BD')}
                  </div>
                )}
                {project.pricePerSqft && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
                    ৳{Number(project.pricePerSqft).toLocaleString()}/বর্গফুট
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: 'var(--border)', marginBottom: 14 }} />

              {/* Developer info */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 4 }}>
                  {project.construction?.companyName}
                </div>
                {project.construction?.experience && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {project.construction.experience} বছরের অভিজ্ঞতা
                  </div>
                )}
              </div>

              {/* Unit availability */}
              <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>মোট unit</span>
                  <span style={{ fontWeight: 700 }}>{project.totalUnits}টি</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginTop: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Available</span>
                  <span style={{ fontWeight: 700, color: 'var(--green-deep)' }}>{project.availableUnits}টি</span>
                </div>
                {project.handoverDate && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginTop: 4 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>হস্তান্তর</span>
                    <span style={{ fontWeight: 600 }}>
                      {new Date(project.handoverDate).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short' })}
                    </span>
                  </div>
                )}
              </div>

              {/* Contact */}
              {contactPhone ? (
                <>
                  <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 12, textAlign: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 3 }}>Developer-এর নম্বর</div>
                    <a href={`tel:${contactPhone}`} style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--green-deep)', textDecoration: 'none' }}>
                      📞 {contactPhone}
                    </a>
                  </div>
                  <a href={`tel:${contactPhone}`} className="btn-primary"
                    style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none', marginBottom: 8 }}>
                    📞 কল করুন
                  </a>
                  <a href={waLink} target="_blank" rel="noopener" style={{
                    display: 'flex', justifyContent: 'center', padding: '10px', borderRadius: 8,
                    textDecoration: 'none', background: '#25D366', color: 'white', fontWeight: 600, fontSize: '0.88rem',
                    marginBottom: 10,
                  }}>
                    💬 WhatsApp করুন
                  </a>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '12px', background: 'var(--surface-2)', borderRadius: 10, color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 10 }}>
                  নম্বর পাওয়া যায়নি
                </div>
              )}

              <Link href={`/construction/${project.constructionId}`}
                style={{ display: 'block', textAlign: 'center', color: 'var(--green-deep)', fontWeight: 600, textDecoration: 'none', fontSize: '0.82rem' }}>
                Developer profile দেখুন →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
