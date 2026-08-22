import { useEffect, useRef } from 'react'

export function Alert({ type = 'error', children }) {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
  }
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[type] || styles.info}`}>
      {children}
    </div>
  )
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  }
  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  }
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
}

export function Card({ className = '', children }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function PageHeader({ title, description, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {children}
    </div>
  )
}

export function Badge({ color = 'slate', children }) {
  const colors = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  )
}

export function Pagination({ page, totalPage, onChange }) {
  if (totalPage <= 1) return null
  const prev = page > 1
  const next = page < totalPage
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="text-xs text-slate-500">
        Halaman {page} dari {totalPage}
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 disabled:opacity-40"
          disabled={!prev}
          onClick={() => onChange(page - 1)}
        >
          Sebelumnya
        </button>
        <button
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 disabled:opacity-40"
          disabled={!next}
          onClick={() => onChange(page + 1)}
        >
          Berikutnya
        </button>
      </div>
    </div>
  )
}

export function Field({ label, error, required, children, hint }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs text-red-600">
          {Array.isArray(error) ? error.join(', ') : error}
        </p>
      )}
    </div>
  )
}

export const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100'

export function EmptyState({ message }) {
  return (
    <div className="px-6 py-12 text-center text-sm text-slate-400">{message}</div>
  )
}

export function Spinner({ label = 'Memuat...' }) {
  return (
    <div
      className="flex min-h-[120px] flex-col items-center justify-center gap-3 text-sm text-slate-400"
      role="status"
      aria-live="polite"
    >
      <svg className="h-6 w-6 animate-spin text-emerald-600" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      {label}
    </div>
  )
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="px-4 py-2" role="status" aria-label="Memuat data...">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-100 py-4 last:border-0">
          {Array.from({ length: cols }, (_, j) => (
            <div
              key={j}
              className={`h-3.5 animate-pulse rounded bg-slate-200 ${
                j === 0 ? 'w-16' : j === cols - 1 ? 'ml-auto w-14' : 'w-[18%]'
              }`}
              style={{ animationDelay: `${(i * cols + j) * 40}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  loading,
  confirmText = 'Hapus',
  cancelText = 'Batal',
  danger = true,
  children,
}) {
  const panelRef = useRef(null)
  const cancelButtonRef = useRef(null)
  const restoreFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    restoreFocusRef.current = document.activeElement
    const timer = setTimeout(() => cancelButtonRef.current?.focus(), 0)

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        e.stopPropagation()
        onCancel()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusables = Array.from(panelRef.current.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      clearTimeout(timer)
      restoreFocusRef.current?.focus?.()
    }
  }, [open, loading, onCancel])

  if (!open) return null

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onCancel()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="animate-scale-in w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h3 id="confirm-modal-title" className="text-lg font-semibold text-slate-900">
          {title}
        </h3>
        {message && <p className="mt-2 text-sm text-slate-600">{message}</p>}
        {children}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading} ref={cancelButtonRef}>
            {cancelText}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Memproses...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
