import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { pengumumanApi } from '../../api/index.js'
import { Alert, Button, Card, Field, FormActions, FormSection, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
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
        toast.success('Pengumuman berhasil diperbarui')
      } else {
        await pengumumanApi.create(body)
        toast.success('Pengumuman berhasil ditambahkan')
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
    <div>
      <PageHeader
        title={isEdit ? 'Ubah Pengumuman' : 'Tambah Pengumuman'}
        description={isEdit ? 'Perbarui data pengumuman' : 'Buat pengumuman baru'} back />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
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
                rows={10}
                value={form.isi}
                onChange={set('isi')}
                placeholder="Tulis isi pengumuman di sini..."
              />
            </Field>
          </div>
        </Card>

        <Card className="self-start p-6">
          <FormSection title="Publikasi" description="Draft tidak tampil di halaman publik.">
            <div className="grid grid-cols-1 gap-4">
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
      </form>
    </div>
  )
}
