import { useRef, useEffect } from 'react'

const tabColors = {
  graph:      { bg: 'bg-blue-500/10',    border: 'border-blue-500/40',   text: 'text-blue-400',    glow: 'shadow-blue-500/20' },
  rings:      { bg: 'bg-purple-500/10',   border: 'border-purple-500/40', text: 'text-purple-400',  glow: 'shadow-purple-500/20' },
  accounts:   { bg: 'bg-red-500/10',      border: 'border-red-500/40',    text: 'text-red-400',     glow: 'shadow-red-500/20' },
  quantum:    { bg: 'bg-violet-500/10',   border: 'border-violet-500/40', text: 'text-violet-400',  glow: 'shadow-violet-500/20' },
  disruption: { bg: 'bg-orange-500/10',   border: 'border-orange-500/40', text: 'text-orange-400',  glow: 'shadow-orange-500/20' },
  crimeteam:  { bg: 'bg-emerald-500/10',  border: 'border-emerald-500/40',text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  whatif:     { bg: 'bg-cyan-500/10',     border: 'border-cyan-500/40',   text: 'text-cyan-400',    glow: 'shadow-cyan-500/20' },
  agents:     { bg: 'bg-indigo-500/10',   border: 'border-indigo-500/40', text: 'text-indigo-400',  glow: 'shadow-indigo-500/20' },
  n8n:        { bg: 'bg-amber-500/10',    border: 'border-amber-500/40',  text: 'text-amber-400',   glow: 'shadow-amber-500/20' },
}

export default function TabNav({ tabs, active, onChange }) {
  const scrollRef = useRef(null)
  const activeRef = useRef(null)

  /* Auto-scroll active tab into view */
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current
      const el = activeRef.current
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2
      container.scrollTo({ left, behavior: 'smooth' })
    }
  }, [active])

  return (
    <div className="relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-[#0a0c10] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#0a0c10] to-transparent z-10 pointer-events-none" />

      <div ref={scrollRef} className="flex gap-1.5 overflow-x-auto pb-1 px-1 scrollbar-hide scroll-smooth">
        {tabs.map((tab) => {
          const isActive = active === tab.id
          const c = tabColors[tab.id] || tabColors.graph
          return (
            <button
              key={tab.id}
              ref={isActive ? activeRef : null}
              onClick={() => onChange(tab.id)}
              className={`
                relative shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                transition-all duration-300 border
                ${isActive
                  ? `${c.bg} ${c.border} ${c.text} shadow-lg ${c.glow}`
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]'
                }
              `}
            >
              <i className={`fas ${tab.icon} text-[11px] ${isActive ? '' : 'opacity-60'}`} />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute -bottom-[1px] left-4 right-4 h-[2px] rounded-full bg-current opacity-50" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
