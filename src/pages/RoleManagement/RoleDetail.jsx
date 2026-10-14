import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { rolesApi } from '../../api/index.js'
import { Badge, Button, Card, PageHeader, Spinner } from '../../components/ui.jsx'
import { errorMessage } from '../../api/client.js'

export default function RoleDetail() {
  const { id } = useParams()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    rolesApi
      .get(id)
      .then(setRole)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Spinner />
  if (error) return <div className="text-sm text-red-600">{error}</div>
  if (!role) return null

  const groupedPerms = {}
  ;(role.permissions || []).forEach((p) => {
    if (!groupedPerms[p.modul]) groupedPerms[p.modul] = []
    groupedPerms[p.modul].push(p)
  })

  return (
    <div>
      <PageHeader title={role.nama} description="Detail Role" back />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
      <Card className="p-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-xs text-slate-500">Nama Role</p>
            <p className="text-sm font-medium text-slate-900">{role.nama}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Status</p>
            <Badge color={role.status ? 'green' : 'slate'}>
              {role.status ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-slate-500">Deskripsi</p>
            <p className="text-sm text-slate-700">{role.deskripsi || '-'}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 xl:col-span-2">
        <h3 className="mb-4 text-base font-semibold text-slate-800">
          Permissions ({role.permissions?.length || 0})
        </h3>
        {Object.keys(groupedPerms).length === 0 ? (
          <p className="text-sm text-slate-400">Tidak ada permission</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {Object.entries(groupedPerms).map(([modul, perms]) => (
              <div key={modul} className="rounded-2xl bg-slate-50/70 p-4 ring-1 ring-slate-100">
                <p className="mb-1 text-xs font-semibold uppercase text-slate-500">
                  {modul.replace(/-/g, ' ')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {perms.map((p) => (
                    <Badge key={p.id} color="blue">{p.aksi}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      </div>
    </div>
  )
}
