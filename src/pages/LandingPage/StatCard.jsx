export default function StatCard({ label, value, highlight = false, icon = null }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-3 shadow-sm transition-shadow hover:shadow-md sm:p-5 ${
        highlight
          ? 'border-emerald-600 bg-emerald-600 shadow-emerald-900/10'
          : 'border-slate-200 bg-white'
      }`}
    >
      {icon && (
        <div
          className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:flex ${
            highlight ? 'bg-white/15 text-white' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div
          className={`text-[10px] font-semibold uppercase tracking-wide sm:text-[11px] ${
            highlight ? 'text-emerald-100' : 'text-slate-500'
          }`}
        >
          {label}
        </div>
        <div
          className={`mt-1 font-display text-sm font-bold leading-tight tabular-nums [overflow-wrap:anywhere] sm:text-base lg:text-lg ${
            highlight ? 'text-white' : 'text-slate-900'
          }`}
          title={value}
        >
          {value}
        </div>
      </div>
    </div>
  )
}
