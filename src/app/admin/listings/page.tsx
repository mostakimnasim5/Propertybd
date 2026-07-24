'use client'
import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const STATUSES = [
  { id: 'PENDING', label: '⏳ অনুমোদন বাকি' },
  { id: 'ACTIVE', label: '✅ সক্রিয়' },
  { id: 'REJECTED', label: '❌ বাতিল' },
]
const CATEGORIES = [
  { id: 'property', label: '🏠 প্রপার্টি' },
  { id: 'vehicle', label: '🚗 গাড়ি' },
  { id: 'construction', label: '🏗️ নির্মাণ' },
]

export default function AdminListingsPage() {
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('PENDING')
  const [category, setCategory] = useState('property')
  const [page, setPage] = useState(1)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/admin/listings?status=${status}&category=${category}&page=${page}`)
      setItems(res.data.data.items)
      setTotal(res.data.data.total)
    } catch { toast.error('লোড হয়নি') }
    finally { setLoading(false) }
  }, [status, category, page])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleAction = async (id: string, action: string) => {
    setActionLoading(id + action)
    try {
      await axios.patch(`/api/admin/listings/${id}`, { action, category })
      toast.success(action === 'approve' ? '✅ অনুমোদিত হয়েছে' : action === 'reject' ? '❌ বাতিল হয়েছে' : '⭐ আপডেট হয়েছে')
      fetchItems()
    } catch { toast.error('সমস্যা হয়েছে') }
    finally { setActionLoading(null) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>বিজ্ঞাপন ব্যবস্থাপনা</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>মোট: {total}টি</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => { setCategory(c.id); setPage(1) }} style={{
            padding: '7px 14px', borderRadius: 8, fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
            border: `1.5px solid ${category === c.id ? 'var(--green-deep)' : 'var(--border)'}`,
            background: category === c.id ? 'var(--green-light)' : 'white',
            color: category === c.id ? 'var(--green-deep)' : 'var(--text-secondary)',
          }}>{c.label}</button>
        ))}
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        {STATUSES.map(s => (
          <button key={s.id} onClick={() => { setStatus(s.id); setPage(1) }} style={{
            padding: '7px 14px', borderRadius: 8, fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
            border: `1.5px solid ${status === s.id ? 'var(--green-deep)' : 'var(--border)'}`,
            background: status === s.id ? 'var(--green-deep)' : 'white',
            color: status === s.id ? 'white' : 'var(--text-secondary)',
          }}>{s.label}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ লোড হচ্ছে...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 10 }}>📭</div>
            <div>কোনো বিজ্ঞাপন নেই</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['ছবি', 'বিজ্ঞাপন', 'মালিক', 'তারিখ', 'অ্যাকশন'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => {
                const img = item.images?.[0]?.url || null
                const title = item.title || item.companyName || `${item.brand} ${item.model}`
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ width: 52, height: 40, borderRadius: 6, background: 'var(--surface-2)', overflow: 'hidden' }}>
                        {img && <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', maxWidth: 280 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {item.district?.name}</div>
                      {item.price && <div style={{ fontSize: '0.8rem', color: 'var(--green-deep)', fontWeight: 700 }}>৳ {Number(item.price).toLocaleString()}</div>}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.owner?.name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.owner?.phone}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(item.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {status === 'PENDING' && (
                          <>
                            <button onClick={() => handleAction(item.id, 'approve')}
                              disabled={actionLoading === item.id + 'approve'}
                              style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: 'var(--green-deep)', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem' }}>
                              {actionLoading === item.id + 'approve' ? '...' : '✅ অনুমোদন'}
                            </button>
                            <button onClick={() => handleAction(item.id, 'reject')}
                              disabled={actionLoading === item.id + 'reject'}
                              style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#DC2626', color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem' }}>
                              {actionLoading === item.id + 'reject' ? '...' : '❌ বাতিল'}
                            </button>
                          </>
                        )}
                        {status === 'ACTIVE' && (
                          <>
                            <button onClick={() => handleAction(item.id, item.isFeatured ? 'unfeature' : 'feature')}
                              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)', background: item.isFeatured ? 'var(--amber-light)' : 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem', color: item.isFeatured ? '#92400E' : 'var(--text-secondary)' }}>
                              {item.isFeatured ? '★ আনফিচার' : '⭐ ফিচার'}
                            </button>
                            <button onClick={() => handleAction(item.id, 'reject')}
                              style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: '#FEE2E2', color: '#DC2626', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.78rem' }}>
                              সরান
                            </button>
                          </>
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
            className="btn-outline" style={{ padding: '8px 16px' }}>← আগে</button>
          <span style={{ padding: '8px 14px', fontWeight: 700 }}>{page} / {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)}
            className="btn-outline" style={{ padding: '8px 16px' }}>পরে →</button>
        </div>
      )}
    </div>
  )
}
