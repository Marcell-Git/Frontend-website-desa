import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { rolesApi, permissionsApi } from '../../api/index.js'
import { Alert, Button, Card, Field, FormActions, FormSection, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

export default function RoleForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState({ nama: '', deskripsi: '', status: true })
  const [allPerms, setAllPerms] = useState({})
  const [selectedPerms, setSelectedPerms] = useState(new Set())
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    permissionsApi.list().then(setAllPerms).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    Promise.all([rolesApi.get(id), rolesApi.getPermissions(id)])
      .then(([role, perms]) => {
        setForm({ nama: role.nama || '', deskripsi: role.deskripsi || '', status: role.status })
        setSelectedPerms(new Set(perms.permission_ids || []))
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const togglePerm = (permId) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev)
      if (next.has(permId)) next.delete(permId)
      else next.add(permId)
      return next
    })
  }

  const toggleModule = (modul, permIds) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev)
      const allSelected = permIds.every((id) => next.has(id))
      permIds.forEach((pid) => {
        if (allSelected) next.delete(pid)
        else next.add(pid)
      })
      return next
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setSubmitting(true)
    try {
      if (isEdit) {
        await rolesApi.update(id, form)
        await rolesApi.updatePermissions(id, { permission_ids: Array.from(selectedPerms) })
        toast.success('Role berhasil diperbarui')
      } else {
        await rolesApi.create(form)
        toast.success('Role berhasil ditambahkan')
      }
      navigate('/role-management')
    } catch (err) {
      setError(errorMessage(err))
      setErrors(fieldErrors(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div>
      <PageHeader
        title={isEdit ? 'Ubah Role' : 'Tambah Role'}
        description={isEdit ? 'Perbarui role dan hak akses' : 'Buat role baru'} back />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <Card className="p-6 xl:sticky xl:top-[88px]">
          <FormSection title="Data role">
          <div className="grid grid-cols-1 gap-4">
            <Field label="Nama Role" required error={errors.nama}>
              <input
                className={inputClass}
                value={form.nama}
                onChange={set('nama')}
                placeholder="Contoh: Bendahara"
              />
            </Field>
            <Field label="Deskripsi" error={errors.deskripsi}>
              <textarea
                className={inputClass}
                rows={2}
                value={form.deskripsi}
                onChange={set('deskripsi')}
                placeholder="Deskripsi singkat role ini"
              />
            </Field>
            {isEdit && (
              <Field label="Status">
                <select
                  className={inputClass}
                  value={form.status ? 'true' : 'false'}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value === 'true' }))}
                >
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </select>
              </Field>
            )}
          </div>
          </FormSection>
          <FormActions>
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </FormActions>
        </Card>

        <Card className="p-6 xl:col-span-2">
          <FormSection title="Hak akses" description="Centang modul untuk memberi semua akses, atau pilih aksi satu per satu.">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            {Object.entries(allPerms).map(([modul, perms]) => {
              const permIds = perms.map((p) => p.id)
              const allSelected = permIds.every((id) => selectedPerms.has(id))
              const someSelected = permIds.some((id) => selectedPerms.has(id))
              return (
                <div key={modul} className="rounded-2xl bg-slate-50/70 p-4 ring-1 ring-slate-100">
                  <label className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                      onChange={() => toggleModule(modul, permIds)}
                      className="h-4 w-4 rounded text-emerald-600"
                    />
                    <span className="text-sm font-medium text-slate-700 capitalize">
                      {modul.replace(/-/g, ' ')}
                    </span>
                  </label>
                  <div className="ml-6 flex flex-wrap gap-2">
                    {perms.map((p) => (
                      <label
                        key={p.id}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium cursor-pointer transition-colors ${
                          selectedPerms.has(p.id)
                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                            : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPerms.has(p.id)}
                          onChange={() => togglePerm(p.id)}
                          className="sr-only"
                        />
                        {p.aksi}
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
            {Object.keys(allPerms).length === 0 && (
              <p className="text-sm text-slate-400">Memuat permissions...</p>
            )}
          </div>
          </FormSection>
        </Card>

      </form>
    </div>
  )
}
