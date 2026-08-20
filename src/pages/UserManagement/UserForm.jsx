import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { userApi, rolesApi } from '../../api/index.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

export default function UserForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nama: '',
    email: '',
    nomor_hp: '',
    jabatan: '',
    role_id: '',
    password: '',
    confirm_password: '',
    status: true,
  })
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    rolesApi.list({ limit: 100 }).then((res) => setRoles(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    userApi
      .get(id)
      .then((item) => {
        setForm({
          nama: item.nama || '',
          email: item.email || '',
          nomor_hp: item.nomor_hp || '',
          jabatan: item.jabatan || '',
          role_id: item.role_id || '',
          password: '',
          confirm_password: '',
          status: item.status,
        })
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setSubmitting(true)
    try {
      const body = {
        nama: form.nama,
        email: form.email,
        nomor_hp: form.nomor_hp || null,
        jabatan: form.jabatan || null,
        role_id: form.role_id,
        status: form.status,
      }
      if (!isEdit) {
        body.password = form.password
        body.confirm_password = form.confirm_password
      }
      if (isEdit) {
        await userApi.update(id, body)
      } else {
        await userApi.create(body)
      }
      navigate('/user-management')
    } catch (err) {
      setError(errorMessage(err))
      setErrors(fieldErrors(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner />

  return (
    <div className="max-w-xl">
      <PageHeader
        title={isEdit ? 'Ubah Pengguna' : 'Tambah Pengguna'}
        description={isEdit ? 'Perbarui data pengguna' : 'Buat akun pengguna baru'}
      >
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Kembali
        </Button>
      </PageHeader>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="grid grid-cols-1 gap-4">
            <Field label="Nama Lengkap" required error={errors.nama}>
              <input
                className={inputClass}
                value={form.nama}
                onChange={set('nama')}
                placeholder="Nama lengkap"
              />
            </Field>
            <Field label="Email" required error={errors.email}>
              <input
                type="email"
                className={inputClass}
                value={form.email}
                onChange={set('email')}
                placeholder="email@contoh.com"
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nomor HP" error={errors.nomor_hp}>
                <input
                  className={inputClass}
                  value={form.nomor_hp}
                  onChange={set('nomor_hp')}
                  placeholder="08xxxxxxxxxx"
                />
              </Field>
              <Field label="Jabatan" error={errors.jabatan}>
                <input
                  className={inputClass}
                  value={form.jabatan}
                  onChange={set('jabatan')}
                  placeholder="Contoh: Ketua RT"
                />
              </Field>
            </div>
            <Field label="Role" required error={errors.role_id}>
              <select
                className={inputClass}
                value={form.role_id}
                onChange={set('role_id')}
              >
                <option value="">Pilih Role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.nama}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Password"
                required={!isEdit}
                error={errors.password}
                hint={isEdit ? 'Kosongkan jika tidak ingin mengubah' : 'Minimal 8 karakter'}
              >
                <input
                  type="password"
                  className={inputClass}
                  value={form.password}
                  onChange={set('password')}
                  placeholder={isEdit ? '••••••••' : 'Minimal 8 karakter'}
                />
              </Field>
              {!isEdit && (
                <Field label="Konfirmasi Password" required error={errors.confirm_password}>
                  <input
                    type="password"
                    className={inputClass}
                    value={form.confirm_password}
                    onChange={set('confirm_password')}
                    placeholder="Ulangi password"
                  />
                </Field>
              )}
            </div>
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
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
            Batal
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </div>
  )
}
