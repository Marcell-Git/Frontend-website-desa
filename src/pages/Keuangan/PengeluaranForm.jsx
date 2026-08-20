import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { pengeluaranApi, kategoriPengeluaranApi } from '../../api/index.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

export default function PengeluaranForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    kategori_pengeluaran_id: '',
    nominal: '',
    keterangan: '',
  })
  const [kategoriOptions, setKategoriOptions] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    kategoriPengeluaranApi
      .list({ limit: 100 })
      .then((res) => setKategoriOptions(res.data || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!isEdit) return
    pengeluaranApi
      .get(id)
      .then((item) => {
        setForm({
          tanggal: item.tanggal ? new Date(item.tanggal).toISOString().slice(0, 10) : '',
          kategori_pengeluaran_id: item.kategori_pengeluaran_id,
          nominal: item.nominal,
          keterangan: item.keterangan || '',
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
        tanggal: form.tanggal,
        kategori_pengeluaran_id: form.kategori_pengeluaran_id,
        nominal: parseFloat(form.nominal) || 0,
        keterangan: form.keterangan || null,
      }
      if (isEdit) {
        await pengeluaranApi.update(id, body)
      } else {
        await pengeluaranApi.create(body)
      }
      navigate('/pengeluaran')
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
        title={isEdit ? 'Ubah Pengeluaran' : 'Tambah Pengeluaran'}
        description={isEdit ? 'Perbarui data pengeluaran' : 'Isi data pengeluaran baru'}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tanggal" required error={errors.tanggal}>
              <input
                type="date"
                className={inputClass}
                value={form.tanggal}
                onChange={set('tanggal')}
              />
            </Field>
            <Field label="Kategori Pengeluaran" required error={errors.kategori_pengeluaran_id}>
              <select
                className={inputClass}
                value={form.kategori_pengeluaran_id}
                onChange={set('kategori_pengeluaran_id')}
              >
                <option value="">Pilih Kategori</option>
                {kategoriOptions.map((k) => (
                  <option key={k.id} value={k.id}>{k.nama}</option>
                ))}
              </select>
            </Field>
            <Field label="Nominal (Rp)" required error={errors.nominal}>
              <input
                type="number"
                className={inputClass}
                value={form.nominal}
                onChange={set('nominal')}
                placeholder="0"
                min="1"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Keterangan" error={errors.keterangan}>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={form.keterangan}
                  onChange={set('keterangan')}
                  placeholder="Keterangan (opsional)"
                />
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
