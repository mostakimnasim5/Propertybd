'use client'
import Link from 'next/link'

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  UPCOMING:  { label: '🔜 শীঘ্রই', color: '#1D4ED8', bg: '#DBEAFE' },
  ONGOING:   { label: '🏗️ নির্মাণাধীন', color: '#D97706', bg: '#FEF3C7' },
  READY:     { label: '✅ রেডি', color: '#166A47', bg: '#D1FAE5' },
  COMPLETED: { label: '🏁 সম্পন্ন', color: '#6B7280', bg: '#F3F4F6' },
}

const TYPE_LABEL: Record<string, string> = {
  RESIDENTIAL: '🏠 আবাসিক',
  COMMERCIAL: '🏢 বাণিজ্যিক',
  MIXED: '🏙️ মিশ্র',
}

interface Props {
  project: any
}

export default function ProjectCard({ project }: Props) {
  const img = project.images?.[0]?.url || null
  const status = STATUS_BADGE[project.status] || STATUS_BADGE.ONGOING

  return (
    <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="card" style={{ cursor: 'pointer' }}>
        {/* Cover image */}
        <div style={{ position: 'relative', paddingTop: '58%', background: 'linear-gradient(135deg, var(--green-light), #d1e8da)', overflow: 'hidden' }}>
          {img ? (
            <img src={img} alt={project.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🏗️</div>
          )}

          {/* Badges */}
          <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ background: status.bg, color: status.color, fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
              {status.label}
            </span>
            {project.isFeatured && (
              <span className="badge-featured">⭐ ফিচার্ড</span>
            )}
          </div>

          {/* Unit count */}
          <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.65)', color: 'white', fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 99, backdropFilter: 'blur(4px)' }}>
            {project.availableUnits}/{project.totalUnits} unit available
          </div>
        </div>

        <div style={{ padding: '14px 16px' }}>
          {/* Type + verified */}
          <div style={{ display: 'flex', gap: 5, marginBottom: 7 }}>
            <span style={{ background: 'var(--green-light)', color: 'var(--green-deep)', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>
              {TYPE_LABEL[project.projectType] || project.projectType}
            </span>
            {project.isVerified && (
              <span className="badge-verified">✓ যাচাই</span>
            )}
          </div>

          {/* Title */}
          <div style={{
            fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.35, marginBottom: 4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{project.title}</div>

          {/* Developer name */}
          {project.construction?.companyName && (
            <div style={{ fontSize: '0.75rem', color: 'var(--green-deep)', fontWeight: 600, marginBottom: 4 }}>
              🏢 {project.construction.companyName}
            </div>
          )}

          {/* Location */}
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 10 }}>
            📍 {project.areaName ? `${project.areaName}, ` : ''}{project.district?.nameBn}
          </div>

          {/* Handover date */}
          {project.handoverDate && (
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
              🗓️ হস্তান্তর: {new Date(project.handoverDate).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long' })}
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div className="price-tag" style={{ fontSize: '0.95rem' }}>
                ৳ {Number(project.minPrice).toLocaleString('bn-BD')}
                {Number(project.maxPrice) > Number(project.minPrice) && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>
                    {' '}— {Number(project.maxPrice).toLocaleString('bn-BD')}
                  </span>
                )}
              </div>
              {project.pricePerSqft && (
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  ৳{Number(project.pricePerSqft).toLocaleString()}/বর্গফুট
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
