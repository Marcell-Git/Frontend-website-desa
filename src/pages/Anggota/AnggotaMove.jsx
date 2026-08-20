import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { anggotaApi, kkApi } from '../../api/index.js'
import { Alert, Button, Card, Field, PageHeader, Spinner, inputClass } from '../../components/ui.jsx'
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
    <div className="max-w-2xl">
      <PageHeader
        title="Pindahkan Anggota"
        description={anggota ? `Memindahkan ${anggota.nama_lengkap} ke KK lain` : 'Pindah anggota'}
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

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Memproses...' : 'Pindahkan Anggota'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
