import { useEffect, useState } from 'react'

function AnimatedNumber({ value, duration = 1000 }) {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  const isFloat = String(value).includes('.')
  const suffix = typeof value === 'string' ? value.replace(/[\d.]/g, '') : ''
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (isNaN(numericValue)) { setDisplay(value); return }
    let start = 0
    const step = numericValue / (duration / 16)
    const t = setInterval(() => {
      start += step
      if (start >= numericValue) { start = numericValue; clearInterval(t) }
      setDisplay(isFloat ? start.toFixed(2) : Math.floor(start))
    }, 16)
    return () => clearInterval(t)
  }, [numericValue])

  return <>{display}{suffix}</>
}

const STAT_CONFIG = [
  { key: 'total_accounts_analyzed',   label: 'Accounts Analyzed',  icon: 'fa-users',       color: 'text-blue-400',   border: 'border-blue-500/20',   bg: 'bg-blue-500/[0.06]' },
  { key: 'suspicious_accounts_flagged', label: 'Suspicious Flagged', icon: 'fa-user-shield', color: 'text-red-400',    border: 'border-red-500/20',    bg: 'bg-red-500/[0.06]' },
  { key: 'fraud_rings_detected',       label: 'Fraud Rings',        icon: 'fa-ring',        color: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-500/[0.06]' },
  { key: 'processing_time_seconds',    label: 'Processing Time',    icon: 'fa-bolt',        color: 'text-emerald-400',border: 'border-emerald-500/20',bg: 'bg-emerald-500/[0.06]' },
]

export default function StatsGrid({ summary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
      {STAT_CONFIG.map((s, i) => {
        const raw = summary[s.key]
        const value = s.key === 'processing_time_seconds' ? `${raw}s` : raw

        return (
          <div key={i} className={`relative overflow-hidden glass rounded-2xl p-5 card-lift group ${s.border}`}
            style={{ animationDelay: `${i * 60}ms` }}>

            {/* Ghost icon */}
            <i className={`fas ${s.icon} absolute -right-2 -bottom-2 text-5xl opacity-[0.03] group-hover:opacity-[0.06] transition-opacity`} />

            <div className="relative z-10">
              {/* Icon */}
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <i className={`fas ${s.icon} text-sm ${s.color}`} />
              </div>

              {/* Value */}
              <div className={`text-3xl sm:text-4xl font-black tracking-tight ${s.color}`}>
                <AnimatedNumber value={value} />
              </div>

              {/* Label */}
              <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1 font-medium">{s.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
