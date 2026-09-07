'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { formatDate } from '@/lib/constants';

export default function AdminUsersPage() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  async function fetchUsers(page = 1) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Kullanıcı yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        addToast(`Kullanıcı rolü "${newRole}" olarak güncellendi`, 'success');
        fetchUsers(pagination.page);
      } else {
        addToast('Rol güncellenemedi', 'error');
      }
    } catch (error) {
      addToast('Bir hata oluştu', 'error');
    }
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="admin-toolbar">
        <form onSubmit={handleSearch} className="admin-toolbar__search">
          <input
            type="text"
            placeholder="İsim veya e-posta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input"
          />
          <button type="submit" className="btn btn--primary btn--sm">Ara</button>
        </form>
        <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-gray-400)' }}>
          Toplam {pagination.total} kullanıcı
        </span>
      </div>

      {/* Kullanıcı Tablosu */}
      {loading ? (
        <div className="admin-loading"><div className="loader" /></div>
      ) : (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>İsim</th>
                  <th>E-posta</th>
                  <th>Telefon</th>
                  <th>Rol</th>
                  <th>Kayıt Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          background: user.role === 'admin'
                            ? 'linear-gradient(135deg, #667eea, #764ba2)'
                            : 'linear-gradient(135deg, #4facfe, #00f2fe)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 14,
                        }}>
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || '—'}</td>
                    <td>
                      <span className={`admin-badge ${user.role === 'admin' ? 'admin-badge--admin' : 'admin-badge--user'}`}>
                        {user.role === 'admin' ? '👑 Admin' : '👤 Kullanıcı'}
                      </span>
                    </td>
                    <td className="admin-table__date">{formatDate(user.createdAt)}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className="admin-select admin-select--sm"
                      >
                        <option value="user">Kullanıcı</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                      Kullanıcı bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Sayfalama */}
          {pagination.pages > 1 && (
            <div className="admin-pagination">
              <div className="admin-pagination__buttons">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => fetchUsers(p)}
                    className={`admin-pagination__btn ${p === pagination.page ? 'admin-pagination__btn--active' : ''}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
