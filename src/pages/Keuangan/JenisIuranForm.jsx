import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { jenisIuranApi } from '../../api/index.js'
import { Alert, Button, Card, Field, FormActions, InfoCard, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

export default function JenisIuranForm() {
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
    jenisIuranApi
      .list({ limit: 100 })
      .then((res) => {
        const item = res.data.find((i) => i.id === id)
        if (item) setForm({ nama: item.nama, deskripsi: item.deskripsi || '' })
        else setError('Jenis iuran tidak ditemukan')
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
        await jenisIuranApi.update(id, body)
        toast.success('Jenis iuran berhasil diperbarui')
      } else {
        await jenisIuranApi.create(body)
        toast.success('Jenis iuran berhasil ditambahkan')
      }
      navigate('/jenis-iuran')
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
        title={isEdit ? 'Ubah Jenis Iuran' : 'Tambah Jenis Iuran'}
        description={isEdit ? 'Perbarui data jenis iuran' : 'Isi data jenis iuran baru'} back />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <form onSubmit={handleSubmit} className="xl:col-span-2">
          <Card className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <Field label="Nama Jenis Iuran" required error={errors.nama}>
                <input
                  className={inputClass}
                  value={form.nama}
                  onChange={set('nama')}
                  placeholder="Contoh: Kebersihan, Keamanan, Sosial"
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

        <InfoCard title="Tentang jenis iuran">
          <p>Jenis iuran mengelompokkan pembayaran warga, misalnya Kebersihan, Keamanan, atau Sosial.</p>
          <p>Jenis ini dipilih saat mencatat transaksi di Rekap Iuran dan dipakai sebagai filter di Laporan.</p>
        </InfoCard>
      </div>
    </div>
  )
}
