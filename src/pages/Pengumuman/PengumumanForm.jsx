import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { pengumumanApi } from '../../api/index.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

export default function PengumumanForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState({
    judul: '',
    isi: '',
    tanggal_publikasi: new Date().toISOString().slice(0, 10),
    status: 'draft',
  })
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isEdit) return
    pengumumanApi
      .get(id)
      .then((item) => {
        setForm({
          judul: item.judul,
          isi: item.isi,
          tanggal_publikasi: item.tanggal_publikasi
            ? new Date(item.tanggal_publikasi).toISOString().slice(0, 10)
            : '',
          status: item.status || 'draft',
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
        judul: form.judul,
        isi: form.isi,
        tanggal_publikasi: form.tanggal_publikasi,
        status: form.status,
      }
      if (isEdit) {
        await pengumumanApi.update(id, body)
      } else {
        await pengumumanApi.create(body)
      }
      navigate('/kelola-pengumuman')
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
        title={isEdit ? 'Ubah Pengumuman' : 'Tambah Pengumuman'}
        description={isEdit ? 'Perbarui data pengumuman' : 'Buat pengumuman baru'}
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
            <Field label="Judul" required error={errors.judul}>
              <input
                className={inputClass}
                value={form.judul}
                onChange={set('judul')}
                placeholder="Judul pengumuman"
              />
            </Field>
            <Field label="Isi Pengumuman" required error={errors.isi}>
              <textarea
                className={inputClass}
                rows={6}
                value={form.isi}
                onChange={set('isi')}
                placeholder="Tulis isi pengumuman di sini..."
              />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Tanggal Publikasi" required error={errors.tanggal_publikasi}>
                <input
                  type="date"
                  className={inputClass}
                  value={form.tanggal_publikasi}
                  onChange={set('tanggal_publikasi')}
                />
              </Field>
              <Field label="Status" error={errors.status}>
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={set('status')}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
            </div>
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
