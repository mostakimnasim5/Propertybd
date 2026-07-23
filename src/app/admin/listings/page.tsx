'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['PENDING', 'ACTIVE', 'REJECTED']
const STATUS_LABELS: Record<string, string> = { PENDING: 'অপেক্ষমাণ', ACTIVE: 'সক্রিয়', REJECTED: 'বাতিল' }
const STATUS_COLORS: Record<string, string> = { PENDING: '#D97706', ACTIVE: '#166A47', REJECTED: '#DC2626' }

export default function AdminListingsPage() {
  const searchParams = useSearchParams()
  const [category, setCategory] = useState(searchParams.get('category') || 'property')
  const [status, setStatus] = useState(searchParams.get('status') || 'PENDING')
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [acting, setActing] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/admin/listings?category=${category}&status=${status}&page=${page}`)
      setItems(res.data.data.items)
      setTotal(res.data.data.total)
    } catch { setItems([]) }
    finally { setLoading(false) }
  }, [category, status, page])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleAction = async (id: string, action: string) => {
    setActing(id + action)
    try {
      await axios.patch('/api/admin/listings', { id, category, action })
      toast.success('আপডেট সফল')
      fetchItems()
    } catch { toast.error('সমস্যা হয়েছে') }
    finally { setActing(null) }
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>🏠 বিজ্ঞাপন ব্যবস্থাপনা</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>মোট: {total} টি</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Category */}
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'property', label: '🏠 প্রপার্টি' },
            { id: 'vehicle', label: '🚗 গাড়ি' },
            { id: 'construction', label: '🏗️ নির্মাণ' },
          ].map(c => (
            <button key={c.id} onClick={() => { setCategory(c.id); setPage(1) }} style={{
              padding: '7px 14px', border: `2px solid ${category === c.id ? 'var(--green-deep)' : 'var(--border)'}`,
              borderRadius: 8, background: category === c.id ? 'var(--green-deep)' : 'white',
              color: category === c.id ? 'white' : 'var(--text-secondary)',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
            }}>{c.label}</button>
          ))}
        </div>

        <div style={{ width: 1, background: 'var(--border)' }} />

        {/* Status */}
        <div style={{ display: 'flex', gap: 6 }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1) }} style={{
              padding: '7px 14px', border: `2px solid ${status === s ? STATUS_COLORS[s] : 'var(--border)'}`,
              borderRadius: 8, background: status === s ? `${STATUS_COLORS[s]}15` : 'white',
              color: status === s ? STATUS_COLORS[s] : 'var(--text-secondary)',
              fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem',
            }}>{STATUS_LABELS[s]}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ লোড হচ্ছে...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
            <div>কোনো বিজ্ঞাপন নেই</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['ছবি', 'শিরোনাম', 'মালিক', 'জেলা', 'তারিখ', 'অ্যাকশন'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => {
                const img = item.images?.[0]?.url || null
                const title = item.title || item.companyName || `${item.brand} ${item.model}`
                const isActing = acting?.startsWith(item.id)
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ width: 60, height: 44, borderRadius: 6, background: 'var(--surface-2)', overflow: 'hidden' }}>
                        {img ? <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> :
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏠</div>}
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', maxWidth: 240 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
                      {item.price && <div style={{ fontSize: '0.78rem', color: 'var(--green-deep)', fontWeight: 700 }}>৳ {Number(item.price).toLocaleString()}</div>}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '0.82rem' }}>
                      <div style={{ fontWeight: 600 }}>{item.owner?.name || '—'}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{item.owner?.phone}</div>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{item.district?.name}</td>
                    <td style={{ padding: '10px 14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(item.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {status === 'PENDING' && (
                          <>
                            <button onClick={() => handleAction(item.id, 'approve')} disabled={!!isActing} style={{
                              padding: '5px 10px', background: '#DCFCE7', color: '#166A47',
                              border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer',
                              fontFamily: 'inherit', fontSize: '0.78rem',
                            }}>✅ অনুমোদন</button>
                            <button onClick={() => handleAction(item.id, 'reject')} disabled={!!isActing} style={{
                              padding: '5px 10px', background: '#FEE2E2', color: '#DC2626',
                              border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer',
                              fontFamily: 'inherit', fontSize: '0.78rem',
                            }}>❌ বাতিল</button>
                          </>
                        )}
                        {status === 'ACTIVE' && (
                          <>
                            <button onClick={() => handleAction(item.id, item.isFeatured ? 'unfeature' : 'feature')} disabled={!!isActing} style={{
                              padding: '5px 10px', background: item.isFeatured ? '#FEF3C7' : 'var(--amber-light)',
                              color: '#92400E', border: 'none', borderRadius: 6, fontWeight: 700,
                              cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem',
                            }}>{item.isFeatured ? '⭐ আনফিচার' : '⭐ ফিচার'}</button>
                            <button onClick={() => handleAction(item.id, 'reject')} disabled={!!isActing} style={{
                              padding: '5px 10px', background: '#FEE2E2', color: '#DC2626',
                              border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer',
                              fontFamily: 'inherit', fontSize: '0.78rem',
                            }}>❌ বাতিল</button>
                          </>
                        )}
                        {status === 'REJECTED' && (
                          <button onClick={() => handleAction(item.id, 'approve')} disabled={!!isActing} style={{
                            padding: '5px 10px', background: '#DCFCE7', color: '#166A47',
                            border: 'none', borderRadius: 6, fontWeight: 700, cursor: 'pointer',
                            fontFamily: 'inherit', fontSize: '0.78rem',
                          }}>↩️ পুনরুদ্ধার</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>← আগে</button>
          <span style={{ padding: '8px 16px', fontWeight: 700 }}>{page} / {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>পরে →</button>
        </div>
      )}
    </div>
  )
}
