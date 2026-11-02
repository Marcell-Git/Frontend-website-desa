import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { jenisIuranApi } from '../../api/index.js'
import { Alert, Button, Card, Field, FormActions, InfoCard, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'
import { periodeSekarang } from '../../components/PembayaranBulanan.jsx'
import { toPeriode } from './jenisIuran.js'

export default function JenisIuranForm() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nama: '',
    deskripsi: '',
    nominal: '',
    tipe_periode: 'selamanya',
    bulan_mulai: periodeSekarang(),
    bulan_selesai: '',
  })
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
        if (item)
          setForm({
            nama: item.nama,
            deskripsi: item.deskripsi || '',
            nominal: item.nominal ? String(item.nominal) : '',
            tipe_periode: item.tipe_periode || 'selamanya',
            bulan_mulai: toPeriode(item.bulan_mulai) || periodeSekarang(),
            bulan_selesai: toPeriode(item.bulan_selesai),
          })
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
        nominal: Number(form.nominal) || 0,
        tipe_periode: form.tipe_periode,
        bulan_mulai: form.bulan_mulai,
        bulan_selesai: form.tipe_periode === 'periode' ? form.bulan_selesai : '',
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
              <Field label="Nominal per KK / bulan (Rp)" required error={errors.nominal}>
                <input
                  type="number"
                  min="1"
                  className={inputClass}
                  value={form.nominal}
                  onChange={set('nominal')}
                  placeholder="Contoh: 20000"
                />
              </Field>
              <Field label="Masa berlaku" required error={errors.tipe_periode}>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'selamanya', label: 'Selamanya (tiap bulan)' },
                    { value: 'periode', label: 'Berperiode' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`cursor-pointer rounded-full px-4 py-2 text-sm ring-1 transition-colors ${
                        form.tipe_periode === opt.value
                          ? 'bg-emerald-50 font-medium text-emerald-700 ring-emerald-300'
                          : 'text-slate-600 ring-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipe_periode"
                        value={opt.value}
                        checked={form.tipe_periode === opt.value}
                        onChange={set('tipe_periode')}
                        className="sr-only"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Bulan mulai" required error={errors.bulan_mulai}>
                  <input type="month" className={inputClass} value={form.bulan_mulai} onChange={set('bulan_mulai')} />
                </Field>
                {form.tipe_periode === 'periode' && (
                  <Field label="Bulan selesai" required error={errors.bulan_selesai}>
                    <input
                      type="month"
                      className={inputClass}
                      value={form.bulan_selesai}
                      min={form.bulan_mulai}
                      onChange={set('bulan_selesai')}
                    />
                  </Field>
                )}
              </div>
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
          <p>Setiap bulan dalam masa berlakunya, iuran ini ditagihkan ke semua kepala keluarga dan muncul di tab Pembayaran Bulanan pada Rekap Iuran.</p>
          <p><b>Selamanya</b>: ditagih tiap bulan mulai bulan yang dipilih tanpa batas akhir. <b>Berperiode</b>: hanya ditagih dari bulan mulai sampai bulan selesai.</p>
        </InfoCard>
      </div>
    </div>
  )
}
