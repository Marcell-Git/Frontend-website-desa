import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { beritaKegiatanApi } from '../../api/index.js'
import { Alert, Button, Card, Field, FormActions, FormSection, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'
import { getContrastTextColor } from '../LandingPage/format.js'
import { COLOR_PRESETS, KATEGORI_PRESETS } from './constants.js'

const initialForm = {
  kategori: '',
  warna_label: '#047857',
  judul: '',
  tanggal: new Date().toISOString().slice(0, 10),
  jam: '',
  lokasi: '',
  keterangan: '',
}

export default function BeritaKegiatanForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!isEdit) return
    beritaKegiatanApi.get(id)
      .then((item) => setForm({
        kategori: item.kategori || '',
        warna_label: item.warna_label || '#047857',
        judul: item.judul || '',
        tanggal: item.tanggal ? new Date(item.tanggal).toISOString().slice(0, 10) : '',
        jam: item.jam || '',
        lokasi: item.lokasi || '',
        keterangan: item.keterangan || '',
      }))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  const set = (key) => (e) => setForm((current) => ({ ...current, [key]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setSubmitting(true)
    try {
      if (isEdit) {
        await beritaKegiatanApi.update(id, form)
        toast.success('Berita atau kegiatan berhasil diperbarui')
      } else {
        await beritaKegiatanApi.create(form)
        toast.success('Berita atau kegiatan berhasil ditambahkan')
      }
      navigate('/kelola-berita-kegiatan')
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
      <PageHeader title={isEdit ? 'Ubah Berita & Kegiatan' : 'Tambah Berita & Kegiatan'} description="Informasi akan langsung tampil pada halaman publik." back />
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <div className="grid gap-4">
            <Field label="Judul Kegiatan" required error={errors.judul}>
              <input className={inputClass} value={form.judul} onChange={set('judul')} placeholder="Contoh: Kerja Bakti Lingkungan" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tanggal" required error={errors.tanggal}>
                <input type="date" className={inputClass} value={form.tanggal} onChange={set('tanggal')} />
              </Field>
              <Field label="Jam" required error={errors.jam}>
                <input type="time" className={inputClass} value={form.jam} onChange={set('jam')} />
              </Field>
            </div>
            <Field label="Lokasi" required error={errors.lokasi}>
              <input className={inputClass} value={form.lokasi} onChange={set('lokasi')} placeholder="Contoh: Balai RT 26" />
            </Field>
            <Field label="Keterangan" error={errors.keterangan} hint="Opsional">
              <textarea className={inputClass} rows={5} value={form.keterangan} onChange={set('keterangan')} placeholder="Tambahkan informasi pendukung bila diperlukan..." />
            </Field>
          </div>
        </Card>

        <Card className="self-start p-6">
          <FormSection title="Label" description="Kategori dan warna tampil sebagai label di halaman publik.">
            <div className="grid gap-4">
            <Field label="Kategori" required error={errors.kategori} hint="Contoh: Berita, Kegiatan, Sosial, atau Keamanan.">
              <input className={inputClass} list="kategori-berita-kegiatan" value={form.kategori} onChange={set('kategori')} placeholder="Pilih atau tulis kategori" />
              <datalist id="kategori-berita-kegiatan">
                <option value="Berita" />
                <option value="Kegiatan" />
                <option value="Kerja Bakti" />
                <option value="Rapat Warga" />
                <option value="Sosial & Budaya" />
                <option value="Keamanan & Ronda" />
              </datalist>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400">Rekomendasi cepat:</span>
                {KATEGORI_PRESETS.map((p) => (
                  <button
                    key={p.kategori}
                    type="button"
                    onClick={() => setForm((c) => ({ ...c, kategori: p.kategori, warna_label: p.warna }))}
                    className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white active:scale-95"
                  >
                    <span className="mr-1.5 h-2 w-2 rounded-full" style={{ backgroundColor: p.warna }} />
                    {p.kategori}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Warna Label" error={errors.warna_label} hint="Pilih palet warna siap pakai atau tentukan warna hex kustom.">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PRESETS.map((c) => {
                    const isSelected = (form.warna_label || '').toUpperCase() === c.value.toUpperCase()
                    return (
                      <button
                        key={c.value}
                        type="button"
                        title={c.label}
                        onClick={() => setForm((curr) => ({ ...curr, warna_label: c.value }))}
                        className={`group relative flex h-8 w-8 items-center justify-center rounded-full border border-black/10 transition hover:scale-110 focus:outline-none ${
                          isSelected ? 'ring-2 ring-emerald-600 ring-offset-2 scale-110' : ''
                        }`}
                        style={{ backgroundColor: c.value }}
                      >
                        {isSelected && (
                          <svg
                            className="h-4 w-4"
                            style={{ color: getContrastTextColor(c.value) }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.warna_label || '#047857'}
                    onChange={set('warna_label')}
                    className="h-10 w-12 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
                    aria-label="Pilih warna label"
                  />
                  <input
                    className={`${inputClass} max-w-32 uppercase font-mono text-xs`}
                    value={form.warna_label}
                    onChange={set('warna_label')}
                    placeholder="#047857"
                    maxLength={7}
                  />
                  <span
                    className="rounded-full px-3 py-1 text-xs font-bold shadow-sm transition-all"
                    style={{
                      backgroundColor: form.warna_label || '#047857',
                      color: getContrastTextColor(form.warna_label || '#047857'),
                    }}
                  >
                    {form.kategori || 'Pratinjau label'}
                  </span>
                </div>
              </div>
            </Field>
            </div>
          </FormSection>
          <FormActions>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Batal</Button>
            <Button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan'}</Button>
          </FormActions>
        </Card>
      </form>
    </div>
  )
}
