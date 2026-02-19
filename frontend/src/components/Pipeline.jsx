const steps = [
  { icon: 'fa-file-csv',        label: 'CSV Parse',    color: 'blue' },
  { icon: 'fa-diagram-project',  label: 'Graph Agent',  color: 'purple' },
  { icon: 'fa-robot',            label: 'ML Agent',     color: 'cyan' },
  { icon: 'fa-atom',             label: 'Quantum Agent', color: 'violet' },
  { icon: 'fa-layer-group',      label: 'Aggregator',   color: 'indigo' },
  { icon: 'fa-crosshairs',       label: 'Disruption',   color: 'pink' },
  { icon: 'fa-user-secret',      label: 'Crime Team',   color: 'green' },
]

const colorMap = {
  blue:   { active: 'border-accent-blue/50 bg-accent-blue/10 text-accent-blue',     done: 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400', glow: 'rgba(56,189,248,0.25)' },
  purple: { active: 'border-accent-purple/50 bg-accent-purple/10 text-accent-purple', done: 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400', glow: 'rgba(139,92,246,0.25)' },
  cyan:   { active: 'border-accent-cyan/50 bg-accent-cyan/10 text-accent-cyan',       done: 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400', glow: 'rgba(34,211,238,0.25)' },
  violet: { active: 'border-accent-violet/50 bg-accent-violet/10 text-accent-violet', done: 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400', glow: 'rgba(167,139,250,0.25)' },
  indigo: { active: 'border-accent-indigo/50 bg-accent-indigo/10 text-accent-indigo', done: 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400', glow: 'rgba(129,140,248,0.25)' },
  pink:   { active: 'border-accent-pink/50 bg-accent-pink/10 text-accent-pink',       done: 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400', glow: 'rgba(244,114,182,0.25)' },
  green:  { active: 'border-accent-green/50 bg-accent-green/10 text-accent-green',    done: 'border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-400', glow: 'rgba(52,211,153,0.25)' },
}

export default function Pipeline({ step }) {
  if (step < 0) return null

  return (
    <div className="glass rounded-2xl p-4 overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-1.5 sm:gap-2">
        {steps.map((s, i) => {
          const cm = colorMap[s.color]
          const isDone   = i < step
          const isActive = i === step
          const isPending = i > step

          return (
            <div key={i} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div
                className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl
                  text-[11px] sm:text-xs font-semibold border transition-all duration-500
                  ${isDone ? cm.done : ''}
                  ${isActive ? cm.active : ''}
                  ${isPending ? 'border-white/[0.06] text-gray-600 bg-white/[0.02]' : ''}
                `}
                style={isActive ? { boxShadow: `0 0 14px ${cm.glow}` } : undefined}
              >
                <i className={`fas ${s.icon} ${isActive ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">{s.label}</span>
                {isDone && <i className="fas fa-check text-[9px]" />}
                {isActive && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                      style={{ backgroundColor: cm.glow }} />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
                  </span>
                )}
              </div>

              {i < steps.length - 1 && (
                <div className={`h-px w-3 sm:w-5 rounded-full transition-all duration-500 ${
                  isDone ? 'bg-emerald-500/40' : isActive ? 'bg-gradient-to-r from-current to-transparent opacity-40' : 'bg-white/[0.06]'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
