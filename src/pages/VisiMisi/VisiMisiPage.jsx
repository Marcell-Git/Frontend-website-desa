import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FaArrowDown, FaArrowUp, FaPlus, FaTrashCan } from 'react-icons/fa6'
import { settingsApi } from '../../api/index.js'
import { Alert, Button, Card, FormSection, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { useAuth } from '../../auth/AuthContext.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

// Visi & misi disimpan di website settings. Halaman ini hanya mengirim
// field miliknya sendiri; backend mengabaikan field yang tidak dikirim.
export default function VisiMisiPage() {
  const { can } = useAuth()
  const canEdit = can('website-settings:update')
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    settingsApi
      .get()
      .then((s) =>
        setForm({
          visi: s.visi || '',
          misi: s.misi?.length ? s.misi : [''],
          show_visi_misi: Boolean(s.show_visi_misi),
        }),
      )
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const updateMisi = (index, value) =>
    setForm((f) => ({ ...f, misi: f.misi.map((item, i) => (i === index ? value : item)) }))
  const addMisi = () => setForm((f) => ({ ...f, misi: [...f.misi, ''] }))
  const removeMisi = (index) => setForm((f) => ({ ...f, misi: f.misi.filter((_, i) => i !== index) }))
  const moveMisi = (index, dir) =>
    setForm((f) => {
      const misi = [...f.misi]
      const target = index + dir
      if (target < 0 || target >= misi.length) return f
      ;[misi[index], misi[target]] = [misi[target], misi[index]]
      return { ...f, misi }
    })

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setSaving(true)
    try {
      await settingsApi.update({
        visi: form.visi,
        misi: form.misi.map((item) => item.trim()).filter(Boolean),
        show_visi_misi: form.show_visi_misi,
      })
      setForm((f) => ({ ...f, misi: f.misi.filter((item) => item.trim()) }))
      toast.success('Visi & misi berhasil disimpan')
    } catch (err) {
      setError(errorMessage(err))
      setErrors(fieldErrors(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />
  if (!form) return <Alert type="error">{error || 'Gagal memuat visi & misi'}</Alert>

  const iconButton =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 transition-colors disabled:opacity-30'

  return (
    <div>
      <PageHeader title="Visi & Misi" description="Ditampilkan kepada warga di halaman Visi & Misi website." />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}
      {!canEdit && (
        <div className="mb-4">
          <Alert type="info">Anda hanya dapat melihat visi &amp; misi, belum dapat mengubahnya.</Alert>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 items-start gap-4 xl:grid-cols-3">
        <Card className="p-6">
          <FormSection title="Visi" description="Gambaran cita-cita RT dalam satu atau dua kalimat.">
            <textarea
              className={inputClass}
              rows={6}
              value={form.visi}
              onChange={(e) => setForm((f) => ({ ...f, visi: e.target.value }))}
              disabled={!canEdit}
              placeholder="Contoh: Terwujudnya lingkungan RT 26 yang rukun, bersih, dan aman."
              aria-label="Visi"
            />
            {errors.visi && <p className="mt-1 text-xs text-red-600">{[].concat(errors.visi).join(', ')}</p>}
          </FormSection>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4">
            <input
              type="checkbox"
              checked={form.show_visi_misi}
              onChange={() => setForm((f) => ({ ...f, show_visi_misi: !f.show_visi_misi }))}
              disabled={!canEdit}
              className="mt-0.5 h-4 w-4 rounded accent-emerald-700"
            />
            <span>
              <span className="block text-sm font-medium text-slate-700">Tampilkan di website</span>
              <span className="mt-0.5 block text-xs text-slate-400">
                Jika dimatikan, halaman Visi &amp; Misi disembunyikan dari warga.
              </span>
            </span>
          </label>
        </Card>

        <Card className="p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Misi</h3>
              <p className="mt-0.5 text-xs text-slate-400">
                Langkah untuk mewujudkan visi. Urutan di sini sama dengan urutan di website.
              </p>
            </div>
            {canEdit && (
              <Button type="button" variant="secondary" size="sm" onClick={addMisi}>
                <FaPlus className="h-3 w-3" /> Tambah butir
              </Button>
            )}
          </div>

          {form.misi.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
              Belum ada butir misi. Klik “Tambah butir” untuk memulai.
            </p>
          ) : (
            <ol className="mt-4 space-y-2">
              {form.misi.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
                    {index + 1}
                  </span>
                  <textarea
                    className={`${inputClass} resize-none`}
                    rows={2}
                    value={item}
                    onChange={(e) => updateMisi(index, e.target.value)}
                    disabled={!canEdit}
                    placeholder="Tulis butir misi..."
                    aria-label={`Butir misi ${index + 1}`}
                  />
                  {canEdit && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveMisi(index, -1)}
                        disabled={index === 0}
                        aria-label={`Naikkan butir misi ${index + 1}`}
                        className={`${iconButton} text-slate-500 ring-slate-200 hover:bg-slate-50`}
                      >
                        <FaArrowUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveMisi(index, 1)}
                        disabled={index === form.misi.length - 1}
                        aria-label={`Turunkan butir misi ${index + 1}`}
                        className={`${iconButton} text-slate-500 ring-slate-200 hover:bg-slate-50`}
                      >
                        <FaArrowDown className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMisi(index)}
                        aria-label={`Hapus butir misi ${index + 1}`}
                        title="Hapus butir"
                        className={`${iconButton} text-rose-500 ring-rose-200 hover:bg-rose-50`}
                      >
                        <FaTrashCan className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ol>
          )}
          {errors.misi && <p className="mt-2 text-xs text-red-600">{[].concat(errors.misi).join(', ')}</p>}

          {canEdit && (
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
              <Button type="submit" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Visi & Misi'}
              </Button>
            </div>
          )}
        </Card>
      </form>
    </div>
  )
}
