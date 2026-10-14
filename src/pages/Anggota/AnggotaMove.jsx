import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { anggotaApi, kkApi } from '../../api/index.js'
import { Alert, Button, Card, Field, FormActions, InfoCard, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
import { errorMessage, fieldErrors } from '../../api/client.js'

export default function AnggotaMove() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [anggota, setAnggota] = useState(null)
  const [target, setTarget] = useState('')
  const [kkOptions, setKkOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    Promise.all([
      anggotaApi.get(id),
      kkApi.list({ limit: 100 }),
    ])
      .then(([a, res]) => {
        setAnggota(a)
        setKkOptions(res.data)
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setSubmitting(true)
    try {
      await anggotaApi.move(id, target)
      toast.success('Anggota berhasil dipindah')
      navigate(`/kartu-keluarga/${target}`)
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
        title="Pindahkan Anggota"
        description={anggota ? `Memindahkan ${anggota.nama_lengkap} ke KK lain` : 'Pindah anggota'} back />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <form onSubmit={handleSubmit}>
            <Field label="KK Tujuan" required error={errors.kartu_keluarga_id}>
              <select className={inputClass} value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="">Pilih KK tujuan</option>
                {kkOptions
                  .filter((kk) => kk.id !== (anggota && anggota.kartu_keluarga_id))
                  .map((kk) => (
                    <option key={kk.id} value={kk.id}>
                      {kk.nomor_kk} - {kk.nama_kepala_keluarga || ''} ({kk.alamat})
                    </option>
                  ))}
              </select>
            </Field>
            <FormActions>
              <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Memproses...' : 'Pindahkan Anggota'}
              </Button>
            </FormActions>
          </form>
        </Card>

        <InfoCard title="Anggota yang dipindah">
          {anggota && (
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-slate-400">Nama</dt>
                <dd className="font-medium text-slate-800">{anggota.nama_lengkap}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">NIK</dt>
                <dd className="font-medium text-slate-800">{anggota.nik}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Hubungan di KK asal</dt>
                <dd className="font-medium text-slate-800">{anggota.hubungan_keluarga || '-'}</dd>
              </div>
            </dl>
          )}
          <p>Setelah dipindah, data anggota ini akan tampil di KK tujuan dan hilang dari KK asal.</p>
        </InfoCard>
      </div>
    </div>
  )
}
