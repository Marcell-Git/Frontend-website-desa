import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { rolesApi } from '../../api/index.js'
import { Badge, Button, Card, ConfirmModal, EmptyState, PageHeader, Pagination, Spinner, inputClass } from '../../components/ui.jsx'
import { PermissionGate } from '../../components/ProtectedRoute.jsx'
import { errorMessage } from '../../api/client.js'
import { useAuth } from '../../auth/AuthContext.jsx'

export default function RoleList() {
  const { can } = useAuth()
  const [data, setData] = useState({ data: [], pagination: {} })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    rolesApi
      .list({ search: search || undefined, page, limit: 10 })
      .then((res) => setData(res))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [search, page])

  useEffect(() => {
    load()
  }, [load])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await rolesApi.remove(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const submitSearch = (e) => {
    e.preventDefault()
    setPage(1)
  }

  return (
    <div>
      <PageHeader title="Manajemen Role" description="Kelola role dan akses pengguna">
        <PermissionGate permission="role:create">
          <Link to="/role-management/baru">
            <Button>Tambah Role</Button>
          </Link>
        </PermissionGate>
      </PageHeader>

      <Card>
        <div className="border-b border-slate-200 p-4">
          <form onSubmit={submitSearch} className="flex max-w-sm gap-2">
            <input
              className={inputClass}
              placeholder="Cari nama role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="secondary" type="submit">
              Cari
            </Button>
          </form>
        </div>

        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {loading ? (
          <Spinner />
        ) : data.data.length === 0 ? (
          <EmptyState message="Belum ada role." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="px-4 py-3">Nama Role</th>
                    <th className="px-4 py-3">Deskripsi</th>
                    <th className="px-4 py-3">Pengguna</th>
                    <th className="px-4 py-3">Permission</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{item.nama}</td>
                      <td className="px-4 py-3 text-slate-600">{item.deskripsi || '-'}</td>
                      <td className="px-4 py-3 text-slate-600">{item.user_count}</td>
                      <td className="px-4 py-3 text-slate-600">{item.permission_count}</td>
                      <td className="px-4 py-3">
                        <Badge color={item.status ? 'green' : 'slate'}>
                          {item.status ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          {can('role:view') && (
                            <Link
                              to={`/role-management/${item.id}`}
                              className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Detail
                            </Link>
                          )}
                          {can('role:update') && (
                            <Link
                              to={`/role-management/${item.id}/edit`}
                              className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              Ubah
                            </Link>
                          )}
                          {can('role:delete') && (
                            <button
                              onClick={() => setDeleteTarget(item)}
                              className="rounded-lg px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Hapus
                            </button>
                          )}
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

      <ConfirmModal
        open={!!deleteTarget}
        title="Hapus Role"
        message={`Yakin ingin menghapus role "${deleteTarget?.nama}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  )
}
