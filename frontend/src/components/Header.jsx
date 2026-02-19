import { useState, useEffect } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'glass-strong shadow-lg shadow-black/40' : 'bg-transparent'
    }`}>
      {/* Top accent line */}
      <div className="h-[2px] bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 group select-none">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500
              flex items-center justify-center text-white shadow-lg shadow-indigo-500/20
              group-hover:shadow-indigo-500/30 transition-shadow duration-300">
              <i className="fas fa-shield-halved text-lg" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-black leading-none tracking-tight text-white">
              MulingNet<span className="text-indigo-400">AI</span>
            </h1>
            <p className="text-[10px] text-gray-500 font-semibold tracking-widest mt-0.5">
              QUANTUM FINANCIAL FORENSICS
            </p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Tech pills */}
          <div className="hidden md:flex items-center gap-1.5">
            <Pill icon="fa-diagram-project" label="Graph" />
            <Pill icon="fa-brain" label="ML" />
            <Pill icon="fa-atom" label="Quantum" />
            <Pill icon="fa-crosshairs" label="Disruption" />
            <Pill icon="fa-user-secret" label="AI Team" />
          </div>

          {/* Clock */}
          <span className="hidden sm:flex text-[10px] font-mono text-gray-500 tabular-nums">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>

          {/* RIFT badge */}
          <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold
            border border-emerald-500/25 bg-emerald-500/5 text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            RIFT 2026
          </span>
        </div>
      </div>
    </header>
  )
}

function Pill({ icon, label }) {
  return (
    <span className="px-2 py-1 rounded-md text-[10px] font-medium text-gray-500 bg-white/[0.03] border border-white/[0.05]
      flex items-center gap-1.5 hover:text-gray-300 hover:border-white/[0.1] transition-colors">
      <i className={`fas ${icon} text-[8px] opacity-60`} />{label}
    </span>
  )
}
