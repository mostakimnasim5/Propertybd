'use client'
import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const ROLES = ['', 'BUYER', 'OWNER', 'BROKER', 'BUILDER', 'ADMIN']
const ROLE_LABELS: Record<string, string> = { BUYER: 'ক্রেতা', OWNER: 'মালিক', BROKER: 'ব্রোকার', BUILDER: 'বিল্ডার', ADMIN: 'অ্যাডমিন' }
const ROLE_COLORS: Record<string, string> = { BUYER: '#6B7280', OWNER: '#166A47', BROKER: '#3B82F6', BUILDER: '#8B5CF6', ADMIN: '#DC2626' }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const [acting, setActing] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString() })
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      const res = await axios.get(`/api/admin/users?${params}`)
      setUsers(res.data.data.users)
      setTotal(res.data.data.total)
    } catch { setUsers([]) }
    finally { setLoading(false) }
  }, [search, roleFilter, page])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleRoleChange = async (userId: string, role: string) => {
    setActing(userId)
    try {
      await axios.patch('/api/admin/users', { userId, role })
      toast.success('Role আপডেট হয়েছে')
      fetchUsers()
    } catch { toast.error('সমস্যা হয়েছে') }
    finally { setActing(null) }
  }

  const handleNidToggle = async (userId: string, current: boolean) => {
    setActing(userId + 'nid')
    try {
      await axios.patch('/api/admin/users', { userId, nidVerified: !current })
      toast.success(!current ? 'NID যাচাই করা হয়েছে' : 'NID যাচাই সরানো হয়েছে')
      fetchUsers()
    } catch { toast.error('সমস্যা হয়েছে') }
    finally { setActing(null) }
  }

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>👥 ব্যবহারকারী ব্যবস্থাপনা</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>মোট: {total} জন</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <input placeholder="নাম, ফোন বা ইমেইল দিয়ে খুঁজুন..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }} style={{ width: 160 }}>
          <option value="">সব Role</option>
          {ROLES.filter(r => r).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>⏳ লোড হচ্ছে...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👥</div>
            <div>কোনো ব্যবহারকারী পাওয়া যায়নি</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                {['নাম', 'ফোন', 'বিজ্ঞাপন', 'Role', 'NID', 'যোগদান', 'অ্যাকশন'].map(h => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'var(--green-deep)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
                      }}>
                        {(user.name || user.phone || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{user.name || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.85rem' }}>{user.phone}</td>
                  <td style={{ padding: '12px 14px', fontSize: '0.85rem', textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--green-deep)' }}>{(user._count?.listings || 0) + (user._count?.vehicles || 0)}</span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value)}
                      disabled={acting === user.id}
                      style={{
                        padding: '4px 8px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700,
                        border: `1.5px solid ${ROLE_COLORS[user.role]}`,
                        color: ROLE_COLORS[user.role], background: `${ROLE_COLORS[user.role]}10`,
                        width: 'auto',
                      }}>
                      {ROLES.filter(r => r).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => handleNidToggle(user.id, user.nidVerified)}
                      disabled={acting === user.id + 'nid'}
                      style={{
                        padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        fontWeight: 700, fontSize: '0.78rem', fontFamily: 'inherit',
                        background: user.nidVerified ? '#DCFCE7' : '#F3F4F6',
                        color: user.nidVerified ? '#166A47' : '#6B7280',
                      }}>
                      {user.nidVerified ? '✓ যাচাই' : 'যাচাই নেই'}
                    </button>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <a href={`tel:${user.phone}`} style={{ fontSize: '0.8rem', color: 'var(--green-deep)', fontWeight: 600, textDecoration: 'none' }}>
                      📞 কল
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
