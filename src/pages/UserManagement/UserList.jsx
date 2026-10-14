import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { userApi, rolesApi } from '../../api/index.js'
import {
  ActionMenu,
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  PageHeader,
  Pagination,
  TableSkeleton,
  inputClass,
  toolbarClass,
  toolbarFieldClass,
  toolbarSearchClass,
} from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { errorMessage } from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'

export default function UserList() {
  const { can } = useAuth()
  const [data, setData] = useState({ data: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [roles, setRoles] = useState([])

  const [resetUser, setResetUser] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetConfirm, setResetConfirm] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [deleteUser, setDeleteUser] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    rolesApi.list({ limit: 100 }).then((res) => setRoles(res.data)).catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    const params = { search: search || undefined, page, limit: 10 }
    if (filterRole) params.role_id = filterRole
    if (filterStatus) params.status = filterStatus
    userApi
      .list(params)
      .then((res) => setData(res))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, page, filterRole, filterStatus])

  useEffect(() => {
    load()
  }, [load])

  const handleToggleStatus = async (user) => {
    try {
      await userApi.updateStatus(user.id, { status: !user.status })
      toast.success('Status pengguna diperbarui')
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    }
  }

  const openResetPassword = (user) => {
    setResetUser(user)
    setResetPassword('')
    setResetConfirm('')
    setResetError('')
  }

  const handleResetPassword = async () => {
    setResetError('')
    if (resetPassword.length < 8) {
      setResetError('Password minimal 8 karakter')
      return
    }
    if (resetPassword !== resetConfirm) {
      setResetError('Konfirmasi password tidak cocok')
      return
    }
    setResetLoading(true)
    try {
      await userApi.resetPassword(resetUser.id, {
        new_password: resetPassword,
        confirm_password: resetConfirm,
      })
      toast.success(`Password ${resetUser.username} berhasil direset`)
      setResetUser(null)
    } catch (err) {
      setResetError(errorMessage(err))
    } finally {
      setResetLoading(false)
    }
  }

  const submitSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteUser) return
    setDeleting(true)
    try {
      await userApi.remove(deleteUser.id)
      toast.success('Pengguna berhasil dihapus')
      setDeleteUser(null)
      load()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader title="Manajemen Pengguna" description="Kelola akun pengguna sistem">
        <PermissionGate permission="user:create">
          <Link to="/user-management/baru">
            <Button>Tambah Pengguna</Button>
          </Link>
        </PermissionGate>
      </PageHeader>

      <Card>
        <div className="border-b border-slate-100 p-4">
          <form onSubmit={submitSearch} className={toolbarClass}>
            <input
              className={toolbarSearchClass}
              placeholder="Cari nama, username, jabatan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary" type="submit">
              Cari
            </Button>
            <select
              className={toolbarFieldClass}
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setPage(1) }}
            >
              <option value="">Semua Role</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.nama}</option>
              ))}
            </select>
            <select
              className={toolbarFieldClass}
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </form>
        </div>

        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {loading ? (
          <TableSkeleton cols={7} />
        ) : data.data.length === 0 ? (
          <EmptyState message="Belum ada pengguna." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Jabatan</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Terakhir Login</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.username}</td>
                      <td className="px-4 py-3 text-slate-600">{item.jabatan || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant="blue">{item.role_nama}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={item.status ? 'green' : 'slate'}>
                          {item.status ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.last_login
                          ? new Date(item.last_login).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <ActionMenu
                            items={[
                              can('user:update') && { label: 'Ubah', to: `/user-management/${item.id}/edit` },
                              can('user:update') && { label: 'Reset Password', onClick: () => openResetPassword(item) },
                              can('user:update') && { label: item.status ? 'Nonaktifkan' : 'Aktifkan', onClick: () => handleToggleStatus(item), danger: item.status },
                              can('user:delete') && { label: 'Hapus', onClick: () => setDeleteUser(item), danger: true },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={data.pagination.page}
              totalPage={data.pagination.total_page}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Reset Password</h3>
            <p className="mt-2 text-sm text-slate-600">
              Reset password untuk <strong>{resetUser.username}</strong>
            </p>
            {resetError && (
              <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{resetError}</div>
            )}
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password Baru</label>
                <input
                  type="password"
                  className={inputClass}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Konfirmasi Password</label>
                <input
                  type="password"
                  className={inputClass}
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                  placeholder="Ulangi password baru"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setResetUser(null)} disabled={resetLoading}>
                Batal
              </Button>
              <Button onClick={handleResetPassword} disabled={resetLoading}>
                {resetLoading ? 'Menyimpan...' : 'Reset Password'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteUser}
        title="Hapus Pengguna"
        message={`Yakin ingin menghapus pengguna "${deleteUser?.username}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteUser(null)}
        loading={deleting}
      />
    </div>
  )
}
