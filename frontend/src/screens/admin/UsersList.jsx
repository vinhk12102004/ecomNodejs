import { useEffect, useState } from 'react';
import { adminListUsers, adminUpdateUser } from '../../lib/api';
import Pagination from '../../components/Pagination';

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', role: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [meta.page]);

  const loadUsers = async () => {
    let mounted = true;
    setLoading(true);
    setError('');
    try {
      const result = await adminListUsers({ page: meta.page, limit: 20 });
      if (mounted) {
        setUsers(result.data || []);
        setMeta({
          page: result.page || 1,
          limit: result.limit || 20,
          total: result.total || 0,
          pages: result.pages || 0
        });
      }
    } catch (e) {
      if (mounted) setError(e.response?.data?.message || 'Không thể tải người dùng');
    } finally {
      if (mounted) setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setFormData({ name: user.name || '', role: user.role || 'customer' });
  };

  const handleSubmit = async () => {
    if (!editingId) return;
    setSubmitting(true);
    try {
      await adminUpdateUser(editingId, formData);
      await loadUsers();
      setEditingId(null);
      setFormData({ name: '', role: '' });
      alert('Cập nhật thành công');
    } catch (e) {
      alert(e.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Người dùng</h1>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-600">Đang tải...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white border rounded-lg p-12 text-center">
          <p className="text-slate-500">Chưa có người dùng nào</p>
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Tên</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Vai trò</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Ngày tạo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        {editingId === user._id ? (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="px-2 py-1 border rounded"
                          />
                        ) : (
                          user.name || '-'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === user._id ? (
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="px-2 py-1 border rounded"
                          >
                            <option value="customer">customer</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 text-xs rounded ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {user.role}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === user._id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={handleSubmit}
                              disabled={submitting}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              {submitting ? 'Đang lưu...' : 'Lưu'}
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setFormData({ name: '', role: '' });
                              }}
                              className="px-3 py-1 text-xs border rounded hover:bg-slate-50"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(user)}
                            className="px-3 py-1 text-xs border rounded hover:bg-slate-50"
                          >
                            Sửa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {meta.pages > 1 && (
            <div className="flex justify-center">
              <Pagination
                total={meta.total}
                page={meta.page}
                limit={meta.limit}
                onPage={(page) => setMeta(prev => ({ ...prev, page }))}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

