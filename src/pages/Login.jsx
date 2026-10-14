import { useState } from 'react'
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa6'
import { useAuth } from '../auth/AuthContext.jsx'
import { Alert, Button, Field, inputClass } from '../components/ui.jsx'
import { errorMessage, fieldErrors } from '../api/client.js'
import Logo from '../components/Logo.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState({})

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setErrors({})
    setLoading(true)
    try {
      await login(username, password)
      const from = location.state && location.state.from
      navigate(from ? from.pathname : '/dashboard', { replace: true })
    } catch (err) {
      setError(errorMessage(err))
      setErrors(fieldErrors(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--admin-bg)] p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[32px] bg-white shadow-xl shadow-slate-900/5 ring-1 ring-black/5 md:grid-cols-2">
        <div
          className="relative hidden flex-col justify-between bg-cover bg-center p-8 md:flex"
          style={{ backgroundImage: 'url(/gambar-desa-960.webp)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-700/90 via-emerald-800/85 to-emerald-950/95" />
          <div className="relative flex items-center gap-3">
            <Logo className="h-11 w-11 rounded-full bg-white/10" />
            <span className="font-display text-sm font-bold text-white">RT 26 Tegalyoso</span>
          </div>
          <div className="relative">
            <h1 className="text-3xl font-medium leading-tight tracking-tight text-white">
              Sistem Informasi
              <br />
              <span className="text-emerald-200">Manajemen RT 26</span>
            </h1>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-emerald-100/80">
              Kelola data warga, kas, iuran, dan pengaduan Desa Tegalyoso dalam satu tempat.
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            <FaArrowLeft className="h-3 w-3" /> Ke beranda
          </Link>

          <div className="mb-6 flex items-center gap-3 md:hidden">
            <Logo className="h-11 w-11 rounded-full" />
            <span className="font-display text-sm font-bold text-emerald-800">SIM RT Tegalyoso 26</span>
          </div>

          <h2 className="text-3xl font-medium tracking-tight text-slate-900">
            Selamat datang <span className="font-normal text-slate-400">kembali</span>
          </h2>
          <p className="mb-6 mt-1.5 text-sm text-slate-500">Masuk dengan akun pengurus untuk melanjutkan.</p>

          {error && (
            <div className="mb-4">
              <Alert>{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Username" required error={errors.username}>
              <input
                type="text"
                className={inputClass}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="masukkan username"
                autoComplete="username"
              />
            </Field>
            <Field label="Password" required error={errors.password}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={inputClass}
                  style={{ paddingRight: '2.75rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-1 flex w-10 items-center justify-center text-slate-400 transition-colors hover:text-slate-600"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </Field>
            <Button type="submit" className="mt-2 w-full justify-center" disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
