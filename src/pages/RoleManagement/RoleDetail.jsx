import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { rolesApi } from '../../api/index.js'
import { Badge, Button, Card, PageHeader, Spinner } from '../../components/ui.jsx'
import { errorMessage } from '../../api/client.js'

export default function RoleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
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
    <div className="max-w-3xl">
      <PageHeader title={role.nama} description="Detail Role">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </PageHeader>

      <Card className="mb-6 p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          <div className="sm:col-span-2">
            <p className="text-xs text-slate-500">Deskripsi</p>
            <p className="text-sm text-slate-700">{role.deskripsi || '-'}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-sm font-semibold text-slate-900">
          Permissions ({role.permissions?.length || 0})
        </h3>
        {Object.keys(groupedPerms).length === 0 ? (
          <p className="text-sm text-slate-400">Tidak ada permission</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedPerms).map(([modul, perms]) => (
              <div key={modul}>
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
  )
}
