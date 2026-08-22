import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { kategoriPengeluaranApi } from '../../api/index.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

export default function KategoriPengeluaranForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState({ nama: '', deskripsi: '' })
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isEdit) return
    kategoriPengeluaranApi
      .list({ limit: 100 })
      .then((res) => {
        const item = res.data.find((i) => i.id === id)
        if (item) setForm({ nama: item.nama, deskripsi: item.deskripsi || '' })
        else setError('Kategori pengeluaran tidak ditemukan')
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
        deskripsi: form.deskripsi || null,
      }
      if (isEdit) {
        await kategoriPengeluaranApi.update(id, body)
        toast.success('Kategori pengeluaran berhasil diperbarui')
      } else {
        await kategoriPengeluaranApi.create(body)
        toast.success('Kategori pengeluaran berhasil ditambahkan')
      }
      navigate('/kategori-pengeluaran')
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
        title={isEdit ? 'Ubah Kategori Pengeluaran' : 'Tambah Kategori Pengeluaran'}
        description={isEdit ? 'Perbarui data kategori' : 'Isi data kategori pengeluaran baru'}
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
            <Field label="Nama Kategori" required error={errors.nama}>
              <input
                className={inputClass}
                value={form.nama}
                onChange={set('nama')}
                placeholder="Contoh: Operasional, Kebersihan, Keamanan"
              />
            </Field>
            <Field label="Deskripsi" error={errors.deskripsi}>
              <textarea
                className={inputClass}
                rows={3}
                value={form.deskripsi}
                onChange={set('deskripsi')}
                placeholder="Deskripsi (opsional)"
              />
            </Field>
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
