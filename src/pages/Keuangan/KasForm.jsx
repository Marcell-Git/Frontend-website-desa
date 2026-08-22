import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { kasApi } from '../../api/index.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

export default function KasForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    sumber_kas: '',
    nominal: '',
    keterangan: '',
  })
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isEdit) return
    kasApi
      .get(id)
      .then((item) => {
        setForm({
          tanggal: item.tanggal ? new Date(item.tanggal).toISOString().slice(0, 10) : '',
          sumber_kas: item.sumber_kas,
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
        sumber_kas: form.sumber_kas,
        nominal: parseFloat(form.nominal) || 0,
        keterangan: form.keterangan || null,
      }
      if (isEdit) {
        await kasApi.update(id, body)
        toast.success('Transaksi kas berhasil diperbarui')
      } else {
        await kasApi.create(body)
        toast.success('Transaksi kas berhasil ditambahkan')
      }
      navigate('/kas')
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
        title={isEdit ? 'Ubah Transaksi Kas' : 'Tambah Transaksi Kas'}
        description={isEdit ? 'Perbarui data transaksi kas' : 'Isi data transaksi kas baru'}
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
            <Field label="Sumber Kas" required error={errors.sumber_kas}>
              <input
                className={inputClass}
                value={form.sumber_kas}
                onChange={set('sumber_kas')}
                placeholder="Contoh: Iuran warga, Sumbangan"
              />
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
