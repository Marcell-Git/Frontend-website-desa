import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { auditLogApi } from '../../api/index.js'
import { Badge, Button, Card, PageHeader, Spinner } from '../../components/ui.jsx'
import { errorMessage } from '../../api/client.js'
import { formatTanggalWaktu } from '../../lib/tanggal.js'

function JsonView({ label, data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div>
        <div className="mb-1 text-xs font-semibold uppercase text-slate-500">{label}</div>
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-400">Tidak ada data</div>
      </div>
    )
  }
  return (
    <div>
      <div className="mb-1 text-xs font-semibold uppercase text-slate-500">{label}</div>
      <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}

export default function AuditLogDetail() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    auditLogApi
      .get(id)
      .then(setItem)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <Spinner />
  if (error) return <div className="p-4 text-sm text-red-600">{error}</div>
  if (!item) return null

  const aktivitasBadge = (akt) => {
    const map = {
      create: 'green', update: 'blue', delete: 'red',
      login: 'green', logout: 'slate', change_status: 'amber',
    }
    return <Badge color={map[akt] || 'slate'}>{akt}</Badge>
  }

  return (
    <div>
      <PageHeader title="Detail Audit Log" description="Informasi lengkap catatan aktivitas" back="/audit-log" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Informasi Dasar</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">ID</dt>
              <dd className="font-mono text-xs text-slate-700">{item.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Waktu</dt>
              <dd className="text-slate-900">
                {formatTanggalWaktu(item.created_at, { detik: true })}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">User</dt>
              <dd className="text-slate-900">{item.nama_user || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Role</dt>
              <dd className="text-slate-900">{item.role_user || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Modul</dt>
              <dd className="text-slate-900">{item.modul}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Aktivitas</dt>
              <dd>{aktivitasBadge(item.aktivitas)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Deskripsi</dt>
              <dd className="text-right text-slate-900">{item.deskripsi || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">IP Address</dt>
              <dd className="text-slate-900">{item.ip_address || '-'}</dd>
            </div>
          </dl>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <JsonView label="Data Sebelum Perubahan" data={item.data_sebelum} />
          </Card>
          <Card className="p-6">
            <JsonView label="Data Sesudah Perubahan" data={item.data_sesudah} />
          </Card>
        </div>
      </div>
    </div>
  )
}
