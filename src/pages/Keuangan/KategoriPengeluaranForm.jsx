import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { kategoriPengeluaranApi } from '../../api/index.js'
import { Alert, Button, Card, Field, FormActions, InfoCard, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
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
    <div>
      <PageHeader
        title={isEdit ? 'Ubah Kategori Pengeluaran' : 'Tambah Kategori Pengeluaran'}
        description={isEdit ? 'Perbarui data kategori' : 'Isi data kategori pengeluaran baru'} back />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <form onSubmit={handleSubmit} className="xl:col-span-2">
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

        <InfoCard title="Tentang kategori pengeluaran">
          <p>Kategori mengelompokkan uang keluar dari kas RT, misalnya Kebersihan, Perbaikan Fasilitas, atau Konsumsi Rapat.</p>
          <p>Kategori ini dipilih saat mencatat Rekap Pengeluaran dan dipakai sebagai filter di Laporan.</p>
        </InfoCard>
      </div>
    </div>
  )
}
