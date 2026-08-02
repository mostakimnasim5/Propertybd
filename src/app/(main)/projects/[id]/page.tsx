'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'

const UNIT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'পাওয়া যাচ্ছে', color: '#166A47', bg: '#D1FAE5' },
  BOOKED: { label: 'বুকড', color: '#D97706', bg: '#FEF3C7' },
  SOLD: { label: 'বিক্রিত', color: '#6B7280', bg: '#F3F4F6' },
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [activeFloor, setActiveFloor] = useState<string | null>(null)

  useEffect(() => {
    axios.get(`/api/projects/${id}`)
      .then(r => {
        setData(r.data.data)
        const floors = Object.keys(r.data.data.unitsByFloor || {})
        if (floors.length > 0) setActiveFloor(floors[0])
      })
      .catch(() => toast.error('প্রজেক্ট পাওয়া যায়নি'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ লোড হচ্ছে...</div>
  if (!data) return (
    <div style={{ padding: '80px 0', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem' }}>😕</div>
      <Link href="/projects" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex', textDecoration: 'none' }}>প্রজেক্ট দেখুন</Link>
    </div>
  )

  const { project, unitsByFloor, stats } = data
  const floors = Object.keys(unitsByFloor || {})
  const activeUnits = activeFloor ? unitsByFloor[activeFloor] || [] : []
  const waLink = project.owner?.phone
    ? `https://wa.me/${project.owner.phone.startsWith('0') ? '88' + project.owner.phone : project.owner.phone}?text=${encodeURIComponent(`PropertyBD থেকে "${project.projectName}" সম্পর্কে জানতে চাই।`)}`
    : '#'

  return (
    <div style={{ padding: '24px 0' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>হোম</Link> →{' '}
          <Link href="/projects" style={{ color: 'inherit', textDecoration: 'none' }}>প্রজেক্ট</Link> → {project.projectName}
        </div>

        <div className="detail-layout">
          {/* Left */}
          <div>
            {/* Images */}
            {project.images?.length > 0 && (
              <>
                <div style={{ borderRadius: 14, overflow: 'hidden', paddingTop: '55%', position: 'relative', background: 'var(--surface-2)', marginBottom: 10 }}>
                  <img src={project.images[activeImg]?.url} alt={project.projectName}
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  {project.isFeatured && <span className="badge-featured" style={{ position: 'absolute', top: 10, left: 10 }}>⭐ ফিচার্ড</span>}
                </div>
                {project.images.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto' }}>
                    {project.images.map((img: any, i: number) => (
                      <button key={i} onClick={() => setActiveImg(i)} style={{
                        width: 68, height: 52, flexShrink: 0, borderRadius: 8, overflow: 'hidden',
                        padding: 0, cursor: 'pointer', background: 'none',
                        border: `2.5px solid ${i === activeImg ? 'var(--green-deep)' : 'transparent'}`,
                      }}>
                        <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Title */}
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>{project.companyName}</div>
            <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.6rem)', fontWeight: 800, marginBottom: 8 }}>{project.projectName}</h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
              📍 {project.areaName ? `${project.areaName}, ` : ''}{project.district?.nameBn}
              {project.handoverDate && ` • হস্তান্তর: ${new Date(project.handoverDate).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' })}`}
              <span style={{ marginLeft: 12 }}>👁️ {project.viewCount} বার দেখা</span>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'মোট unit', value: project.totalUnits, color: 'var(--green-deep)', bg: 'var(--green-light)' },
                { label: 'পাওয়া যাচ্ছে', value: stats.available, color: '#166A47', bg: '#D1FAE5' },
                { label: 'বিক্রিত', value: stats.sold, color: '#6B7280', bg: '#F3F4F6' },
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 18, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 10 }}>প্রজেক্ট সম্পর্কে</div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, fontSize: '0.95rem' }}>{project.description}</p>
            </div>

            {/* Amenities */}
            {project.amenities?.length > 0 && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 18, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>সুযোগ-সুবিধা</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {project.amenities.map((a: string) => (
                    <span key={a} style={{ background: 'var(--green-light)', color: 'var(--green-deep)', padding: '5px 12px', borderRadius: 99, fontSize: '0.82rem', fontWeight: 600 }}>
                      ✓ {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Floor plan */}
            {project.floorPlan && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 18, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 12 }}>ফ্লোর প্ল্যান</div>
                <img src={project.floorPlan} alt="Floor plan" style={{ width: '100%', borderRadius: 8, border: '1px solid var(--border)' }} />
              </div>
            )}

            {/* Units by floor */}
            {floors.length > 0 && (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', padding: 18 }}>
                <div style={{ fontWeight: 700, marginBottom: 14 }}>Unit বিবরণ</div>

                {/* Floor tabs */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
                  {floors.map(floor => (
                    <button key={floor} onClick={() => setActiveFloor(floor)} style={{
                      padding: '7px 14px', border: 'none', background: 'none',
                      fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
                      color: activeFloor === floor ? 'var(--green-deep)' : 'var(--text-secondary)',
                      borderBottom: `2px solid ${activeFloor === floor ? 'var(--green-deep)' : 'transparent'}`,
                      marginBottom: -2,
                    }}>{floor}</button>
                  ))}
                </div>

                {/* Units table */}
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                        {['Unit', 'আয়তন', 'বেড', 'দাম', 'অবস্থা'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeUnits.map((unit: any) => {
                        const cfg = UNIT_STATUS_CONFIG[unit.status]
                        return (
                          <tr key={unit.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px 12px', fontWeight: 700 }}>{unit.unitNumber}</td>
                            <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{unit.size} বর্গফুট</td>
                            <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{unit.bedrooms ? `${unit.bedrooms} রুম` : '—'}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--green-deep)' }}>
                              ৳ {Number(unit.price).toLocaleString('bn-BD')}
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{ background: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
                                {cfg.label}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Right: Contact card */}
          <div className="detail-contact-card" style={{ position: 'sticky', top: 72 }}>
            <div style={{ background: 'white', borderRadius: 16, border: '1px solid var(--border)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>দাম শুরু</div>
                <div className="price-tag" style={{ fontSize: '1.5rem' }}>
                  ৳ {Number(project.minPrice).toLocaleString('bn-BD')}
                </div>
                {Number(project.maxPrice) > Number(project.minPrice) && (
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    সর্বোচ্চ ৳ {Number(project.maxPrice).toLocaleString('bn-BD')}
                  </div>
                )}
                {project.pricePerSqft && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    প্রতি বর্গফুট ৳ {Number(project.pricePerSqft).toLocaleString('bn-BD')}
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />

              {/* Developer info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--green-deep)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                  {(project.companyName || 'D')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{project.companyName}</div>
                  {project.owner?.nidVerified && <span className="badge-verified">✓ যাচাইকৃত</span>}
                </div>
              </div>

              {/* Direct contact */}
              {project.owner?.phone && (
                <>
                  <div style={{ background: 'var(--green-light)', borderRadius: 10, padding: 12, textAlign: 'center', marginBottom: 10 }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 3 }}>যোগাযোগ নম্বর</div>
                    <a href={`tel:${project.owner.phone}`} style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--green-deep)', textDecoration: 'none' }}>
                      📞 {project.owner.phone}
                    </a>
                  </div>
                  <a href={`tel:${project.owner.phone}`} className="btn-primary" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none', marginBottom: 8 }}>
                    📞 কল করুন
                  </a>
                  <a href={waLink} target="_blank" rel="noopener" style={{ display: 'flex', justifyContent: 'center', padding: '10px', borderRadius: 8, textDecoration: 'none', background: '#25D366', color: 'white', fontWeight: 600, fontSize: '0.88rem' }}>
                    💬 WhatsApp করুন
                  </a>
                </>
              )}

              {/* Available units info */}
              <div style={{ marginTop: 14, background: 'var(--surface)', borderRadius: 8, padding: 10, fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                {stats.available} টি unit এখনো পাওয়া যাচ্ছে
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
