import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../auth/AuthContext.jsx'
import { authApi } from '../api/index.js'
import { Alert, Button, Card, Field, inputClass, PageHeader } from '../components/ui.jsx'
import { errorMessage, fieldErrors } from '../api/client.js'

export default function Profile() {
  const { user } = useAuth()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')
    setError('')
    setErrors({})

    if (newPassword !== confirmPassword) {
      setErrors({ confirm_password: ['Konfirmasi password tidak cocok'] })
      return
    }

    setLoading(true)
    try {
      await authApi.changePassword(oldPassword, newPassword)
      toast.success('Password berhasil diperbarui')
      setSuccess('Password berhasil diperbarui')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(errorMessage(err))
      setErrors(fieldErrors(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader title="Profil & Password" description="Informasi akun dan pengaturan password" />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Informasi Akun</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Nama</dt>
              <dd className="font-medium text-slate-900">{user.nama}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{user.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Peran</dt>
              <dd className="font-medium text-slate-900">{user.role}</dd>
            </div>
            {user.jabatan && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Jabatan</dt>
                <dd className="font-medium text-slate-900">{user.jabatan}</dd>
              </div>
            )}
            {user.nomor_hp && (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">No. HP</dt>
                <dd className="font-medium text-slate-900">{user.nomor_hp}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Ubah Password</h3>
          {success && (
            <div className="mb-4">
              <Alert type="success">{success}</Alert>
            </div>
          )}
          {error && (
            <div className="mb-4">
              <Alert>{error}</Alert>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Password Lama" required error={errors.old_password}>
              <input
                type="password"
                className={inputClass}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </Field>
            <Field
              label="Password Baru"
              required
              error={errors.new_password}
              hint="Minimal 8 karakter"
            >
              <input
                type="password"
                className={inputClass}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Field>
            <Field label="Konfirmasi Password Baru" required error={errors.confirm_password}>
              <input
                type="password"
                className={inputClass}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>
            <Button type="submit" disabled={loading}>
              {loading ? 'Memproses...' : 'Simpan Password'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
